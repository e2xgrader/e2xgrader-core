import { MarkdownCell } from '@jupyterlab/cells';
import { Widget } from '@lumino/widgets';
import { Notebook } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { E2xGraderCellRegistry } from './registry';
import { E2xGraderMetadata } from '../model/e2xgrader';
export const E2X_METADATA_KEY = 'extended_cell';
export const E2X_GRADER_SETTINGS_CLASS = 'e2x_grader_options';
export const E2X_UNRENDER_BUTTON_CLASS = 'e2x_unrender';
export const E2X_BUTTON_CLASS = 'e2x_btn';

/**
 * Namespace for E2XMarkdownCell options.
 * It extends the options of the standard MarkdownCell.
 */
export namespace E2XMarkdownCell {
  export interface IOptions extends MarkdownCell.IOptions {
    settings?: ISettingRegistry.ISettings;
    registry?: E2xGraderCellRegistry.IE2xGraderCellRegistry;
  }
}

/**
 * Represents an E2X Markdown cell, extending the functionality of a standard Markdown cell.
 * This class includes additional metadata handling, rendering logic, and grader section rendering.
 */
export class E2XMarkdownCell extends MarkdownCell {
  /**
   * Stores the last content of the cell as a string.
   * This is used to keep track of the previous state of the cell's content.
   *
   * @private
   */
  private __lastContent: string = '';

  private readonly _settings?: ISettingRegistry.ISettings;

  private readonly _registry?: E2xGraderCellRegistry.IE2xGraderCellRegistry;

  private _graderSection?: HTMLElement;

  /**
   * Constructs a new MarkdownCell instance.
   *
   * @param options - The options used to initialize the MarkdownCell.
   *
   * Initializes the MarkdownCell with the provided options, sets the
   * `showEditorForReadOnly` property to `false`, logs the current instance
   * to the console, and sets the metadata using the `cleanMetadata` method.
   */
  constructor(options: E2XMarkdownCell.IOptions) {
    super(options);
    this._settings = options.settings;
    if (this._settings) {
      this._settings.changed.connect(this.onSettingsUpdated, this);
    }
    this._registry = options.registry;
    if (this._registry) {
      this._registry.pluginRegistered.connect(this.onCellRegistered, this);
    }
    this.showEditorForReadOnly = false;
  }

  private get editMode(): boolean {
    if (this._settings) {
      return this._settings.get('edit_mode').composite as boolean;
    }
    return false;
  }

  private onSettingsUpdated(settings: ISettingRegistry.ISettings): void {
    if (this._graderSection) {
      this._graderSection.hidden = !(settings.get('edit_mode')
        .composite as boolean);
    }
  }

  private onCellRegistered(
    _sender: E2xGraderCellRegistry.IE2xGraderCellRegistry,
    args: { plugin: E2xGraderCellRegistry.IE2xGraderCellPlugin }
  ): void {
    const cellType = args.plugin.cellType;
    const renderCell = args.plugin.renderCell;
    console.log(
      `Cell type registered: ${cellType}, render function: ${renderCell}`
    );
    if (this.e2xCellType === cellType) {
      this.rendered = false;
      this._waitForRender(this, 2).then(() => {
        this.postRender(this);
      });
    }
  }

  /**
   * Gets the source content of the cell.
   * If the source content is not available, it returns a default string
   * indicating to type Markdown and LaTeX.
   *
   * @returns {string} The source content of the cell or a default string.
   */
  get source(): string {
    return (
      this.model?.sharedModel.getSource() || 'Type Markdown and LaTeX: $ a^2 $'
    );
  }

  /**
   * Checks if the content of the cell has changed since the last render.
   *
   * @returns {boolean} - Returns `true` if the content has changed, otherwise `false`.
   */
  private get contentChanged(): boolean {
    return this.__lastContent !== this.source;
  }

  /**
   * Retrieves the default metadata for E2x cells.
   *
   * @returns {Partial<E2xMetadata.IE2xMetadata>} The default metadata values.
   */
  protected get metadataDefaults(): Partial<E2xGraderMetadata.IE2xGraderMetadata> {
    return E2xGraderMetadata.E2X_METADATA_DEFAULTS;
  }

  get e2xMetadata(): any {
    return this.model?.getMetadata(E2X_METADATA_KEY) ?? {};
  }

  get e2xCellType(): string | undefined {
    return this.e2xMetadata.type;
  }

