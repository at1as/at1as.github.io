"""Shared navigation and page header for the two explorer views."""
from html import escape
from hashlib import sha256
from pathlib import Path
import re
from string import Template

HERE = Path(__file__).parent


def version_assets(html):
    """Refresh first-party styles and controls when generated pages change."""
    def version(match):
        url = match[1]
        digest = sha256((HERE / Path(url).name).read_bytes()).hexdigest()[:12]
        return f'"{url}?v={digest}"'
    return re.sub(r'"((?:\.\./)?(?:styles\.css|trends\.css|analytics\.js|timeline\.js|trends\.js|trends-data\.js|trends-charts\.js))"', version, html)


def chrome(site_home, view):
    root = './' if view == 'snapshot' else '../'
    # Version navigation as well as assets: an older cached HTML page can still
    # point to older asset versions after switching views.
    ui_files = ('_template.html', '_trends_template.html', '_explorer_header.html',
                '_navigation.html', 'styles.css', 'trends.css', 'timeline.js',
                'trends.js', 'trends-charts.js', 'trends-data.js', 'analytics.js')
    ui_version = sha256(b'\0'.join((HERE / name).read_bytes() for name in ui_files)).hexdigest()[:12]
    values = dict(site_home=escape(site_home, quote=True), snapshot_href=root + '?v=' + ui_version,
                  trends_href=root + 'trends/?v=' + ui_version,
                  snapshot_current=' aria-current="page"' if view == 'snapshot' else '',
                  trends_current=' aria-current="page"' if view == 'trends' else '')
    return {key: Template((HERE / filename).read_text()).substitute(values)
            for key, filename in [('site_navigation', '_navigation.html'),
                                  ('explorer_header', '_explorer_header.html')]}
