from traitlets import Any, List

from ..apps import CourseInfoApp, E2xGraderApiApp, SharedMaterialsApp
from ..base import BaseExtension


class CoreExtension(BaseExtension):
    apps = List(
        trait=Any(), default_value=[E2xGraderApiApp, CourseInfoApp, SharedMaterialsApp]
    ).tag(config=True)


def load_jupyter_server_extension(server_app):
    server_app.log.info("Loading the e2xgrader core server extension.")
    CoreExtension(parent=server_app)
