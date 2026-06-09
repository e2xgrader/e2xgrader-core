import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { E2xGraderCellRegistry } from './cell_registry/registry';
import { E2XContentFactory } from './cell_factory/factory';
import {
  INotebookWidgetFactory,
  NotebookWidgetFactory,
  NotebookPanel
} from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import {
  IToolbarWidgetRegistry,
  ISessionContextDialogs,
  ToolbarWidgetRegistry
} from '@jupyterlab/apputils';
import { ITranslator } from '@jupyterlab/translation';
import { activateWidgetFactory } from './notebook-toolbar/widgetFactory';
import { createDefaultFactory } from './notebook-toolbar/toolbarRegistry';

const plugin_ids = {
  cellRegistry: '@e2xgrader/core:cell-registry',
  cellFactory: '@e2xgrader/core:cell-factory'
};

const cellRegistryPlugin: JupyterFrontEndPlugin<E2xGraderCellRegistry.IE2xGraderCellRegistry> =
  {
    id: plugin_ids.cellRegistry,
    provides: E2xGraderCellRegistry.IE2xGraderCellRegistry,
    autoStart: true,
    activate: (app: JupyterFrontEnd) => {
      console.log(
        'JupyterLab extension @e2xgrader/core:cell-registry is activated!'
      );
      const registry = new E2xGraderCellRegistry.E2xGraderCellRegistry();
      app.serviceManager.ready.then(() => {
        console.log('JupyterLab service manager is ready.');
        // You can perform any additional setup here if needed
      });
      return registry;
    }
  };

const cellFactoryPlugin: JupyterFrontEndPlugin<NotebookPanel.IContentFactory> =
  {
    id: plugin_ids.cellFactory,
    requires: [E2xGraderCellRegistry.IE2xGraderCellRegistry, IEditorServices],
    optional: [ISettingRegistry],
    provides: NotebookPanel.IContentFactory,
    autoStart: true,
    activate: async (
      app: JupyterFrontEnd,
      registry: E2xGraderCellRegistry.IE2xGraderCellRegistry,
      editorServices: IEditorServices,
      settingRegistry: ISettingRegistry | null
    ) => {
      console.log(
        'JupyterLab extension @e2xgrader/core:cell-factory is activated!'
      );
      // You can perform any additional setup here if needed
      const editorFactory = editorServices.factoryService.newInlineEditor;
      let contentFactory: E2XContentFactory;
      if (settingRegistry) {
        const settings = await settingRegistry.load(plugin_ids.cellFactory);
        contentFactory = new E2XContentFactory(
          { editorFactory },
          settings,
          registry
        );
      } else {
        contentFactory = new E2XContentFactory(
          { editorFactory },
          undefined,
          registry
        );
      }
      console.log('Content factory created:', contentFactory);
      return contentFactory;
    }
  };

/**
 * Initialization data for the @e2xgrader/core:widget-factory extension.
 */
const widgetFactoryPlugin: JupyterFrontEndPlugin<NotebookWidgetFactory.IFactory> =
  {
    id: '@e2xgrader-extension/core:widget-factory',
    description:
      'A JupyterLab that replaces the native notebook-widget-factory extension to achieve an empty notebook toolbar.',
    provides: INotebookWidgetFactory,
    requires: [
      NotebookPanel.IContentFactory,
      IEditorServices,
      IRenderMimeRegistry,
      IToolbarWidgetRegistry
    ],
    optional: [ISettingRegistry, ISessionContextDialogs, ITranslator],
    activate: activateWidgetFactory,
    autoStart: true
  };

/**
 * Initialization data for the @e2xgrader/core:toolbar-registry extension.
 */
const toolbarRegistryPlugin: JupyterFrontEndPlugin<IToolbarWidgetRegistry> = {
  id: '@e2xgrader/core:toolbar-registry',
  description: 'Provides toolbar items registry.',
  autoStart: true,
  provides: IToolbarWidgetRegistry,
  activate: (app: JupyterFrontEnd) => {
    return new ToolbarWidgetRegistry({
      defaultFactory: createDefaultFactory(app.commands)
    });
  }
};

export default [
  cellRegistryPlugin,
  cellFactoryPlugin,
  widgetFactoryPlugin,
  toolbarRegistryPlugin
] as JupyterFrontEndPlugin<any>[];
export * from './cell_registry/cell';
export * from './cell_registry/registry';
export * from './cell_factory/factory';
export * from './model/gradingcell';
export * from './model/nbgrader';
export * from './model/e2xgrader';
export * from './toolbar/toolbar';
export * from './notebook-toolbar/toolbarLabel';
export * from './apis/SharedMaterialsAPI';
export * from './apis/AssignmentListAPI'
