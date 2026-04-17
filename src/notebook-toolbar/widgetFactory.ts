import { JupyterFrontEnd } from '@jupyterlab/application';

import {
  NotebookWidgetFactory,
  NotebookPanel,
  StaticNotebook,
  ToolbarItems,
  ExecutionIndicator
} from '@jupyterlab/notebook';

import { IEditorServices } from '@jupyterlab/codeeditor';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import {
  createToolbarFactory,
  ISessionContextDialogs,
  IToolbarWidgetRegistry,
  SessionContextDialogs,
  Toolbar
} from '@jupyterlab/apputils';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { ITranslator, nullTranslator } from '@jupyterlab/translation';

import { PageConfig } from '@jupyterlab/coreutils';

import { IObservableList } from '@jupyterlab/observables';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { ToolbarItems as DocToolbarItems } from '@jupyterlab/docmanager-extension';

/**
 * The name of the factory that creates notebooks.
 */
const FACTORY = 'Notebook';

/**
 * Setting Id storing the customized toolbar definition.
 */
export const PANEL_SETTINGS = '@e2xgrader/core:panel';

const TRACKER_PLUGIN_ID = '@jupyterlab/notebook-extension:tracker';

export function activateWidgetFactory(
  app: JupyterFrontEnd,
  contentFactory: NotebookPanel.IContentFactory,
  editorServices: IEditorServices,
  rendermime: IRenderMimeRegistry,
  toolbarRegistry: IToolbarWidgetRegistry,
  settingRegistry: ISettingRegistry | null,
  sessionContextDialogs_: ISessionContextDialogs | null,
  translator_: ITranslator | null
): NotebookWidgetFactory.IFactory {
  const translator = translator_ ?? nullTranslator;
  const sessionContextDialogs =
    sessionContextDialogs_ ?? new SessionContextDialogs({ translator });
  const preferKernelOption = PageConfig.getOption('notebookStartsKernel');

  // If the option is not set, assume `true`
  const preferKernelValue =
    preferKernelOption === '' || preferKernelOption.toLowerCase() === 'true';

  const { commands } = app;
  let toolbarFactory:
    | ((
        widget: NotebookPanel
      ) =>
        | DocumentRegistry.IToolbarItem[]
        | IObservableList<DocumentRegistry.IToolbarItem>)
    | undefined;

  /* Register notebook toolbar widgets
    These Widgets implement toolbar items with special functionalities (everything that is not handled by the default-factory),
    the save button or the cell-type dropdown.
    Registering a factory will not immediately add a widget to the toolbar, it will only provide the implementation.
    It is still necessary to define a toolbar-item via JSON. The item will be created by the factory with the mathing name.
   */
  toolbarRegistry.addFactory<NotebookPanel>(FACTORY, 'save', panel =>
    DocToolbarItems.createSaveButton(commands, panel.context.fileChanged)
  );
  toolbarRegistry.addFactory<NotebookPanel>(FACTORY, 'cellType', panel =>
    ToolbarItems.createCellTypeItem(panel, translator)
  );

  toolbarRegistry.addFactory<NotebookPanel>(FACTORY, 'kernelName', panel =>
    Toolbar.createKernelNameItem(
      panel.sessionContext,
      sessionContextDialogs,
      translator
    )
  );

  toolbarRegistry.addFactory<NotebookPanel>(
    FACTORY,
    'executionProgress',
    panel => {
      const loadingSettings = settingRegistry?.load(TRACKER_PLUGIN_ID);
      const indicator = ExecutionIndicator.createExecutionIndicatorItem(
        panel,
        translator,
        loadingSettings
      );

      void loadingSettings?.then(settings => {
        panel.disposed.connect(() => {
          settings.dispose();
        });
      });

      return indicator;
    }
  );

  /* create the default notebook toolbar factory
    This factory handles all simple toolbar items like command-buttons, spacers and labels
   */
  if (settingRegistry) {
    toolbarFactory = createToolbarFactory(
      toolbarRegistry,
      settingRegistry,
      FACTORY,
      PANEL_SETTINGS,
      translator
    );
  }

  const trans = translator.load('jupyterlab');

  const factory = new NotebookWidgetFactory({
    name: FACTORY,
    label: trans.__('Notebook'),
    fileTypes: ['notebook'],
    modelName: 'notebook',
    defaultFor: ['notebook'],
    preferKernel: preferKernelValue,
    canStartKernel: true,
    rendermime,
    contentFactory,
    editorConfig: StaticNotebook.defaultEditorConfig,
    notebookConfig: StaticNotebook.defaultNotebookConfig,
    mimeTypeService: editorServices.mimeTypeService,
    toolbarFactory,
    translator
  });
  app.docRegistry.addWidgetFactory(factory);

  return factory;
}
