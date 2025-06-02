from typing import Any, Dict, Union

from nbformat import NotebookNode

E2XGRADER_METADATA_KEY = "extended_cell"


def is_e2xgrader_cell(cell: NotebookNode) -> bool:
    """
    Check if the cell is an e2xgrader cell.
    """
    return (
        E2XGRADER_METADATA_KEY in cell.metadata
        and "type" in cell.metadata[E2XGRADER_METADATA_KEY]
    )


def get_e2xgrader_metadata(cell: NotebookNode) -> Dict[str, Any]:
    """
    Get the metadata of the e2xgrader cell.
    """
    if is_e2xgrader_cell(cell):
        return cell.metadata[E2XGRADER_METADATA_KEY]
    return {}


def get_e2xgrader_metadata_value(
    cell: NotebookNode, key: str, default: Any = None
) -> Any:
    """
    Get a specific metadata value from the e2xgrader cell.
    """
    if is_e2xgrader_cell(cell):
        return cell.metadata[E2XGRADER_METADATA_KEY].get(key, default)
    return default


def set_e2xgrader_metadata_value(cell: NotebookNode, key: str, value: Any) -> None:
    """
    Set a specific metadata value in the e2xgrader cell.
    """
    if is_e2xgrader_cell(cell):
        cell.metadata[E2XGRADER_METADATA_KEY][key] = value
    else:
        cell.metadata[E2XGRADER_METADATA_KEY] = {key: value}


def get_e2xgrader_cell_type(cell: NotebookNode) -> Union[str | None]:
    """
    Get the type of the e2xgrader cell.
    """
    return get_e2xgrader_metadata_value(cell, "type", None)
