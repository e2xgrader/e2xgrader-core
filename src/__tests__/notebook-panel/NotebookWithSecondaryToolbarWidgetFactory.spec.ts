import {initNotebookContext, NBTestUtils} from '@jupyterlab/notebook/lib/testutils';
import {Context} from "@jupyterlab/docregistry";
import {INotebookModel} from "@jupyterlab/notebook";
import {JupyterServer} from "@jupyterlab/testing";
import * as utils from './utils';
import {NotebookWithSecondaryToolbarWidgetFactory} from "../../notebook-panel/NotebookWithSecondaryToolbarWidgetFactory";
import {NotebookPanelWithSecondaryToolbar} from "../../notebook-panel/NotebookPanelWithSecondaryToolbar";
import {ToolbarButton} from "@jupyterlab/ui-components";

const rendermime = NBTestUtils.defaultRenderMime();

const server = new JupyterServer();

beforeAll(async () => {
  await server.start();
}, 30000);

afterAll(async () => {
  await server.shutdown();
});

describe('@e2xgrader/core', () => {
  describe('NotebookWithSecondaryToolbarWidgetFactory', () => {
    let context: Context<INotebookModel>;

    beforeEach(async () => {
      context = await initNotebookContext();
    });

    afterEach(() => {
      context.dispose();
    });

    describe('#constructor()', () => {
      it('should create a notebook-with-secondary-toolbar widget factory', () => {
        const factory = utils.createNotebookWithSecondaryToolbarWidgetFactory();
        expect(factory).toBeInstanceOf(NotebookWithSecondaryToolbarWidgetFactory);
      });
    });

    describe('#createNew()', () => {
      it('should create a new `NotebookPanelWithSecondaryToolbar` widget', () => {
        const factory = utils.createNotebookWithSecondaryToolbarWidgetFactory();
        const panel = factory.createNew(context);
        expect(panel).toBeInstanceOf(NotebookPanelWithSecondaryToolbar);
      });

      it('should create a clone of the rendermime', () => {
        const factory = utils.createNotebookWithSecondaryToolbarWidgetFactory();
        const panel = factory.createNew(context);
        expect(panel.content.rendermime).not.toBe(rendermime);
      });

      it('should populate the default primary toolbar items', () => { //just to make sure, that the primary toolbar still works
        const factory = utils.createNotebookWithSecondaryToolbarWidgetFactory();
        const panel = factory.createNew(context);
        // It will only contain the popup opener
        expect(Array.from(panel.toolbar.names())).toHaveLength(1);
      });

      it('should populate the default secondary toolbar items', () => {
        const factory = utils.createNotebookWithSecondaryToolbarWidgetFactory();
        const panel = factory.createNew(context);
        // It will only contain the popup opener
        expect(Array.from(panel.secondaryToolbar.names())).toHaveLength(1);
      });

      it('should populate the customized toolbar items in both toolbars', () => {
        const primaryToolbarFactory = () => [
          { name: 'foo', widget: new ToolbarButton() },
          { name: 'bar', widget: new ToolbarButton() },
          { name: 'baz', widget: new ToolbarButton() },
        ];
        const secondaryToolbarFactory = () => [
          { name: 'baz', widget: new ToolbarButton() },
          { name: 'qux', widget: new ToolbarButton() }
        ];
        const factory = utils.createNotebookWithSecondaryToolbarWidgetFactory(primaryToolbarFactory, secondaryToolbarFactory);
        const panel = factory.createNew(context);
        const panel2 = factory.createNew(context);
        expect(Array.from(panel.toolbar.names())).toEqual([
          'foo',
          'bar',
          'baz',
          'toolbar-popup-opener'
        ]);
        expect(Array.from(panel.secondaryToolbar.names())).toEqual([
          'baz',
          'qux',
          'toolbar-popup-opener'
        ]);
        expect(Array.from(panel2.toolbar.names())).toEqual([
          'foo',
          'bar',
          'baz',
          'toolbar-popup-opener'
        ]);
        expect(Array.from(panel2.secondaryToolbar.names())).toEqual([
          'baz',
          'qux',
          'toolbar-popup-opener'
        ]);
        expect(Array.from(panel.toolbar.children()).length).toBe(4);
        expect(Array.from(panel.secondaryToolbar.children()).length).toBe(3);
        expect(Array.from(panel2.toolbar.children()).length).toBe(4);
        expect(Array.from(panel2.secondaryToolbar.children()).length).toBe(3);
      });

      it('should clone from the optional source widget', () => {
        const factory = utils.createNotebookWithSecondaryToolbarWidgetFactory();
        const panel = factory.createNew(context);
        const clone = factory.createNew(panel.context, panel);
        expect(clone).toBeInstanceOf(NotebookPanelWithSecondaryToolbar);
        expect(clone.content.rendermime).toBe(panel.content.rendermime);
        expect(clone.content.editorConfig).toBe(panel.content.editorConfig);
        expect(clone.content.notebookConfig).toBe(panel.content.notebookConfig);
      });
    });
  });
});