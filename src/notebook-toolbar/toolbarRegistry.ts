import { ToolbarRegistry } from '@jupyterlab/apputils';
import { LabIcon, Toolbar } from '@jupyterlab/ui-components';
import { CommandRegistry } from '@lumino/commands';
import { Widget } from '@lumino/widgets';
import { createDefaultFactory as originalCreateDefaultFactory } from '@jupyterlab/apputils';
import { ToolbarLabel } from './toolbarLabel';
import {PartialJSONObject} from '@lumino/coreutils';
import {ToolbarDropdown} from "./toolbarDropdown";

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
          icon: tIcon,
          commands: tCommands
        } = toolbarItem;
        const id = toolbarItem?.tId ?? '';
        const args = { toolbar: true, ...(tArgs as PartialJSONObject) };
        const entries: ExamToolbarRegistry.IWidget[] = Array.isArray(tCommands) ? tCommands : [];
        const icon = tIcon
          ? LabIcon.resolve({ icon: tIcon as string })
          : undefined;

        // If there is an icon, undefined label will results in no label
        // otherwise the label will be set using the setting or the command label
        const label = icon ? (tLabel ?? '') : tLabel;
        return new ToolbarDropdown({
          id: id as string,
          args,
          icon,
          label: label as string,
          caption: tCaption as string,
          commands: entries.filter(val => !!val).map((command: ExamToolbarRegistry.IWidget) => {
            const {
              command: cId,
              args: cArgs,
              label: cLabel,
              caption: cCaption,
              icon: cIcon
            } = command;
            const id: string = typeof cId === 'string' ? cId : '';
            const args = { toolbar: true, ...(cArgs as PartialJSONObject) };
            const icon = cIcon ? LabIcon.resolve({ icon: (cIcon as string) }) : undefined;

            const toolbar = (widget as any).toolbar as Toolbar;

            // If there is an icon, undefined label will results in no label
            // otherwise the label will be set using the setting or the command label
            const label: CommandRegistry.CommandFunc<string>|string|undefined = icon ?? commands.icon(id, args) ? (cLabel as CommandRegistry.CommandFunc<string>|string|undefined) ?? '' : (cLabel as CommandRegistry.CommandFunc<string>|string|undefined) ?? undefined;
            return ({
              commands,
              id,
              args,
              icon,
              label,
              caption: (cCaption as string|undefined),
              noFocusOnClick: toolbar?.noFocusOnClick ?? false
            })
          })
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
    commands?: IWidget[];
  } // this extends the original IWidget interface to accept the new type (if you want to add a new type, make sure to add it to the schema for the permitted settings too)
}
