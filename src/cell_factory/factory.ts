import { NotebookPanel } from '@jupyterlab/notebook';
import { Cell, MarkdownCell } from '@jupyterlab/cells';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { E2XMarkdownCell } from '../cell_registry/cell';
import { E2xGraderCellRegistry } from '../cell_registry/registry';

export class E2XContentFactory extends NotebookPanel.ContentFactory {
  private readonly _settings: ISettingRegistry.ISettings | undefined;
  private readonly _registry:
    | E2xGraderCellRegistry.IE2xGraderCellRegistry
    | undefined;

  constructor(
    options: Cell.ContentFactory.IOptions,
    settings?: ISettingRegistry.ISettings,
    registry?: E2xGraderCellRegistry.IE2xGraderCellRegistry
  ) {
    super(options);
    this._settings = settings;
    this._registry = registry;
  }
  get settings(): ISettingRegistry.ISettings | undefined {
    return this._settings;
  }
  get cellRegistry(): E2xGraderCellRegistry.IE2xGraderCellRegistry | undefined {
    return this._registry;
  }
  createMarkdownCell(options: E2XMarkdownCell.IOptions): MarkdownCell {
    if (!options.contentFactory) {
      options.contentFactory = this;
    }
    options.settings = this._settings;
    options.registry = this._registry;
    const cell = new E2XMarkdownCell(options);
    return cell;
  }
}
