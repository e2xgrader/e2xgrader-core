import json
import os

from nbgrader.apps import NbGrader
from tornado import web
from traitlets import List, Unicode

from ..base import BaseApp, E2xApiHandler

INDEX_HTML = "index.html"


class ListFilesHandler(E2xApiHandler):
    def list_files(self, path_id, path):
        self.log.info(f"Listing files from {path}")
        if path is None or not os.path.exists(path):
            return []
        file_list = []
        exclude_dirs = []

        for root, dirs, files in os.walk(path):
            for name in dirs:
                if name.startswith("."):
                    exclude_dirs.append(name)
                elif os.path.isfile(os.path.join(root, name, INDEX_HTML)):
                    exclude_dirs.append(name)
                    file_list.append(
                        (
                            os.path.join(root, name),
                            os.path.join(root, name, INDEX_HTML),
                        )
                    )

            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            for name in files:
                file_list.append((os.path.join(root, name), os.path.join(root, name)))

        file_list = [
            (
                os.path.relpath(name, path),
                os.path.join(path_id, os.path.relpath(url, path)),
            )
            for name, url in file_list
        ]

        return file_list

    @web.authenticated
    def get(self):
        files = []
        for path_id, path in self.settings.get("e2xhelp_shared_dirs", dict()).items():
            files.extend(self.list_files(path_id, path))
        self.write(json.dumps(files))


class SharedMaterialsApp(NbGrader, BaseApp):

    shared_paths = List(
        trait=Unicode(),
        default_value=[],
        help="List of paths of files served via the SharedMaterialsApp",
    ).tag(config=True)

    def __init__(self, **kwargs):
        NbGrader.__init__(self, **kwargs)
        BaseApp.__init__(self, **kwargs)

    def get_static_handlers(self):
        return [
            (
                f"e2xgrader/static/shared-materials/{idx}/(.*)",
                web.StaticFileHandler,
                dict(path=path, default_filename=INDEX_HTML),
            )
            for idx, path in enumerate(self.shared_paths)
        ]

    def load_app(self):
        self.initialize([])
        self.log.info("Loading the e2xgrader Shared Materials App.")
        self.update_tornado_settings(
            dict(
                e2xhelp_shared_dirs={
                    str(idx): path for idx, path in enumerate(self.shared_paths)
                }
            )
        )
        self.add_handlers(
            self.get_static_handlers()
            + [(r"e2xgrader/api/shared-materials", ListFilesHandler)]
        )
