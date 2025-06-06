.. _developer-cell-preprocessors:

Cell Preprocessors
==================

Cell preprocessors are used by e2xgrader to modify notebook cells before further processing or export. They allow you to customize the behavior of nbgrader preprocessors for specific cell types.

Cell Preprocessor Plugins
-------------------------

e2xgrader supports a plugin system for cell preprocessors using Python entry points. This allows you to register custom preprocessors for specific cell types, which will be automatically discovered and applied during notebook processing.

How It Works
^^^^^^^^^^^^

- The system looks for entry points in the group ``e2xgrader.cell.preprocessors``.
- Each entry point should provide a tuple: ``(cell_type, cell_preprocessor)``.
- If a cell matches the ``cell_type`` (as determined by ``cell.metadata.extended_cell.type``), and the preprocessor object has a method matching the current nbgrader preprocessor’s snake_case name, that method will be called instead of the default.

Registering a Custom Cell Preprocessor
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

1. **Define your preprocessor class or object** with a method named after the nbgrader preprocessor (in snake_case):

    .. code-block:: python

        # mypackage/my_preprocessors.py
        class MyCellPreprocessor:
            def clear_output(self, self_preprocessor, cell, resources, cell_index):
                # Custom logic here
                cell['outputs'] = []
                return cell, resources

2. **Register the preprocessor in your project configuration** (e.g., ``pyproject.toml`` or ``setup.cfg``):

    .. code-block:: python

        # mypackage/my_preprocessors.py
        my_entry_point = ("mycelltype", MyCellPreprocessor())

    .. code-block:: ini

        [project.entry-points."e2xgrader.cell.preprocessors"]
        mycelltype = mypackage.my_preprocessors:my_entry_point

3. **Install your package** so the entry point is discoverable.

Example
^^^^^^^

Suppose you want to clear outputs only for cells of type ``special``:

.. code-block:: python

    # mypackage/my_preprocessors.py
    class SpecialCellPreprocessor:
        def clear_output(self, self_preprocessor, cell, resources, cell_index):
            cell['outputs'] = []
            return cell, resources

    special_entry_point = ("special", SpecialCellPreprocessor())

.. code-block:: ini

    [project.entry-points."e2xgrader.cell.preprocessors"]
    special = mypackage.my_preprocessors:special_entry_point

When you run e2xgrader, it will automatically discover and apply your custom preprocessor for all cells of type ``special`` during the ``ClearOutput`` step.

Notes
^^^^^

- The cell type is determined by the value of ``cell.metadata.extended_cell.type`` in the original notebook cell.
- The preprocessor method receives the following arguments: ``self_preprocessor`` (the nbgrader preprocessor instance), ``cell`` (the cell object), ``resources`` (the resources dict), and ``cell_index`` (the index of the cell).