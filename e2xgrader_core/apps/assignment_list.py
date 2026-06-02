from ..base import BaseApp

import contextlib
import json
import os
import traceback

from nbgrader.auth import Authenticator
from nbgrader.coursedir import CourseDirectory
from nbgrader.exchange import ExchangeFactory
from nbgrader.server_extensions.assignment_list.handlers import (
    AssignmentList,
    AssignmentListHandler,
    BaseAssignmentHandler,
    CourseListHandler,
    NbGraderVersionHandler,
)
from nbgrader.utils import get_username
from tornado import web

@contextlib.contextmanager
def chdir(dirname):
    currdir = os.getcwd()
    os.chdir(dirname)
    yield
    os.chdir(currdir)


class E2xAssignmentList(AssignmentList):
    def submit_assignment(self, course_id, assignment_id):
        with self.get_assignment_dir_config() as config:
            try:
                config = self.load_config()
                config.CourseDirectory.course_id = course_id
                config.CourseDirectory.assignment_id = assignment_id

                coursedir = CourseDirectory(config=config)
                authenticator = Authenticator(config=config)
                submit = ExchangeFactory(config=config).Submit(
                    coursedir=coursedir, authenticator=authenticator, config=config
                )

                retval = submit.start()
                hashcode = "Exchange not set up for hashcode"
                timestamp = "Exchange not set up for timestamp"
                if retval and len(retval) == 2:
                    hashcode, timestamp = retval

            except Exception:
                self.log.error(traceback.format_exc())
                retvalue = {"success": False, "value": traceback.format_exc()}

            else:
                retvalue = {
                    "success": True,
                    "hashcode": hashcode,
                    "timestamp": timestamp,
                }

        self.log.info(retvalue)

        return retvalue


class AssignmentActionHandler(BaseAssignmentHandler):
    @web.authenticated
    def post(self, action):
        input_data = self.get_json_body()
        assignment_id = input_data.get("assignment_id")
        course_id = input_data.get("course_id")
        if action == "fetch":
            self.manager.fetch_assignment(course_id, assignment_id)
            self.finish(json.dumps(self.manager.list_assignments(course_id=course_id)))
        elif action == "submit":
            output = self.manager.submit_assignment(course_id, assignment_id)
            if output["success"]:
                response = self.manager.list_assignments(course_id=course_id)
                response["hashcode"] = output["hashcode"]
                response["timestamp"] = output["timestamp"]
                self.finish(json.dumps(response))
            else:
                self.finish(json.dumps(output))
        elif action == "fetch_feedback":
            self.manager.fetch_feedback(course_id, assignment_id)
            self.finish(json.dumps(self.manager.list_assignments(course_id=course_id)))


class UsernameHandler(BaseAssignmentHandler):
    @web.authenticated
    def get(self):
        self.finish(json.dumps({"username": get_username()}))


# -----------------------------------------------------------------------------
#  URL to handler mappings
# -----------------------------------------------------------------------------


_assignment_action_regex = r"(?P<action>fetch|submit|fetch_feedback)"


class AssignmentListApp(BaseApp):
    def load_app(self):
        self.log.info("Loading the e2x assignment list app")
        lister = E2xAssignmentList(parent=self.parent)
        lister.root_dir = self.webapp.settings["root_dir"]

        self.update_tornado_settings(dict(assignment_list_manager=lister))

        self.add_handlers(
            [
                (r"/assignments", AssignmentListHandler),
                (r"/assignments/%s" % _assignment_action_regex, AssignmentActionHandler),
                (r"/courses", CourseListHandler),
                (r"/nbgrader_version", NbGraderVersionHandler),
                (r"/nbgrader_username", UsernameHandler),
            ]
        )