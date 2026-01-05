from traitlets.config import Config

from ..preprocessors import e2xgrader_preprocessors


def configure_autograder(config: Config) -> None:
    config.Autograde.sanitize_preprocessors = [
        e2xgrader_preprocessors["ClearOutput"],
        e2xgrader_preprocessors["DeduplicateIds"],
        "nbgrader.preprocessors.OverwriteKernelspec",
        e2xgrader_preprocessors["OverwriteCells"],
        e2xgrader_preprocessors["CheckCellMetadata"],
    ]

    config.Autograde.autograde_preprocessors = [
        "nbgrader.preprocessors.Execute",
        e2xgrader_preprocessors["LimitOutput"],
        e2xgrader_preprocessors["SaveAutoGrades"],
        e2xgrader_preprocessors["AssignLatePenalties"],
        e2xgrader_preprocessors["CheckCellMetadata"],
    ]


def configure_feedback(config: Config) -> None:
    config.GenerateFeedback.preprocessors = [
        e2xgrader_preprocessors["GetGrades"],
    ]


def configure_base(config: Config) -> None:
    """
    Configure the base settings for the application.

    Args:
        config: The configuration object to modify.
    """
    configure_autograder(config)
