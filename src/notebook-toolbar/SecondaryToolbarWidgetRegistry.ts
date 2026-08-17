import { ToolbarRegistry, ToolbarWidgetRegistry } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import {
  PRIMARY_NOTEBOOK_TOOLBAR_FACTORY_ID,
  SECONDARY_NOTEBOOK_TOOLBAR_FACTORY_ID
} from './widgetFactory';

/**
 * this extended ToolbarWidgetRegistry allows special toolbar-widgets to be registered, that receive individual configuration from settings as 'toolbarItem'
 */
export class SecondaryToolbarWidgetRegistry extends ToolbarWidgetRegistry {
  createWidget(
    widgetFactory: string,
    widget: Widget,
    toolbarItem: ToolbarRegistry.IWidget
  ): Widget {
    const factory = this._widgets.get(widgetFactory)?.get(toolbarItem.name);
    if (factory) {
      return (
        factory as SecondaryToolbarWidgetRegistry.ToolbarWidgetFactory<Widget>
      )(widget, toolbarItem);
    }
    return super.createWidget(widgetFactory, widget, toolbarItem);
  }

  addFactory<T extends Widget>(
    widgetFactory: string,
    toolbarItemName: string,
    factory: SecondaryToolbarWidgetRegistry.ToolbarWidgetFactory<T>
  ): SecondaryToolbarWidgetRegistry.ToolbarWidgetFactory<T> | undefined {
    if (widgetFactory === PRIMARY_NOTEBOOK_TOOLBAR_FACTORY_ID) {
      //if a widget-factory is registered for the primary toolbar, register it also for the secondary toolbar
      super.addFactory(
        SECONDARY_NOTEBOOK_TOOLBAR_FACTORY_ID,
        toolbarItemName,
        factory
      );
    }
    return super.addFactory(widgetFactory, toolbarItemName, factory);
  }
}

export namespace SecondaryToolbarWidgetRegistry {
  export type ToolbarWidgetFactory<T extends Widget> = (
    main: T,
    toolbarItem?: ToolbarRegistry.IWidget
  ) => Widget;
}
