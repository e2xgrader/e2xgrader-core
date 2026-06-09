import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';

export namespace SharedMaterialsAPI{
    export const SHARED_MATERIAL_API_PATH = 'e2xgrader/api/shared-materials';
    export const SHARED_MATERIAL_STATIC_FILE_PATH = 'e2xgrader/static/shared-materials/';

    export interface ISharedMaterial {
      label: string;
      path: string;
    }

    export async function fetchSharedMaterials(): Promise<ISharedMaterial[]> {
        const settings = ServerConnection.makeSettings();
        const requestUrl = URLExt.join(settings.baseUrl, SHARED_MATERIAL_API_PATH);

        return ServerConnection.makeRequest(requestUrl, {}, settings)
          .then(async response => {
            return ((await response.json()) as [label: string, path: string][]).map(
              ([label, path]) => ({
                label,
                path: URLExt.join(settings.baseUrl, SHARED_MATERIAL_STATIC_FILE_PATH, path)
              })
            );
          })
          .catch(error => {
            throw new ServerConnection.NetworkError(error as TypeError);
          });
    }
}