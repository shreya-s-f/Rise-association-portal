const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Path to project's node_modules
const root = process.cwd()
const nodeModulesPath = path.join(root, 'node_modules')

function isNodeModulesPresent() {
  try {
    const stat = fs.statSync(nodeModulesPath)
    if (!stat.isDirectory()) return false
    const files = fs.readdirSync(nodeModulesPath)
    return files.length > 0
  } catch (e) {
    return false
  }
}

if (isNodeModulesPresent()) {
  console.log('Dependencies already installed — skipping install.')
  process.exit(0)
}

console.log('node_modules missing — installing dependencies (npm ci)...')
const cmd = process.env.npm_execpath || 'npm'
const args = ['ci', '--no-audit', '--prefer-offline']

const child = spawnSync(cmd, args, { stdio: 'inherit', shell: true })
if (child.error) {
  console.error('Failed to run install:', child.error)
  process.exit(1)
}
process.exit(child.status)
