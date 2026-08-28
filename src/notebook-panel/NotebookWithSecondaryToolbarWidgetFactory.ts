import { DocumentRegistry } from '@jupyterlab/docregistry';
import type { INotebookModel } from '@jupyterlab/notebook';
import {
  NotebookPanel,
  NotebookHistory,
  NotebookWidgetFactory
} from '@jupyterlab/notebook';
import { NotebookPanelWithSecondaryToolbar } from './NotebookPanelWithSecondaryToolbar';
import { IObservableList } from '@jupyterlab/observables';
import { setSecondaryToolbar } from './setSecondaryToolbar';
import { Widget } from '@lumino/widgets';
import { ToolbarRegistry } from '@jupyterlab/apputils';

/**
 * A widget factory for notebook panels.
 */
export class NotebookWithSecondaryToolbarWidgetFactory extends NotebookWidgetFactory {
  private _secondaryToolbarFactory:
    | ((
        widget: NotebookPanelWithSecondaryToolbar
      ) =>
        | DocumentRegistry.IToolbarItem[]
        | IObservableList<DocumentRegistry.IToolbarItem>)
    | undefined;

  /**
   * Construct a new notebook widget factory.
   *
   * @param options - The options used to construct the factory.
   */
  constructor(
    options: NotebookWithSecondaryToolbarWidgetFactory.IOptions<NotebookPanelWithSecondaryToolbar>
  ) {
    super(options as NotebookWidgetFactory.IOptions<NotebookPanel>);
    this._secondaryToolbarFactory = options.secondaryToolbarFactory;
  }

  /**
   * Create a new widget.
   *
   * #### Notes
   * The factory will start the appropriate kernel.
   */
  protected override createNewWidget(
    context: DocumentRegistry.IContext<INotebookModel>,
    source?: NotebookPanelWithSecondaryToolbar
  ): NotebookPanelWithSecondaryToolbar {
    const translator = (context as any).translator;
    const kernelHistory = new NotebookHistory({
      sessionContext: context.sessionContext,
      translator: translator
    });
    const nbOptions = {
      rendermime: source
        ? source.content.rendermime
        : this.rendermime.clone({ resolver: context.urlResolver }),
      contentFactory: this.contentFactory,
      mimeTypeService: this.mimeTypeService,
      editorConfig: source ? source.content.editorConfig : this.editorConfig,
      notebookConfig: source
        ? source.content.notebookConfig
        : this.notebookConfig,
      translator,
      kernelHistory
    };
    const content = this.contentFactory.createNotebook(nbOptions);

    return new NotebookPanelWithSecondaryToolbar({ context, content });
  }

  createNew(
    context: DocumentRegistry.IContext<INotebookModel>,
    source?: NotebookPanel
  ): NotebookPanelWithSecondaryToolbar {
    const widget: NotebookPanelWithSecondaryToolbar = super.createNew(context, source) as NotebookPanelWithSecondaryToolbar;

    setSecondaryToolbar(
      widget,
      (this._secondaryToolbarFactory ??
        this.defaultToolbarFactory.bind(this)) as (
        widget: Widget
      ) =>
        | IObservableList<ToolbarRegistry.IToolbarItem>
        | ToolbarRegistry.IToolbarItem[]
    );

    return widget;
  }
}

export namespace NotebookWithSecondaryToolbarWidgetFactory {
  export interface IOptions<
    T extends NotebookPanelWithSecondaryToolbar
  > extends NotebookWidgetFactory.IOptions<T> {
    readonly secondaryToolbarFactory?: (
      widget: T
    ) =>
      | DocumentRegistry.IToolbarItem[]
      | IObservableList<DocumentRegistry.IToolbarItem>;
  }
}
