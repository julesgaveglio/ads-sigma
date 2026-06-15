// Startup file for Passenger (O2Switch / cPanel)
// Wraps Next.js standalone server for Passenger compatibility
//
// After `npm run build`, copy the standalone output:
//   cp -r .next/standalone/* .
//   cp -r .next/static .next/standalone/.next/static
//   cp -r public .next/standalone/public
//
// Then Passenger picks up this file as the entry point.

process.env.PORT = process.env.PORT || '3000'
process.env.HOSTNAME = '0.0.0.0'

require('./.next/standalone/server.js')
