import { DocumentRegistry } from '@jupyterlab/docregistry';
import type { INotebookModel } from '@jupyterlab/notebook';
import {
  NotebookPanel,
  NotebookHistory,
  NotebookWidgetFactory
} from '@jupyterlab/notebook';
import { ExtendedNotebookPanel } from './ExtendedNotebookPanel';
import { IObservableList } from '@jupyterlab/observables';
import { setSecondaryToolbar } from './setSecondaryToolbar';

/**
 * A widget factory for notebook panels.
 */
export class ExtendedNotebookWidgetFactory extends NotebookWidgetFactory {
  private _secondaryToolbarFactory:
    | ((
        widget: NotebookPanel
      ) =>
        | DocumentRegistry.IToolbarItem[]
        | IObservableList<DocumentRegistry.IToolbarItem>)
    | undefined;

  /**
   * Construct a new notebook widget factory.
   *
   * @param options - The options used to construct the factory.
   */
  constructor(options: ExtendedNotebookWidgetFactory.IOptions<NotebookPanel>) {
    super(options);
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
    source?: NotebookPanel
  ): NotebookPanel {
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

    return new ExtendedNotebookPanel({ context, content });
  }

  createNew(
    context: DocumentRegistry.IContext<INotebookModel>,
    source?: NotebookPanel
  ): NotebookPanel {
    const widget = super.createNew(context, source);

    console.log(this._secondaryToolbarFactory);

    setSecondaryToolbar(
      widget,
      // @ts-ignore
      this._secondaryToolbarFactory ?? this.defaultToolbarFactory.bind(this)
    );

    return widget;
  }
}

export namespace ExtendedNotebookWidgetFactory {
  export interface IOptions<
    T extends NotebookPanel
  > extends NotebookWidgetFactory.IOptions<T> {
    readonly secondaryToolbarFactory?: (
      widget: T
    ) =>
      | DocumentRegistry.IToolbarItem[]
      | IObservableList<DocumentRegistry.IToolbarItem>;
  }
}
