import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { NotebookPanel } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { E2xGraderCellRegistry } from './cell_registry/registry';
import { E2XContentFactory } from './cell_factory/factory';

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

export default [
  cellRegistryPlugin,
  cellFactoryPlugin
] as JupyterFrontEndPlugin<any>[];
export * from './cell_registry/cell';
export * from './cell_registry/registry';
export * from './cell_factory/factory';
export * from './model/gradingcell';
export * from './model/nbgrader';
export * from './model/e2xgrader';
export * from './toolbar/toolbar';
