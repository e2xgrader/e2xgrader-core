from nbformat.v4 import new_code_cell, new_markdown_cell
from nbgrader.utils import is_grade, is_locked, is_solution


def new_read_only_cell(grade_id, source=None, cell_type="markdown"):
    if source is None:
        source = ""
    if cell_type == "markdown":
        cell = new_markdown_cell(source)
    elif cell_type == "code":
        cell = new_code_cell(source)
    else:
        raise NameError(f"{cell_type} is not a supported cell type!")
    cell.metadata["nbgrader"] = {
        "grade": False,
        "grade_id": grade_id,
        "locked": True,
        "schema_version": 3,
        "solution": False,
        "task": False,
    }
    return cell


def is_nbgrader_cell(cell):
    return "nbgrader" in cell.metadata


def is_solution_cell(cell):
    return is_nbgrader_cell(cell) and is_solution(cell)


def is_description(cell):
    return is_nbgrader_cell(cell) and not is_grade(cell) and is_locked(cell)


def grade_id(cell):
    if is_nbgrader_cell(cell):
        return cell.metadata.nbgrader.grade_id


def get_points(cell):
    if is_grade(cell):
        return cell.metadata.nbgrader.points
    return 0


def get_valid_name(name):
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    others = "01234567890_-"
    invalid = ""
    # Make sure at least one character is present
    if not any(char in chars for char in name):
        name = "Task_{}".format(name)
    # Identify and replace invalid chars
    for char in name:
        if char not in chars + others:
            invalid += char
    for char in invalid:
        name = name.replace(char, "_")
    return name


def get_task_info(nb):
    subtasks = []
    subtask = []
    for idx, cell in enumerate(nb.cells):
        subtask.append(idx)
        if is_grade(cell):
            subtasks.append(subtask)
            subtask = []
    task = dict()
    if (
        len(subtasks) > 0
        and len(subtasks[0]) > 0
        and is_description(nb.cells[subtasks[0][0]])
    ):
        task["header"] = subtasks[0].pop(0)
    task["subtasks"] = subtasks
    if len(subtask) > 0:
        task["other"] = subtask
    return task


def get_task_ids(nb):
    """Extract task IDs from solution cells."""
    return [grade_id(cell) for cell in nb.cells if is_solution(cell)]


def initialize_task_associations(task_ids):
    """Initialize the checked and associated dictionaries."""
    checked = {task_id: False for task_id in task_ids}
    associated = {task_id: [] for task_id in task_ids}
    return checked, associated


def associate_tasks_with_cells(nb, task_ids, associated):
    """Associate task IDs with corresponding cells."""
    for task_id in task_ids:
        for cell in nb.cells:
            if is_nbgrader_cell(cell) and task_id in grade_id(cell):
                associated[task_id].append(grade_id(cell))


def group_tasks(task_ids, associated, checked):
    """Group tasks based on their associations."""
    groups = []
    for i, task_id in enumerate(task_ids):
        if checked[task_id]:
            continue
        new_group = set(associated[task_id])
        for j in range(i + 1, len(task_ids)):
            task_idj = task_ids[j]
            if any(t in associated[task_idj] for t in associated[task_id]):
                new_group.update(associated[task_idj])
                checked[task_idj] = True
        groups.append(new_group)
    return groups


def map_groups_to_cells(nb, groups):
    """Map task groups to corresponding cell indices."""
    cell_groups = []
    for group in groups:
        cell_group = [
            i
            for i, cell in enumerate(nb.cells)
            if is_nbgrader_cell(cell) and grade_id(cell) in group
        ]
        cell_groups.append(cell_group)
    return cell_groups


def get_tasks(nb):
    """Main function to get task groups from a notebook."""
    task_ids = get_task_ids(nb)
    checked, associated = initialize_task_associations(task_ids)
    associate_tasks_with_cells(nb, task_ids, associated)
    groups = group_tasks(task_ids, associated, checked)
    return map_groups_to_cells(nb, groups)
