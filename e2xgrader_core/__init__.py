try:
    from ._version import __version__
except ImportError:
    # Fallback when using the package in dev mode without installing
    # in editable mode with pip. It is highly recommended to install
    # the package from a stable release or in editable mode: https://pip.pypa.io/en/stable/topics/local-project-installs/#editable-installs
    import warnings

    warnings.warn("Importing 'e2xgrader_core' outside a proper installation.")
    __version__ = "dev"

from .server_extension.core import load_jupyter_server_extension


def _jupyter_labextension_paths():
    return [{"src": "labextension", "dest": "@e2xgrader/core"}]


def _jupyter_server_extension_points():
    return [{"module": "e2xgrader_core"}]


def _load_jupyter_server_extension(server_app):
    return load_jupyter_server_extension(server_app)
