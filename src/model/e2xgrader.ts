import {UUID} from '@lumino/coreutils';

/**
 * Namespace containing interfaces and constants related to E2x metadata.
 */
export namespace E2xGraderMetadata {
  export const E2XGRADER_METADATA_KEY = 'extended_cell';
  /**
   * Interface representing the structure of E2x metadata.
   */
  export interface IE2xGraderMetadata {
    /**
     * version of this metadata schema
     */
    schema_version?: string

    /**
     * The type of the cell.
     * @default undefined
     */
    type?: string;

    /**
     * Additional options for the metadata.
     * @default {}
     */
    options?: any;

    /**
     * Metadata of the task to which this cell belongs
     * @default undefined
     */
    task?: IE2xGraderTaskMetadata;

    [key: string]: any;
  }

  /**
   * Interface representing the task-part of the e2xgrader-metadata
   */
  export interface IE2xGraderTaskMetadata{
    /**
     * id of the task
     */
    id: string;

    /**
     * human-readable name of the task
     */
    name: string;

    /**
     * id of the task that is parent of this task
     */
    parent_id?: string;
  }

  /**
   * Default values for E2x metadata.
   */
  export const E2X_METADATA_DEFAULTS: IE2xGraderMetadata = {
    schema_version: '0.1',
    type: undefined,
    options: {}
  };

  /**
   * centralized task-id generator to enforce a standardized id-format
   */
  export function getNewTaskId(): string {
    return UUID.uuid4();
  }

  export function getNewTaskMetadata(): E2xGraderMetadata.IE2xGraderTaskMetadata {
    return {
      id: getNewTaskId(),
      name: ''
    }
  }
}

export interface IE2xGraderSubmissionResponse {
  success: boolean;
  value: string;
  hashcode?: string;
  timestamp?: string;
}
