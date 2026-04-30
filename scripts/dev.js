const { spawn } = require('child_process');
const path = require('path');
const root = path.resolve(__dirname, '..');

// Start backend silently in background (all platforms)
const backend = spawn('npm', ['run', 'dev:backend'], {
  cwd: root,
  shell: true,
  stdio: 'ignore',
  windowsHide: true,
});

// Run frontend in current terminal — clean Next.js output
const frontend = spawn('npm', ['run', 'dev:frontend'], {
  cwd: root,
  shell: true,
  stdio: 'inherit',
});

frontend.on('exit', (code) => process.exit(code ?? 0));
