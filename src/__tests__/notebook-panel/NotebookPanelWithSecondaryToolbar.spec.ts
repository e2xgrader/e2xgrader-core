import type { Context } from '@jupyterlab/docregistry';
import {
  initNotebookContext,
  NBTestUtils
} from '@jupyterlab/notebook/lib/testutils';
import { JupyterServer } from '@jupyterlab/testing';
import type { INotebookModel } from '@jupyterlab/notebook';
import { NotebookPanelWithSecondaryToolbar } from '../../notebook-panel/NotebookPanelWithSecondaryToolbar';
import * as utils from './utils';
import { Toolbar } from '@jupyterlab/ui-components';

const server = new JupyterServer();

beforeAll(async () => {
  await server.start();
}, 30000);

afterAll(async () => {
  await server.shutdown();
});

describe('@e2xgrader/core', () => {
  describe('NotebookPanelWithSecondaryToolbar', () => {
    let context: Context<INotebookModel>;

    beforeEach(async () => {
      context = await initNotebookContext();
    });

    afterEach(() => {
      context.dispose();
    });

    describe('#constructor()', () => {
      it('should create a notebook panel with secondary toolbar', () => {
        const content = NBTestUtils.createNotebook();
        const panel = new NotebookPanelWithSecondaryToolbar({
          context,
          content
        });
        expect(panel).toBeInstanceOf(NotebookPanelWithSecondaryToolbar);
      });
    });

    describe('#secondaryToolbar', () => {
      it('should be the secondary toolbar used by the widget', () => {
        const panel = utils.createNotebookPanelWithSecondaryToolbar(context);
        expect(panel.secondaryToolbar).toBeInstanceOf(Toolbar);
      });
    });
  });
});
