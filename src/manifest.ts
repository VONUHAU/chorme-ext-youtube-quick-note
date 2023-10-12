import type { Manifest } from 'webextension-polyfill'
import pkg from '../package.json'

const manifest: Manifest.WebExtensionManifest = {
  manifest_version: 3,
  name: pkg.displayName,
  version: pkg.version,
  description: pkg.description,
  background: {
    service_worker: 'src/background/index.js',
    type: 'module'
  },
  content_scripts: [
    {
      js: ['src/content/index.js'],
      css: ['content.css'],
      matches: ['<all_urls>']
    }
  ],
  action: {
    default_popup: 'src/popup/index.html'
  },
  host_permissions: ['<all_urls>'],
  permissions: ['scripting', 'tabs', 'storage'],
  commands: {
    'Quick bookmark': {
      suggested_key: {
        default: 'Ctrl+E',
        mac: 'Command+E'
      },
      description: 'Quick bookmark'
    },
    _execute_action: {
      suggested_key: {
        default: 'Ctrl+B',
        mac: 'Command+B',
        linux: 'Ctrl+B'
      }
    }
  },
  icons: {
    '16': 'logo-16.png',
    '32': 'logo-32.png',
    '48': 'logo-48.png',
    '128': 'logo-128.png'
  }
}

export default manifest
