.. _developer-cell-filters:

Cell Filters
============

Cell filters are used by the ``E2xGraderExporter`` as nbconvert filters to modify the appearance or content of notebook cells after exporting them to HTML. They can be used to hide certain cells, modify their content, or change their appearance.

Cell Filter Plugins
-------------------

The ``E2xGraderExporter`` supports a plugin system for cell filters using Python entry points. This allows you to register custom filters for specific cell types, which will be automatically discovered and applied during export.

How It Works
^^^^^^^^^^^^

- The exporter looks for entry points in the group ``e2xgrader.cell.filters``.
- Each entry point should provide a tuple: ``(cell_type, filter_function)``.
- All filters registered for a cell type are applied (in registration order) to the cell’s source during export.
- **The filter function receives the cell's HTML source (as a string) and a context dictionary.** The original notebook cell object can be accessed via ``context.get("cell", {})``.
- **The cell type is determined by the value of ``cell.metadata.extended_cell.type`` in the original notebook cell.** Your filter will be applied to cells where this value matches the registered cell type.

Registering a Custom Cell Filter
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

1. **Define your filter function** in your package:

    .. code-block:: python

        def my_custom_filter(context, source):
            # Access the original cell object if needed
            cell = context.get("cell", {})
            # Modify and return the HTML source as needed
            return f"<div class='mycell'>{source}</div>"

2. **Register the filter in your project configuration** (e.g., ``pyproject.toml`` or ``setup.cfg``):

    .. code-block:: ini

        [project.entry-points."e2xgrader.cell.filters"]
        mycelltype = mypackage.filters:my_entry_point

    .. code-block:: python

        # mypackage/filters.py
        def my_entry_point():
            from .myfilters import my_custom_filter
            return "mycelltype", my_custom_filter

3. **Install your package** so the entry point is discoverable.

Example
^^^^^^^

Suppose you want to wrap the HTML source of all cells with type ``uppercase`` in a <span> and uppercase the text content:

.. code-block:: python

    # mypackage/filters.py
    def uppercase_filter(context, source):
        # source is already HTML; you may want to manipulate it accordingly
        # For demonstration, we'll just uppercase the HTML string
        return f"<span class='uppercase'>{source.upper()}</span>"

    def my_entry_point():
        return "uppercase", uppercase_filter

.. code-block:: ini

    [project.entry-points."e2xgrader.cell.filters"]
    uppercase = mypackage.filters:my_entry_point