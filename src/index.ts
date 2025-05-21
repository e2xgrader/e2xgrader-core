import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { requestAPI } from './handler';

/**
 * Initialization data for the @e2xgrader/core extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@e2xgrader/core:plugin',
  description: 'A JupyterLab extension providing core functionality for e2xgrader',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (app: JupyterFrontEnd, settingRegistry: ISettingRegistry | null) => {
    console.log('JupyterLab extension @e2xgrader/core is activated!');

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('@e2xgrader/core settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for @e2xgrader/core.', reason);
        });
    }

    requestAPI<any>('get-example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The e2xgrader_core server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
