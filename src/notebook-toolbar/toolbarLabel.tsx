import * as React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { ReadonlyJSONObject } from '@lumino/coreutils';
import { LabIcon } from '@jupyterlab/ui-components';
import { CommandRegistry } from '@lumino/commands';

/*
 * Adds the toolbar label class to the label toolbar widget.
 * @param w toolbar label widget.
 */
export function addToolbarLabelClass(w: Widget): Widget {
  w.addClass('jp-ToolbarLabel');
  return w;
}

export class ToolbarLabel extends ReactWidget {
  constructor(private props: ToolbarLabelComponent.IProps) {
    super();
    addToolbarLabelClass(this);
  }

  render(): JSX.Element {
    return <ToolbarLabelComponent {...this.props} />;
  }
}

export function ToolbarLabelComponent(
  props: ToolbarLabelComponent.IProps
): JSX.Element {
  const label =
    typeof props.label === 'function'
      ? props.label(props.args ?? {})
      : props.label;
  return (
    <div title={props.caption}>
      {props.icon && (
        <LabIcon.resolveReact
          icon={props.icon}
          iconClass={'jp-Icon'}
          tag={null}
        />
      )}
      {props.label && (
        <span className="jp-ToolbarButtonComponent-label">{label}</span>
      )}
    </div>
  );
}

export namespace ToolbarLabelComponent {
  export interface IProps {
    id: string;
    args?: ReadonlyJSONObject;
    icon?: LabIcon;
    label?: string | CommandRegistry.CommandFunc<string>;
    caption?: string;
  }
}
