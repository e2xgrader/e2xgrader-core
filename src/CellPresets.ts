import { ICellMetadata } from '@jupyterlab/nbformat';
import E2XGRADER_METADATA_KEY = E2xGraderMetadata.E2XGRADER_METADATA_KEY;
import { E2xGraderMetadata } from './model/e2xgrader';
import {
  NbgraderCellType,
  NbgraderCellTypes,
  NbgraderMetadata
} from './model/nbgrader';
import { SharedCell } from '@jupyter/ydoc';
import IE2xGraderMetadata = E2xGraderMetadata.IE2xGraderMetadata;

export const TASK_DESCRIPTION_DEFAULT_CELL_TYPE = 'markdown';
export const AUTOGRADER_TEST_DEFAULT_CELL_TYPE = 'code';

export type IE2xCellMetadata = ICellMetadata & {
  [E2XGRADER_METADATA_KEY]: E2xGraderMetadata.IE2xGraderMetadata;
  [NbgraderMetadata.NBGRADER_METADATA_KEY]: NbgraderMetadata.INbgraderMetadata;
};

export type E2xGraderSharedCell = Omit<SharedCell.Cell, 'metadata'> & {
  cell_type: string;
  metadata: IE2xGraderMetadata;
};

export class CellPresets {
  public static getCleanMetadata(
    nbgraderCellType: NbgraderCellType,
    {
      e2xgraderCellType,
      linkTargetCellId,
      taskName,
      points
    }: {
      e2xgraderCellType?: string;
      linkTargetCellId?: string;
      taskName?: string;
      points?: number;
    } = {}
  ): Partial<IE2xCellMetadata> {
    return {
      [E2XGRADER_METADATA_KEY]: {
        ...E2xGraderMetadata.E2X_METADATA_DEFAULTS,
        ...(e2xgraderCellType ? { type: e2xgraderCellType } : {}),
        ...(taskName ? { task_name: taskName } : {}),
        ...(linkTargetCellId ? { for: linkTargetCellId } : {})
      },
      [NbgraderMetadata.NBGRADER_METADATA_KEY]: {
        ...NbgraderMetadata.newNbGraderMetadata(),
        ...NbgraderCellTypes.cellTypeConfigurations[nbgraderCellType],
        ...(points ? { points: points } : {})
      }
    };
  }

  public static getTaskDescriptionPreset(
    linkTargetCellId?: string
  ): E2xGraderSharedCell {
    return {
      cell_type: TASK_DESCRIPTION_DEFAULT_CELL_TYPE,
      metadata: this.getCleanMetadata(NbgraderCellType.DESCRIPTION, {
        linkTargetCellId
      })
    };
  }

  public static getAutograderTestPreset(
    linkTargetCellId?: string
  ): E2xGraderSharedCell {
    return {
      cell_type: AUTOGRADER_TEST_DEFAULT_CELL_TYPE,
      metadata: this.getCleanMetadata(NbgraderCellType.AUTOGRADER_TEST, {
        linkTargetCellId
      })
    };
  }
}
