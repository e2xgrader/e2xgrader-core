from nbgrader.preprocessors import (
    AssignLatePenalties,
    CheckCellMetadata,
    ClearHiddenTests,
    ClearMarkScheme,
    ClearOutput,
    ClearSolutions,
    ComputeChecksums,
    DeduplicateIds,
    GetGrades,
    IgnorePattern,
    IncludeHeaderFooter,
    InstantiateTests,
    LimitOutput,
    LockCells,
    OverwriteCells,
    SaveAutoGrades,
    SaveCells,
)

from .preprocess_cell import preprocess_cell


def override_preprocess(preprocessors, new_method):
    overridden_classes = {}

    for preprocessor in preprocessors:
        class_name = f"{preprocessor.__name__}"
        # Store the original preprocess_cell method
        original_method = getattr(preprocessor, "preprocess_cell", None)
        # Dynamically create a new class inheriting from the original
        overridden_class = type(
            class_name,
            (preprocessor,),
            {
                "preprocess_cell": new_method,
                "preprocess_cell_original": original_method,
            },
        )
        overridden_classes[class_name] = overridden_class

    return overridden_classes


# Override the preprocess_cell method for each preprocessor
preprocessors = [
    AssignLatePenalties,
    CheckCellMetadata,
    ClearHiddenTests,
    ClearMarkScheme,
    ClearOutput,
    ClearSolutions,
    ComputeChecksums,
    DeduplicateIds,
    GetGrades,
    IgnorePattern,
    IncludeHeaderFooter,
    InstantiateTests,
    LimitOutput,
    LockCells,
    OverwriteCells,
    SaveAutoGrades,
    SaveCells,
]

e2xgrader_preprocessors = override_preprocess(preprocessors, preprocess_cell)
__all__ = ["e2xgrader_preprocessors"]
