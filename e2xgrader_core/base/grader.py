from abc import abstractmethod
from logging import Logger
from typing import Optional, Tuple

from nbformat.notebooknode import NotebookNode
from traitlets.config import LoggingConfigurable


class BaseGrader(LoggingConfigurable):

    @abstractmethod
    def determine_grade(
        self, cell: NotebookNode, log: Logger = None
    ) -> Tuple[Optional[float], float]:
        """
        Abstract method to determine the grade for a cell.
        Subclasses must implement this method.
        """
        pass

    def default_determine_grade(
        self, cell: NotebookNode, log: Logger = None
    ) -> Tuple[Optional[float], float]:
        """
        Default implementation for determining the grade.
        Can be used by subclasses if needed.
        """
        max_points = float(cell.metadata["nbgrader"]["points"])
        return None, max_points
