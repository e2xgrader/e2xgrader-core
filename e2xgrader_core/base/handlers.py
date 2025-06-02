from jupyter_server.base.handlers import JupyterHandler as IPythonHandler
from nbgrader.server_extensions.formgrader.base import BaseApiHandler

from ..api import E2XGraderAPI


class E2xHandler(IPythonHandler):
    @property
    def e2xgrader_settings(self):
        return self.settings["e2xgrader"]

    @property
    def jinja_env(self):
        return self.e2xgrader_settings["jinja_env"]

    @property
    def menu(self):
        return self.e2xgrader_settings["menu"]

    def render(self, name, **ns):
        template = self.jinja_env.get_template(name)
        return template.render(**ns)


class E2xApiHandler(BaseApiHandler):
    @property
    def api(self):
        level = self.log.level
        api = self.settings["e2xgrader_api"]
        api.log_level = level
        return api
