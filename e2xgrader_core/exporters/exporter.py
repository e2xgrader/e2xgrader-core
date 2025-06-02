import base64
import glob
import os
from importlib.metadata import entry_points

from jinja2.filters import pass_context
from nbconvert.exporters import HTMLExporter

from ..cells.e2xgrader import get_e2xgrader_cell_type, is_e2xgrader_cell
from .filters.highlightlinenumbers import Highlight2HTMLwithLineNumbers


class E2xGraderExporter(HTMLExporter):
    """
    Custom HTML exporter for e2xgrader.
    This exporter is used to convert Jupyter notebooks to HTML format.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Use importlib.metadata.entry_points to discover filters
        # and register them with the exporter
        # We assume that the entry point group is 'e2xgrader.filters'
        # Each filter is a tuple of (cell_type, filter_function)
        self.cell_filters = {}
        for entry_point in entry_points(group="e2xgrader.cell.filters"):
            cell_type, filter_function = entry_point.load()
            if cell_type not in self.cell_filters:
                self.cell_filters[cell_type] = []
            self.cell_filters[cell_type].append(filter_function)

    def _template_name_default(self):
        return "e2xgrader"

    @pass_context
    def to_e2xgrader_cell(self, context, source):
        """
        Custom filter to convert a cell's source code to HTML.
        This method is used to apply custom filters to the cell's source code.
        """
        print("to_e2xgrader_cell")
        # Apply custom filters here if needed
        cell = context["cell"]
        if not is_e2xgrader_cell(cell):
            return source
        cell_type = get_e2xgrader_cell_type(cell)
        if cell_type in self.cell_filters:
            for filter_function in self.cell_filters[cell_type]:
                source = filter_function(context=context, source=source)
        return source

    def default_filters(self):
        for pair in super().default_filters():
            yield pair
        yield ("to_e2xgrader_cell", self.to_e2xgrader_cell)

    def discover_annotations(self, resources):
        if resources is None:
            return
        resources["annotations"] = dict()
        if "metadata" not in resources or "path" not in resources["metadata"]:
            return

        path = resources["metadata"]["path"]

        for annotation in glob.glob(os.path.join(path, "annotations", "*.png")):
            cell_id = os.path.splitext(os.path.basename(annotation))[0]
            with open(annotation, "rb") as f:
                img = base64.b64encode(f.read()).decode("utf-8")
                resources["annotations"][cell_id] = f"data:image/png;base64,{img}"

    def from_notebook_node(self, nb, resources=None, **kw):
        self.discover_annotations(resources)

        self.exclude_input = False
        langinfo = nb.metadata.get("language_info", {})
        lexer = langinfo.get("pygments_lexer", langinfo.get("name", None))
        highlight_code = self.filters.get(
            "highlight_code_with_linenumbers",
            Highlight2HTMLwithLineNumbers(pygments_lexer=lexer, parent=self),
        )
        self.register_filter("highlight_code_with_linenumbers", highlight_code)
        return super(E2xGraderExporter, self).from_notebook_node(nb, resources, **kw)
