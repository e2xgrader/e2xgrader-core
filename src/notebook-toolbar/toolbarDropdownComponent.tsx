import React from 'react';
import {
  CommandToolbarButtonComponent,
  LabIcon,
  ReactWidget,
  ToolbarButtonComponent
} from '@jupyterlab/ui-components';
import { ReadonlyJSONObject } from '@lumino/coreutils';
import { CommandRegistry } from '@lumino/commands';

export const TOOLBAR_DROPDOWN_CLASS: string = 'jp-ToolbarDropdown';
export const TOOLBAR_DROPDOWN_ACTIVE_CLASS: string =
  'jp-ToolbarDropdown-active';
export const TOOLBAR_DROPDOWN_BUTTON_CLASS: string =
  'jp-ToolbarDropdown-button';
export const TOOLBAR_DROPDOWN_WRAPPER_CLASS: string =
  'jp-ToolbarDropdown-wrapper';
export const TOOLBAR_DROPDOWN_MENU_CLASS: string = 'jp-ToolbarDropdown-menu';

export class ToolbarDropdownComponent extends ReactWidget {
  private _showDropdownMenu: boolean = false;
  private readonly _dropdownRef: React.RefObject<HTMLDivElement>;

  constructor(private _props: ToolbarDropdownComponent.IProps) {
    super();
    this.addClass(TOOLBAR_DROPDOWN_CLASS);
    this._dropdownRef = React.createRef();

    document.addEventListener('mousedown', (event: MouseEvent) => {
      if (
        this._dropdownRef.current &&
        !this._dropdownRef.current.contains(event.target as Node)
      ) {
        this.closeDropdownMenu();
      }
    });
  }

  setProps(props: ToolbarDropdownComponent.IProps): void {
    this._props = props;
  }

  toggleDropdownMenu(): void {
    this._showDropdownMenu = !this._showDropdownMenu;
    this.update();
  }

  closeDropdownMenu(): void {
    this._showDropdownMenu = false;
    this.update();
  }

  render(): React.JSX.Element {
    return (
      <div
        ref={this._dropdownRef}
        title={Private.resolveString(this._props.caption, this._props.args)}
        className={
          TOOLBAR_DROPDOWN_WRAPPER_CLASS +
          (this._showDropdownMenu ? ' ' + TOOLBAR_DROPDOWN_ACTIVE_CLASS : '')
        }
      >
        <ToolbarButtonComponent
          className={TOOLBAR_DROPDOWN_BUTTON_CLASS}
          icon={this._props.icon}
          label={Private.resolveString(this._props.label, this._props.args)}
          onClick={() => this.toggleDropdownMenu()}
        />
        {this._showDropdownMenu && (
          <ul
            className={
              TOOLBAR_DROPDOWN_MENU_CLASS +
              (this._props.alignRight ? ' align-right' : '')
            }
          >
            {this._props.commands.map(commandProps => {
              return (
                <li onClick={() => this.closeDropdownMenu()}>
                  <CommandToolbarButtonComponent
                    {...{
                      ...commandProps,
                      ...{
                        caption: Private.resolveString(
                          commandProps.caption,
                          commandProps.args
                        )
                      }
                    }}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }
}

export namespace ToolbarDropdownComponent {
  export interface IProps {
    id: string;
    args?: ReadonlyJSONObject;
    icon?: LabIcon;
    label?: string | CommandRegistry.CommandFunc<string>;
    caption?: string | CommandRegistry.CommandFunc<string>;
    commands: CommandToolbarButtonComponent.IProps[];
    alignRight?: boolean;
  }
}

namespace Private {
  export function resolveString(
    val: string | CommandRegistry.CommandFunc<string> | undefined,
    args: ReadonlyJSONObject | undefined
  ): string | undefined {
    return typeof val === 'function' ? val(args ?? {}) : val;
  }
}
