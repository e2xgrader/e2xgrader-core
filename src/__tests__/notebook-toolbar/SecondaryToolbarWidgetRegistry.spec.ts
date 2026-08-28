import {SecondaryToolbarWidgetRegistry} from "../../notebook-toolbar/SecondaryToolbarWidgetRegistry";
import {JupyterServer} from "@jupyterlab/testing";
import {ToolbarRegistry} from "@jupyterlab/apputils";
import {PRIMARY_NOTEBOOK_TOOLBAR_FACTORY_ID} from "../../notebook-toolbar/widgetFactory";

const server = new JupyterServer();

beforeAll(async () => {
  await server.start();
}, 30000);

afterAll(async () => {
  await server.shutdown();
});

describe('@jupyterlab/apputils', () => {
  describe('SecondaryToolbarWidgetRegistry', () => {
    describe('#constructor', () => {
      it('should set a default factory', () => {
        const dummy = jest.fn();
        const registry = new SecondaryToolbarWidgetRegistry({
          defaultFactory: dummy
        });

        expect(registry.defaultFactory).toBe(dummy);
      });
    });

    describe('#addFactory', () => {
      it('should return the previous registered factory', () => {
        const defaultFactory = jest.fn();
        const dummy = jest.fn();
        const dummy2 = jest.fn();
        const registry = new SecondaryToolbarWidgetRegistry({
          defaultFactory
        });

        const registrations: string[] = [];

        registry.factoryAdded.connect((reg, itemName) => {registrations.push(itemName)});

        const item: ToolbarRegistry.IWidget = {
          name: 'test'
        };

        expect(
          registry.addFactory('factory', item.name, dummy)
        ).toBeUndefined();
        expect(registry.addFactory('factory', item.name, dummy2)).toBe(dummy);
        expect(registrations).toHaveLength(2);
      });

      it('should register primary notebook toolbar factory also for secondary notebook toolbar', () => {
        const defaultFactory = jest.fn();
        const dummy = jest.fn();
        const registry = new SecondaryToolbarWidgetRegistry({
          defaultFactory
        });

        const registrations: string[] = [];

        registry.factoryAdded.connect((reg, itemName) => {registrations.push(itemName)});

        const item: ToolbarRegistry.IWidget = {
          name: 'test'
        };

        expect(
          registry.addFactory(PRIMARY_NOTEBOOK_TOOLBAR_FACTORY_ID, item.name, dummy)
        ).toBeUndefined();
        expect(registrations).toHaveLength(2);
      });
    });
  });
});