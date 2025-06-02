import { Toolbar, ReactWidget } from '@jupyterlab/ui-components';
import { Cell } from '@jupyterlab/cells';
import { Message } from '@lumino/messaging';
import React from 'react';
import { E2xGraderCellRegistry } from '../cell_registry/registry';
import { GradingCellModel } from '../model/gradingcell';

export namespace E2xGraderCellToolbar {
  export class CellToolbar extends Toolbar {
    private _cell: Cell | null = null;
    private _isAttached: boolean = false;
    private _gradingCellModel: GradingCellModel | null = null;
    private readonly _registry:
      | E2xGraderCellRegistry.IE2xGraderCellRegistry
      | undefined;

    constructor(
      options: Toolbar.IOptions,
      registry: E2xGraderCellRegistry.IE2xGraderCellRegistry | undefined
    ) {
      super(options);
      this._registry = registry;
      this.addClass('e2xgrader-CellToolbar');
    }

    get cell(): Cell | null {
      return this._cell;
    }

    set cell(value: Cell | null) {
      if (this._cell !== value) {
        this._cell = value;
        this.update();
      }
    }

    get isAttached(): boolean {
      return this._isAttached;
    }

    get gradingCellModel(): GradingCellModel | null {
      return this._gradingCellModel;
    }

    get cellRegistry():
      | E2xGraderCellRegistry.IE2xGraderCellRegistry
      | undefined {
      return this._registry;
    }

    protected onAfterAttach(_msg: Message): void {
      this._cell = this.parent as Cell;
      this._isAttached = true;
      this._gradingCellModel = new GradingCellModel(
        this._cell.model.sharedModel
      );
      this.update();
    }

    update(): void {
      Array.from(this.children()).forEach(child => {
        if (child instanceof ToolbarElement) {
          child.update();
        }
      });
    }
  }
  export class ToolbarElement extends ReactWidget {
    private readonly _toolbar: CellToolbar;
    constructor(toolbar: CellToolbar) {
      super();
      this._toolbar = toolbar;
    }

    get toolbar(): CellToolbar {
      return this._toolbar;
    }

    get cell(): Cell | null {
      return this._toolbar.cell;
    }
    get gradingCellModel(): GradingCellModel | null {
      return this._toolbar.gradingCellModel;
    }
    get cellRegistry():
      | E2xGraderCellRegistry.IE2xGraderCellRegistry
      | undefined {
      return this._toolbar.cellRegistry;
    }

    renderElement(): React.JSX.Element {
      return <></>;
    }

    render(): React.JSX.Element | null {
      if (this.toolbar.isAttached) {
        return this.renderElement();
      }
      return null;
    }
  }
}
