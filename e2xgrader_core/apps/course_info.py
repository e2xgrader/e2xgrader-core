import json

from nbgrader.utils import get_username
from tornado import web

from ..base import BaseApp, E2xApiHandler


class CourseInfoHandler(E2xApiHandler):

    @web.authenticated
    def get(self):
        self.finish(
            json.dumps(
                dict(
                    course_id=self.api.coursedir.course_id,
                    root=self.api.coursedir.root,
                    username=get_username(),
                )
            )
        )


class CourseInfoApp(BaseApp):

    def load_app(self):
        self.log.info("Loading the e2xgrader CourseInfo app.")
        self.add_handlers(
            [
                (r"e2xgrader/api/course-info", CourseInfoHandler),
            ]
        )
