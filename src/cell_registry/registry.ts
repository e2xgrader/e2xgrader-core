import { Token } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import { Widget } from '@lumino/widgets';
import { E2XMarkdownCell } from './cell';

export namespace E2xGraderCellRegistry {
  export type E2xRenderCellFunction = (
    widget: Widget,
    cell: E2XMarkdownCell
  ) => Promise<void> | void;

  export interface IE2xGraderCellPlugin {
    cellType: string;
    label: string;
    renderCell: E2xRenderCellFunction;
    cleanMetadata: Record<string, any>;
  }

  export const IE2xGraderCellRegistry = new Token<IE2xGraderCellRegistry>(
    '@e2xgrader/core:IE2xGraderCellRegistry'
  );

  export interface IE2xGraderCellRegistry {
    registerPlugin(plugin: IE2xGraderCellPlugin): void;
    getPlugin(cellType: string): IE2xGraderCellPlugin | undefined;
    getPlugins(): IE2xGraderCellPlugin[];
    getPluginLabel(cellType: string): string | undefined;
    getPluginTypes(): string[];
    pluginRegistered: ISignal<this, { plugin: IE2xGraderCellPlugin }>;
  }

  export class E2xGraderCellRegistry implements IE2xGraderCellRegistry {
    private readonly _plugins: Map<string, IE2xGraderCellPlugin>;
    private readonly _pluginRegistered: Signal<
      this,
      { plugin: IE2xGraderCellPlugin }
    >;

    constructor() {
      this._plugins = new Map<string, IE2xGraderCellPlugin>();
      this._pluginRegistered = new Signal<
        this,
        { plugin: IE2xGraderCellPlugin }
      >(this);
    }

    registerPlugin(plugin: IE2xGraderCellPlugin): void {
      if (this._plugins.has(plugin.cellType)) {
        console.warn(
          `Plugin for cell type ${plugin.cellType} is already registered.`
        );
        return;
      }
      this._plugins.set(plugin.cellType, plugin);
      this._pluginRegistered.emit({ plugin });
    }

    getPlugin(cellType: string): IE2xGraderCellPlugin | undefined {
      return this._plugins.get(cellType);
    }

    getPlugins(): IE2xGraderCellPlugin[] {
      return Array.from(this._plugins.values());
    }

    getPluginLabel(cellType: string): string | undefined {
      const plugin = this.getPlugin(cellType);
      return plugin ? plugin.label : undefined;
    }

    getPluginTypes(): string[] {
      return Array.from(this._plugins.keys());
    }

    get pluginRegistered(): ISignal<this, { plugin: IE2xGraderCellPlugin }> {
      return this._pluginRegistered;
    }
  }
}
