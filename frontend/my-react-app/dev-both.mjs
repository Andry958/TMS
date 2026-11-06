import { spawn } from 'node:child_process'

const run = (env) =>
  spawn('npx', ['vite'], { stdio: 'inherit', env: { ...process.env, ...env } })

const children = [run({}), run({ VITE_PROTOCOL: 'http' })]

const stop = () => children.forEach((c) => c.kill())
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
children.forEach((c) => c.on('exit', stop))
