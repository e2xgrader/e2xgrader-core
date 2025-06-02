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
     * The type of the cell.
     * @default undefined
     */
    type?: string;

    /**
     * Additional options for the metadata.
     * @default {}
     */
    options?: any;

    [key: string]: any;
  }

  /**
   * Default values for E2x metadata.
   */
  export const E2X_METADATA_DEFAULTS: IE2xGraderMetadata = {
    type: undefined,
    options: {}
  };
}
