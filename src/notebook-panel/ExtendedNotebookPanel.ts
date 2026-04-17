import { DocumentWidget } from '@jupyterlab/docregistry';
import { INotebookModel, Notebook, NotebookPanel } from '@jupyterlab/notebook';
import { Toolbar, ReactiveToolbar } from '@jupyterlab/ui-components';
import { Widget, BoxLayout } from '@lumino/widgets';
import { nullTranslator } from '@jupyterlab/translation';

export const NOTEBOOK_PANEL_SECONDARY_TOOLBAR_CLASS =
  'jp-NotebookPanel-toolbar-secondary';

export class ExtendedNotebookPanel extends NotebookPanel {
  private _secondaryToolbar: Toolbar<Widget>;

  /**
   * Construct a new notebook panel.
   */
  constructor(options: DocumentWidget.IOptions<Notebook, INotebookModel>) {
    super(options);

    const trans = (options.translator || nullTranslator).load('jupyterlab');

    this._secondaryToolbar = new ReactiveToolbar({ noFocusOnClick: true });
    this._secondaryToolbar.node.setAttribute('role', 'toolbar');
    this._secondaryToolbar.node.setAttribute(
      'aria-label',
      trans.__('main area secondary toolbar')
    );

    (this.layout! as BoxLayout).insertWidget(1, this.secondaryToolbar);

    this.secondaryToolbar.addClass(NOTEBOOK_PANEL_SECONDARY_TOOLBAR_CLASS);
  }

  /**
   * The secondary toolbar hosted by the widget.
   */
  get secondaryToolbar(): Toolbar {
    return this._secondaryToolbar;
  }
}
