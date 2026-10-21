import { ICellMetadata } from '@jupyterlab/nbformat';
import { E2xGraderMetadata } from './model/e2xgrader';
import {
  NbgraderCellType,
  NbgraderCellTypes,
  NbgraderMetadata
} from './model/nbgrader';
import { SharedCell } from '@jupyter/ydoc';

export const TASK_DESCRIPTION_DEFAULT_CELL_TYPE = 'markdown';
export const AUTOGRADER_TEST_DEFAULT_CELL_TYPE = 'code';

export type IE2xCellMetadata = {
  [E2xGraderMetadata.E2XGRADER_METADATA_KEY]: E2xGraderMetadata.IE2xGraderMetadata;
  [NbgraderMetadata.NBGRADER_METADATA_KEY]: NbgraderMetadata.INbgraderMetadata;
};

export type E2xGraderSharedCell = Omit<SharedCell.Cell, 'metadata'> & {
  cell_type: string;
  metadata: ICellMetadata & IE2xCellMetadata;
};

export class CellPresets {
  public static getCleanMetadata(
    nbgraderCellType: NbgraderCellType,
    {
      e2xgraderCellType,
      task,
      points
    }: {
      e2xgraderCellType?: string;
      task?: E2xGraderMetadata.IE2xGraderTaskMetadata;
      points?: number;
    }
  ): IE2xCellMetadata {
    return {
      [E2xGraderMetadata.E2XGRADER_METADATA_KEY]: {
        ...E2xGraderMetadata.E2X_METADATA_DEFAULTS,
        ...(e2xgraderCellType ? { type: e2xgraderCellType } : {}),
        ...(task ? { task: task } : {})
      },
      [NbgraderMetadata.NBGRADER_METADATA_KEY]: {
        ...NbgraderMetadata.newNbGraderMetadata(),
        ...NbgraderCellTypes.cellTypeConfigurations[nbgraderCellType],
        ...(points ? { points: points } : {})
      }
    };
  }

  public static getTaskDescriptionPreset(
    task?: E2xGraderMetadata.IE2xGraderTaskMetadata
  ): E2xGraderSharedCell {
    return {
      cell_type: TASK_DESCRIPTION_DEFAULT_CELL_TYPE,
      metadata: this.getCleanMetadata(NbgraderCellType.DESCRIPTION, {
        task: task
      }) as ICellMetadata & IE2xCellMetadata
    };
  }

  public static getAutograderTestPreset(
    task?: E2xGraderMetadata.IE2xGraderTaskMetadata,
    points?: number
  ): E2xGraderSharedCell {
    return {
      cell_type: AUTOGRADER_TEST_DEFAULT_CELL_TYPE,
      metadata: this.getCleanMetadata(NbgraderCellType.AUTOGRADER_TEST, {
        task: task,
        points: points
      }) as ICellMetadata & IE2xCellMetadata
    };
  }
}
