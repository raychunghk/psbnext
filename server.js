const { spawn } = require('child_process');
const path = require('path');

// 1. Determine Ports
const frontendPort = process.env.PORT || 3000; // Passed dynamically by IIS httpPlatformHandler
const backendPort = 5000;                      // NestJS runs internally on 5000

console.log(`[Master] Launching Application Cluster under /next ...`);
console.log(`[Master] Public IIS Port (Next.js Frontend): ${frontendPort}`);
console.log(`[Master] Private Port (Nest.js Backend): ${backendPort}`);

// 2. Spawn Nest.js Backend (D:\ASD\PSBIIS\psb\psbnode\backend)
const backend = spawn(
  process.execPath, // Points to your portable D:\ASD\nodejsv2418\node.exe
  ['dist/main.js'],
  {
    cwd: path.join(__dirname, 'backend'),
    env: { ...process.env, PORT: backendPort }
  }
);

// 3. Spawn Next.js Frontend (D:\ASD\PSBIIS\psb\psbnode\frontend)
const frontend = spawn(
  process.execPath,
  [path.join(__dirname, 'frontend/node_modules/next/dist/bin/next'), 'start', '-p', frontendPort],
  {
    cwd: path.join(__dirname, 'frontend'),
    env: process.env
  }
);

// 4. Pipe logging output cleanly to stdout so IIS can capture it in cluster.log
backend.stdout.on('data', (data) => console.log(`[NestJS] ${data.toString().trim()}`));
backend.stderr.on('data', (data) => console.error(`[NestJS Error] ${data.toString().trim()}`));

frontend.stdout.on('data', (data) => console.log(`[Next.js] ${data.toString().trim()}`));
frontend.stderr.on('data', (data) => console.error(`[Next.js Error] ${data.toString().trim()}`));

// 5. Safety: Ensure child processes die if the master IIS process terminates or recycles
process.on('exit', () => {
  backend.kill();
  frontend.kill();
});