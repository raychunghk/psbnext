// peapack.js (PeaZip Integration Version)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const mode = (process.argv[2] || 'both').toLowerCase();

// Define PeaZip executable path
const PEAZIP_PATH = path.resolve('D:\\App\\peazip\\peazip\\App\\PeaZip64\\peazip.exe');
const DEPLOY_DIR = path.resolve(__dirname, 'deployment');

if (!fs.existsSync(DEPLOY_DIR)) {
  fs.mkdirSync(DEPLOY_DIR, { recursive: true });
}

// Keep paths strictly relative to prevent nested drive folder structures in archive
const SHARED_FILES = ['server.js', 'web.config', 'package.json', '.env.production'];
const BACKEND_FILES = ['backend/dist', 'backend/node_modules', 'backend/package.json'];
const FRONTEND_FILES = ['frontend/.next/standalone']; // Populated and aligned by build-post.js

let artifactsToPack = [];
let outputFileName = '';

if (mode === 'frontend') {
  artifactsToPack = [...SHARED_FILES, ...FRONTEND_FILES];
  outputFileName = 'frontenddeploy.7z';
} else if (mode === 'backend') {
  artifactsToPack = [...SHARED_FILES, ...BACKEND_FILES];
  outputFileName = 'backenddeploy.7z';
} else if (mode === 'both') {
  artifactsToPack = [...SHARED_FILES, ...BACKEND_FILES, ...FRONTEND_FILES];
  outputFileName = 'deploy.7z';
} else {
  console.error(`❌ Error: Invalid argument '${mode}'. Use 'frontend', 'backend', or 'both'.`);
  process.exit(1);
}

const target7zAbs = path.join(DEPLOY_DIR, outputFileName);

if (fs.existsSync(target7zAbs)) {
  console.log(`[Clean] Removing old archive: ${outputFileName}...`);
  fs.unlinkSync(target7zAbs);
}

// Validate that files exist locally
const validRelativePaths = artifactsToPack.filter(artifact => {
  const fullPath = path.resolve(__dirname, artifact);
  const exists = fs.existsSync(fullPath);
  if (exists) {
    console.log(`[Verified] Found: ${artifact}`);
  } else {
    console.warn(`[Skip Warning] Not found: ${artifact}`);
  }
  return exists;
});

if (validRelativePaths.length === 0) {
  console.error('❌ Error: No files found to pack. Build the app first.');
  process.exit(1);
}

// Format paths with double quotes for the command line
const formattedPaths = validRelativePaths.map(p => `"${p}"`).join(' ');

// Construct PeaZip CLI command:
// '-add27z' tells PeaZip to output a .7z file directly.
// By default, PeaZip takes target output path, followed by inputs.
const command = `"${PEAZIP_PATH}" -add27z "${target7zAbs}" ${formattedPaths}`;

console.log(`\n📦 Initializing PeaZip engine: Packing ${mode.toUpperCase()}...`);

try {
  // Execute from root directory (__dirname) to enforce relative path packing
  execSync(command, { stdio: 'inherit', cwd: __dirname });
  console.log(`\n🎉 Success! Created: deployment/${outputFileName}\n`);
} catch (error) {
  console.error('❌ Error during PeaZip compilation:', error.message);
  process.exit(1);
}