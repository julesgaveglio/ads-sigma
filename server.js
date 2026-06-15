// Startup file for Passenger (O2Switch / cPanel)
// Loads .env.local then starts the Next.js standalone server

const path = require('path')
const fs = require('fs')

// Load .env.local before anything else
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  }
}

process.env.PORT = process.env.PORT || '3000'
process.env.HOSTNAME = '0.0.0.0'

process.chdir(path.join(__dirname, '.next', 'standalone'))
require('./.next/standalone/server.js')
