from nbgrader.apps import NbGrader

from ..api import E2XGraderAPI
from ..base import BaseApp


class E2xGraderApiApp(NbGrader, BaseApp):

    def __init__(self, **kwargs):
        NbGrader.__init__(self, **kwargs)
        BaseApp.__init__(self, **kwargs)

    def load_app(self):
        self.log.info("Loading the e2xgrader api app.")
        self.initialize([])
        self.update_tornado_settings(
            dict(
                e2xgrader_api=E2XGraderAPI(
                    self.coursedir, self.authenticator, parent=self
                )
            )
        )
