// server.js (Root Directory)
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 1. Determine Ports
const frontendPort = process.env.PORT || 3000; // Passed dynamically by IIS httpPlatformHandler
const backendPort = 5000;                     // NestJS runs internally on 5000

// Parse Arguments (-f = Frontend only, -b = Backend only, default = Both)
const args = process.argv.slice(2);
let runF = true;
let runB = true;

if (args.includes('-f') || args.includes('-b')) {
  runF = args.includes('-f');
  runB = args.includes('-b');
}

console.log(`[Master] Launching Application Cluster under /next ...`);
console.log(`[Master] Public IIS Port (Next.js Frontend): ${frontendPort}`);
console.log(`[Master] Private Port (Nest.js Backend): ${backendPort}`);
console.log(`[Master] Active Services: Frontend (${runF ? 'ON' : 'OFF'}), Backend (${runB ? 'ON' : 'OFF'})\n`);

let backendProcess = null;
let frontendProcess = null;

// ==========================================
// FUNCTION: Run Nest.js Backend
// ==========================================
function startBackend() {
  console.log(`[Master] Spawning Backend process...`);
  
  backendProcess = spawn(
    process.execPath, // Keeps your exact working portable node.exe execution
    ['dist/main.js'],
    {
      cwd: path.join(__dirname, 'backend'),
      env: { ...process.env, PORT: backendPort }
    }
  );

  // Pipe logging output cleanly
  backendProcess.stdout.on('data', (data) => console.log(`[NestJS] ${data.toString().trim()}`));
  backendProcess.stderr.on('data', (data) => console.error(`[NestJS Error] ${data.toString().trim()}`));
}

// ==========================================
// FUNCTION: Run Next.js Frontend
// ==========================================
function startFrontend() {
  // Working Directory (D:\ASD\PSBIIS\psb\psbnode\next\frontend)
  const frontendCwd = path.join(__dirname, 'frontend');
  
  // Standalone target server file (D:\ASD\PSBIIS\psb\psbnode\next\frontend\standalone\server.js)
  const standaloneServerFile = path.join(frontendCwd, 'standalone/server.js');
  const fallbackNextBin = path.join(frontendCwd, 'node_modules/next/dist/bin/next');

  // Case A: Standalone Deployment (Matching your working console command)
  if (fs.existsSync(standaloneServerFile)) {
    console.log(`[Master] Spawning Frontend in Standalone Production mode...`);
    frontendProcess = spawn(
      process.execPath,
      ['standalone/server.js'], // Runs with context matching: node .\standalone\server.js
      {
        cwd: frontendCwd,
        env: { ...process.env, PORT: frontendPort }
      }
    );
  } 
  // Case B: Dev/Fallback Mode (If node_modules is present locally)
  else if (fs.existsSync(fallbackNextBin)) {
    console.log(`[Master] Standalone files not found. Spawning Frontend in Full Dev/Fallback mode...`);
    frontendProcess = spawn(
      process.execPath,
      [fallbackNextBin, 'start', '-p', frontendPort],
      {
        cwd: frontendCwd,
        env: process.env
      }
    );
  } else {
    console.error(`❌ [Master Error] Could not locate any valid Next.js launch targets (Standalone server.js or node_modules/next).`);
    process.exit(1);
  }

  // Pipe logging output cleanly
  frontendProcess.stdout.on('data', (data) => console.log(`[Next.js] ${data.toString().trim()}`));
  frontendProcess.stderr.on('data', (data) => console.error(`[Next.js Error] ${data.toString().trim()}`));
}

// ==========================================
// EXECUTION BLOCK
// ==========================================
if (runB) {
  startBackend();
}

if (runF) {
  startFrontend();
}

// ==========================================
// SAFETY: Ensure clean child teardowns
// ==========================================
process.on('exit', () => {
  if (backendProcess) {
    console.log('[Master] Terminating Backend Process...');
    backendProcess.kill();
  }
  if (frontendProcess) {
    console.log('[Master] Terminating Frontend Process...');
    frontendProcess.kill();
  }
});