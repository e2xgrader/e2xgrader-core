import React from "react";
import {CommandToolbarButtonComponent, LabIcon, ReactWidget} from "@jupyterlab/ui-components";
import {ReadonlyJSONObject} from "@lumino/coreutils";
import {CommandRegistry} from "@lumino/commands";

export const TOOLBAR_DROPDOWN_CLASS: string = 'jp-ToolbarDropdown';
export const TOOLBAR_DROPDOWN_MENU_CLASS: string = 'jp-ToolbarDropdown-menu';

export class ToolbarDropdown extends ReactWidget {
    constructor(private props: ToolbarDropdownComponent.IProps) {
        super();
        this.addClass(TOOLBAR_DROPDOWN_CLASS);
    }

    render(): React.JSX.Element {
        return <ToolbarDropdownComponent {...this.props} />;
    }
}

export function ToolbarDropdownComponent(props: ToolbarDropdownComponent.IProps): React.JSX.Element{
    console.log('dropdown props', props);
    return (<div title={Private.resolveString(props.caption, props.args)}>
        {props.icon && (
            <LabIcon.resolveReact
              icon={props.icon}
              iconClass={'jp-Icon'}
              tag={null}
            />
        )}
        {props.label && (
            <span className="jp-ToolbarButtonComponent-label">{Private.resolveString(props.label, props.args)}</span>
        )}
        <ul className={TOOLBAR_DROPDOWN_MENU_CLASS}>
            {props.commands.map(commandProps => {
                console.log('repackaged', {...commandProps, ...{caption: Private.resolveString(commandProps.caption, commandProps.args)}});
                return (<li>
                    <CommandToolbarButtonComponent {...{...commandProps, ...{caption: Private.resolveString(commandProps.caption, commandProps.args)}}} />
                </li>);
            })}
        </ul>
    </div>);
}

export namespace ToolbarDropdownComponent {
    export interface IProps {
        id: string;
        args?: ReadonlyJSONObject;
        icon?: LabIcon;
        label?: string | CommandRegistry.CommandFunc<string>;
        caption?: string | CommandRegistry.CommandFunc<string>;
        commands: CommandToolbarButtonComponent.IProps[];
    }
}

namespace Private{
    export function resolveString(val: string | CommandRegistry.CommandFunc<string> | undefined, args: ReadonlyJSONObject | undefined): string | undefined{
        return typeof val === 'function' ? val(args ?? {}) : val;
    }
}