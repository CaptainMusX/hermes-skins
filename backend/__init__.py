"""Hermes Skins plugin package marker.

The plugin ships no agent-side Python behavior: its runtime lives in the
desktop plugin bundle (plugin.js) and the dashboard backend (dashboard/plugin_api.py).
This file only makes the directory a valid PluginManager package so the
selection in ``plugins.enabled`` is owned by the official plugin machinery.
"""
