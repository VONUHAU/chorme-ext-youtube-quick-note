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
      matches: ['https://*.youtube.com/*']
    }
  ],
  action: {
    default_popup: 'src/popup/index.html'
  },
  permissions: ['scripting', 'activeTab', 'tabs', 'storage', 'unlimitedStorage'],
  commands: {
    _execute_action: {
      suggested_key: {
        default: 'Ctrl+B',
        mac: 'Command+B'
      }
    }
  }
}

export default manifest