from importlib.metadata import entry_points
from typing import Tuple

from nbconvert.exporters.exporter import ResourcesDict
from nbformat.notebooknode import NotebookNode

from ..cells.e2xgrader import get_e2xgrader_cell_type


def turn_camel_case_to_snake_case(name: str) -> str:
    """
    Convert a camel case string to snake case.

    Args:
        name: The camel case string to convert.

    Returns:
        The converted snake case string.
    """
    return "".join(["_" + i.lower() if i.isupper() else i for i in name]).lstrip("_")


def preprocess_cell(
    self, cell: NotebookNode, resources: ResourcesDict, cell_index: int
) -> Tuple[NotebookNode, ResourcesDict]:
    """
    Preprocess a cell in the notebook.

    Args:
        self: The instance of the preprocessor.
        cell: The cell to preprocess.
        resources: The resources dictionary.
        cell_index: The index of the cell in the notebook.

    Returns:
        A tuple containing the preprocessed cell and the updated resources.
    """
    e2xgrader_cell_type = get_e2xgrader_cell_type(cell)
    preprocessor_name = turn_camel_case_to_snake_case(self.__class__.__name__)

    for entry_point in entry_points(group="e2xgrader.cell.preprocessors"):
        cell_type, cell_preprocessor = entry_point.load()
        if cell_type == e2xgrader_cell_type:
            if hasattr(cell_preprocessor, preprocessor_name):
                self.log.info(
                    f"Applying custom {preprocessor_name} for cell type {cell_type}"
                )
                cell_preprocessor = getattr(cell_preprocessor, preprocessor_name)
                return cell_preprocessor(self, cell, resources, cell_index)
    return self.preprocess_cell_original(cell, resources, cell_index)