  /**
   * Sets the e2x cell type and updates the notebook model accordingly.
   *
   * @param value - The new cell type to be set. It can be a string or undefined.
   *
   * When the cell type is changed, this method updates the cell's metadata field
   * with the new type, converts the current cell model to JSON, inserts a new cell
   * with the updated model at the next index, and deletes the old cell.
   */
  set e2xCellType(value: string | undefined) {
    const oldCellType = this.e2xCellType;
    if (value !== oldCellType) {
      this.setE2xMetadataField('type', value);
      const model = this.model.toJSON();
      const index = this.cellIndex;
      this.notebook.model?.sharedModel.insertCell(index + 1, model);
      this.notebook.model?.sharedModel.deleteCell(index);
    }
  }

  public getE2xMetadataField(field: string, default_value: any = {}): any {
    return this.e2xMetadata?.[field] ?? default_value;
  }

  public setE2xMetadataField(field: string, value: any): void {
    const metadata = this.e2xMetadata;
    metadata[field] = value;
    this.model?.setMetadata(E2X_METADATA_KEY, metadata);
  }

  /**
   * Waits for the render of a widget to complete within a specified timeout.
   *
   * This method checks if the widget's node contains a child element with the class
   * 'jp-RenderedMarkdown'. If the element is found, it resolves the promise with the widget.
   * If not, it continues to check at intervals defined by the timeout parameter.
   *
   * @param widget - The widget to wait for rendering.
   * @param timeout - The interval in milliseconds to wait between checks.
   * @returns A promise that resolves with the widget once it has rendered.
   */
  protected _waitForRender(widget: Widget, timeout: number): Promise<Widget> {
    return new Promise<Widget>(resolve => {
      function waitReady() {
        const firstChild = widget.node.querySelector('.jp-RenderedMarkdown *');
        if (firstChild) {
          resolve(widget);
        } else {
          setTimeout(waitReady, timeout);
        }
      }
      waitReady();
    });
  }

  /**
   * Renders the input widget and performs additional operations after rendering.
   *
   * This method sets the cell to read-only mode, calls the superclass's renderInput method,
   * and then checks if the content has changed. If the content has changed, it waits for the
   * rendering to complete and then performs post-render operations including rendering the
   * grader section.
   *
   * @param widget - The widget to be rendered.
   */
  protected renderInput(widget: Widget): void {
    if (this.e2xCellType) {
      this.readOnly = true;
    }
    super.renderInput(widget);
    if (this.contentChanged) {
      this._waitForRender(widget, 2).then((widget: Widget) => {
        this.postRender(widget);
      });
      this.__lastContent = this.source;
    }
  }

  /**
   * This method is called after the widget has been rendered.
   * It is intended to be overridden by subclasses to perform
   * any post-rendering operations. The default implementation
   * does nothing.
   *
   * @param widget - The widget that has been rendered.
   */
  protected async postRender(widget: Widget): Promise<void> {
    if (this._registry && this.e2xCellType) {
      const plugin = this._registry.getPlugin(this.e2xCellType);
      if (plugin) {
        await plugin.renderCell(widget, this);
      }
      this.renderGraderSection(widget);
    }
  }

  /**
   * Renders the grader section for the E2XMarkdownCell.
   *
   * This method creates a grader section with a horizontal rule and an "Edit Cell" button,
   * and appends it to the provided widget's HTML node. The "Edit Cell" button, when clicked,
   * sets the cell to be editable and not rendered.
   *
   * @param widget - The widget to which the grader section will be appended.
   */
  private renderGraderSection(widget: Widget): void {
    if (!this.e2xCellType) {
      return;
    }
    if (!this._registry?.getPluginTypes().includes(this.e2xCellType)) {
      return;
    }
    const html = widget.node;
    const grader = document.createElement('div');
    grader.appendChild(document.createElement('hr'));
    grader.className = E2X_GRADER_SETTINGS_CLASS;
    const unrenderButton = document.createElement('button');
    unrenderButton.classList.add(E2X_UNRENDER_BUTTON_CLASS, E2X_BUTTON_CLASS);
    unrenderButton.textContent = 'Edit Cell';
    unrenderButton.onclick = () => {
      this.readOnly = false;
      this.rendered = false;
    };
    grader.appendChild(unrenderButton);
    this._graderSection = grader;
    if (!this.editMode) {
      grader.hidden = true;
    }
    // Check whether the grader section already exists
    const existingGrader = html.querySelector(`.${E2X_GRADER_SETTINGS_CLASS}`);
    if (existingGrader) {
      html.removeChild(existingGrader);
    }
    html.appendChild(grader);
  }

  protected get notebook(): Notebook {
    return this.parent as Notebook;
  }

  protected get cellIndex(): number {
    return this.notebook.widgets.findIndex(widget => widget === this);
  }
}
