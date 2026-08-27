import { ToolbarRegistry } from '@jupyterlab/apputils';
import { LabIcon, Toolbar } from '@jupyterlab/ui-components';
import { CommandRegistry } from '@lumino/commands';
import { Widget } from '@lumino/widgets';
import { createDefaultFactory as originalCreateDefaultFactory } from '@jupyterlab/apputils';
import { ToolbarLabel } from './toolbarLabel';
import { PartialJSONObject } from '@lumino/coreutils';
import { ToolbarDropdownComponent } from './toolbarDropdownComponent';

const TOOLBAR_DROPDOWN_ITEM_DEFAULT_RANK = 50;

/**
 * Create the default toolbar item widget factory
 *
 * @param commands Application commands registry
 * @returns Default factory
 */
export function createDefaultFactory(
  commands: CommandRegistry
): (
  widgetFactory: string,
  widget: Widget,
  toolbarItem: ExamToolbarRegistry.IWidget
) => Widget {
  const originalDefaultFactory = originalCreateDefaultFactory(commands);
  return (
    widgetFactory: string,
    widget: Widget,
    toolbarItem: ExamToolbarRegistry.IWidget
  ) => {
    switch (toolbarItem.type ?? 'command') {
      case 'label': {
        const {
          args: tArgs,
          label: tLabel,
          caption: tCaption,
          icon: tIcon
        } = toolbarItem;
        const id = toolbarItem?.tId ?? '';
        const args = { toolbar: true, ...(tArgs as PartialJSONObject) };
        const icon = tIcon
          ? LabIcon.resolve({ icon: tIcon as string })
          : undefined;

        // If there is an icon, undefined label will results in no label
        // otherwise the label will be set using the setting or the command label
        const label = icon ? (tLabel ?? '') : tLabel;
        return new ToolbarLabel({
          id: id as string,
          args,
          icon,
          label: label as string,
          caption: tCaption as string
        });
      }
      case 'dropdown': {
        const {
          args: tArgs,
          label: tLabel,
          caption: tCaption,
          alignRight: tAlignRight,
          icon: tIcon,
          dropdownItems: tDropdownItems
        } = toolbarItem;
        const id = toolbarItem?.tId ?? '';
        const args = { toolbar: true, ...(tArgs as PartialJSONObject) };
        const entries: ExamToolbarRegistry.IDropdownItemWidget[] =
          Array.isArray(tDropdownItems)
            ? (tDropdownItems.filter(
                val => !!val
              ) as ExamToolbarRegistry.IDropdownItemWidget[])
            : [];
        const icon = tIcon
          ? LabIcon.resolve({ icon: tIcon as string })
          : undefined;

        // If there is an icon, undefined label will result in no label
        // otherwise the label will be set using the setting or the command label
        const label = icon ? (tLabel ?? '') : tLabel;
        return new ToolbarDropdownComponent({
          id: id as string,
          args,
          icon,
          label: label as string,
          caption: tCaption as string,
          alignRight: tAlignRight === true,
          commands,
          dropdownItems: entries
            .filter(val => !!val)
            .map((command: ExamToolbarRegistry.IDropdownItemWidget) => {
              const {
                command: cId,
                args: cArgs,
                label: cLabel,
                caption: cCaption,
                type: cType,
                icon: cIcon,
                rank: cRank,
                disabled: cDisabled
              } = command;
              const id: string = typeof cId === 'string' ? cId : '';
              const args = { toolbar: true, ...(cArgs as PartialJSONObject) };
              const icon = cIcon
                ? LabIcon.resolve({ icon: cIcon as string })
                : undefined;

              const toolbar = (widget as any).toolbar as Toolbar;

              // If there is an icon, undefined label will result in no label
              // otherwise the label will be set using the setting or the command label
              const label:
                CommandRegistry.CommandFunc<string> | string | undefined =
                (icon ?? commands.icon(id, args))
                  ? ((cLabel as
                      | CommandRegistry.CommandFunc<string>
                      | string
                      | undefined) ?? '')
                  : ((cLabel as
                      | CommandRegistry.CommandFunc<string>
                      | string
                      | undefined) ?? undefined);
              return {
                commands,
                id,
                args,
                icon,
                label,
                type: cType ?? 'command',
                caption: cCaption as string | undefined,
                noFocusOnClick: toolbar?.noFocusOnClick ?? false,
                rank:
                  typeof cRank === 'number'
                    ? cRank
                    : TOOLBAR_DROPDOWN_ITEM_DEFAULT_RANK,
                disabled: cDisabled === true
              };
            })
            .filter(item => {
              if (!['command', 'spacer'].includes(item.type)) {
                console.warn(
                  `Toolbar dropdown item '${item.id}' cannot be displayed. It has no known type.`
                );
              }
              return !item.disabled;
            }) // ignore disabled (hidden) dropdown items
            .sort((itemA, itemB) => itemA.rank - itemB.rank) // sort dropdown items by their rank
        });
      }
      default: //everything else is handled by the original implementation
        return originalDefaultFactory(
          widgetFactory,
          widget,
          toolbarItem as ToolbarRegistry.IWidget
        );
    }
  };
}

export namespace ExamToolbarRegistry {
  export interface IWidget extends Omit<ToolbarRegistry.IWidget, 'type'> {
    type?: 'command' | 'spacer' | 'label' | 'dropdown';
    dropdownWidget?: IDropdownItemWidget[];
  } // this extends the original IWidget interface to accept the new type (if you want to add a new type, make sure to add it to the schema for the permitted settings too)

  export interface IDropdownItemWidget extends Omit<
    ToolbarRegistry.IWidget,
    'type'
  > {
    type?: 'command' | 'spacer';
  }
}
