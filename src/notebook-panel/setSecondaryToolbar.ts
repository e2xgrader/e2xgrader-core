import { IObservableList } from '@jupyterlab/observables';
import { Widget } from '@lumino/widgets';
import { Toolbar } from '@jupyterlab/ui-components';
import { ToolbarRegistry } from '@jupyterlab/apputils';
import { findIndex } from '@lumino/algorithm';

/**
 * Set the toolbar items of a widget from a factory
 *
 * @param widget Widget with the toolbar to set
 * @param factory Toolbar items factory
 * @param toolbar Separated toolbar if widget is a raw widget
 */
export function setSecondaryToolbar(
  widget: Toolbar.IWidgetToolbar | Widget,
  factory: (
    widget: Widget
  ) =>
    | IObservableList<ToolbarRegistry.IToolbarItem>
    | ToolbarRegistry.IToolbarItem[],
  toolbar?: Toolbar
): void {
  // @ts-expect-error Widget has no toolbar
  if (!widget.secondaryToolbar && !toolbar) {
    console.log(
      `Widget ${widget.id} has no 'toolbar' and no explicit toolbar was provided.`
    );
    return;
  }

  // @ts-expect-error Widget has no toolbar
  const toolbar_ = (widget.secondaryToolbar as Toolbar) ?? toolbar;

  const items = factory(widget);

  if (Array.isArray(items)) {
    items.forEach(({ name, widget: item }) => {
      toolbar_.addItem(name, item);
    });
  } else {
    const updateToolbar = (
      list: IObservableList<ToolbarRegistry.IToolbarItem>,
      changes: IObservableList.IChangedArgs<ToolbarRegistry.IToolbarItem>
    ) => {
      switch (changes.type) {
        case 'add':
          changes.newValues.forEach((item, index) => {
            toolbar_.insertItem(
              changes.newIndex + index,
              item.name,
              item.widget
            );
          });
          break;
        case 'move':
          changes.oldValues.forEach(item => {
            item.widget.parent = null;
          });
          changes.newValues.forEach((item, index) => {
            toolbar_.insertItem(
              changes.newIndex + index,
              item.name,
              item.widget
            );
          });
          break;
        case 'remove':
          changes.oldValues.forEach(item => {
            item.widget.parent = null;
          });
          break;
        case 'set':
          changes.oldValues.forEach(item => {
            item.widget.parent = null;
          });

          changes.newValues.forEach((item, index) => {
            const existingIndex = findIndex(
              toolbar_.names(),
              name => item.name === name
            );
            if (existingIndex >= 0) {
              Array.from(toolbar_.children())[existingIndex].parent = null;
            }

            toolbar_.insertItem(
              changes.newIndex + index,
              item.name,
              item.widget
            );
          });
          break;
        case 'clear':
          Array.from(toolbar_.children()).forEach(child => {
            child.parent = null;
          });
          break;
      }
    };

    updateToolbar(items, {
      newIndex: 0,
      newValues: Array.from(items),
      oldIndex: 0,
      oldValues: [],
      type: 'add'
    });

    items.changed.connect(updateToolbar);
    widget.disposed.connect(() => {
      items.changed.disconnect(updateToolbar);
    });
  }
}
