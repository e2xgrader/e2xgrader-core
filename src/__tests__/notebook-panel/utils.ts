import { NotebookPanelWithSecondaryToolbar } from '../../notebook-panel/NotebookPanelWithSecondaryToolbar';
import { Context, DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel } from '@jupyterlab/notebook';
import { NBTestUtils } from '@jupyterlab/notebook/lib/testutils';
import { NotebookWithSecondaryToolbarWidgetFactory } from '../../notebook-panel/NotebookWithSecondaryToolbarWidgetFactory';

export function createNotebookPanelWithSecondaryToolbar(
  context: Context<INotebookModel>
): NotebookPanelWithSecondaryToolbar {
  return new NotebookPanelWithSecondaryToolbar({
    content: NBTestUtils.createNotebook(context.sessionContext),
    context
  });
}

export function createNotebookWithSecondaryToolbarWidgetFactory(
  primaryToolbarFactory?: (
    widget: NotebookPanelWithSecondaryToolbar
  ) => DocumentRegistry.IToolbarItem[],
  secondaryToolbarFactory?: (
    widget: NotebookPanelWithSecondaryToolbar
  ) => DocumentRegistry.IToolbarItem[]
): NotebookWithSecondaryToolbarWidgetFactory {
  return new NotebookWithSecondaryToolbarWidgetFactory({
    name: 'notebook',
    fileTypes: ['notebook'],
    rendermime: NBTestUtils.defaultRenderMime(),
    toolbarFactory: primaryToolbarFactory,
    secondaryToolbarFactory,
    contentFactory: NBTestUtils.createNotebookPanelFactory(),
    mimeTypeService: NBTestUtils.mimeTypeService,
    editorConfig: NBTestUtils.defaultEditorConfig
  });
}
