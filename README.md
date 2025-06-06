# e2xgrader_core

[![Github Actions Status](https://github.com/e2xgrader/e2xgrader-core/workflows/Build/badge.svg)](https://github.com/e2xgrader/e2xgrader-core/actions/workflows/build.yml)

A JupyterLab extension providing core functionality for e2xgrader

This extension is composed of a Python package named `e2xgrader_core`
for the server extension and a NPM package named `@e2xgrader/core`
for the frontend extension.

## Requirements

- JupyterLab >= 4.0.0

## Install

To install the extension, execute:

```bash
pip install e2xgrader_core
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall e2xgrader_core
```

## 📦 Cell Filter Plugins

The `E2xGraderExporter` supports a **plugin system** for cell filters using Python entry points.  
This allows you to register custom filters for specific cell types, which will be automatically discovered and applied during export.

### How It Works

- The exporter looks for entry points in the group `e2xgrader.cell.filters`.
- Each entry point should provide a tuple: `(cell_type, filter_function)`.
- All filters registered for a cell type are applied (in registration order) to the cell’s source during export.

### Registering a Custom Cell Filter

1. **Define your filter function** in your package:

   ```python
   def my_custom_filter(context, source):
       # Modify and return the cell source as needed
       return source.upper()
   ```

2. **Register the filter in your pyproject.toml:**

   **setup.cfg:**

   ```ini
   [project.entry-points."e2xgrader.cell.filters"]
   mycelltype = mypackage.filters:my_entry_point
   ```

   **mypackage/filters.py:**

   ```python
   def my_entry_point():
       from .myfilters import my_custom_filter
       return "mycelltype", my_custom_filter
   ```

3. **Install your package** so the entry point is discoverable.

### Example

Suppose you want to uppercase all sources of cells with type `uppercase`:

**mypackage/filters.py:**

```python
def uppercase_filter(context, source):
    return source.upper()

def my_entry_point():
    return "uppercase", uppercase_filter
```

**pyporject.toml:**

```ini
[project.entry-points."e2xgrader.cell.filters"]
uppercase = mypackage.filters:my_entry_point
```

---

When you run the exporter, it will automatically discover and apply your filter to all cells of type `uppercase`.

## 🧩 Custom Cell Preprocessor Plugins

e2xgrader supports a **plugin system for cell preprocessors** using Python entry points.  
This allows you to register custom preprocessors for specific cell types, which will be automatically discovered and applied during notebook processing.

### How It Works

- The system looks for entry points in the group `e2xgrader.cell.preprocessors`.
- Each entry point should provide a tuple: `(cell_type, cell_preprocessor)`.
- If a cell matches the `cell_type`, and the preprocessor object has a method matching the current preprocessor’s snake_case name, that method will be called instead of the default.

### Registering a Custom Cell Preprocessor

1. **Define your preprocessor class or object** with a method named after the nbgrader preprocessor (in snake_case):

   ```python
   # mypackage/my_preprocessors.py
   class MyCellPreprocessor:
       def clear_output(self, self_preprocessor, cell, resources, cell_index):
           # Custom logic here
           cell['outputs'] = []
           return cell, resources
   ```

2. **Register the preprocessor in your pyproject.toml:**

   The entry point be a tuple: `("mycelltype", MyCellPreprocessor)`

   **mypackage/my_preprocessors.py:**

   ```python
   class MyCellPreprocessor:
       def clear_output(self, self_preprocessor, cell, resources, cell_index):
           # Custom logic
           return cell, resources

   my_entry_point = ("mycelltype", MyCellPreprocessor)
   ```

   And in `pyproject.toml`:

   ```ini
   [project.entry-points."e2xgrader.cell.preprocessors"]
   e2xgrader.cell.preprocessors =
       mycelltype = mypackage.my_preprocessors:my_entry_point
   ```

3. **Install your package** so the entry point is discoverable.

### Example

Suppose you want to clear outputs only for cells of type `special`:

**mypackage/my_preprocessors.py:**

```python
class SpecialCellPreprocessor:
    def clear_output(self, self_preprocessor, cell, resources, cell_index):
        cell['outputs'] = []
        return cell, resources

special_entry_point = ("special", SpecialCellPreprocessor())
```

**pyproject.toml:**

```ini
[project.entry-points."e2xgrader.cell.preprocessors"]
special = mypackage.my_preprocessors:special_entry_point
```

---

When you run e2xgrader, it will automatically discover and apply your custom preprocessor for all cells of type `special` during the `ClearOutput` step.

---

**See the source code in preprocess_cell.py and **init**.py for details.**

## Troubleshoot

If you are seeing the frontend extension, but it is not working, check
that the server extension is enabled:

```bash
jupyter server extension list
```

If the server extension is installed and enabled, but you are not seeing
the frontend extension, check the frontend extension is installed:

```bash
jupyter labextension list
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the e2xgrader_core directory
# Install package in development mode
pip install -e ".[test]"
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Server extension must be manually installed in develop mode
jupyter server extension enable e2xgrader_core
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
# Server extension must be manually disabled in develop mode
jupyter server extension disable e2xgrader_core
pip uninstall e2xgrader_core
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `@e2xgrader/core` within that folder.

### Testing the extension

#### Server tests

This extension is using [Pytest](https://docs.pytest.org/) for Python code testing.

Install test dependencies (needed only once):

```sh
pip install -e ".[test]"
# Each time you install the Python package, you need to restore the front-end extension link
jupyter labextension develop . --overwrite
```

To execute them, run:

```sh
pytest -vv -r ap --cov e2xgrader_core
```

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

To execute them, execute:

```sh
jlpm
jlpm test
```

#### Integration tests

This extension uses [Playwright](https://playwright.dev/docs/intro) for the integration tests (aka user level tests).
More precisely, the JupyterLab helper [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used to handle testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)
