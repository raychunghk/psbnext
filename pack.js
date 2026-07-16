// pack.js (Clean Version)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const mode = (process.argv[2] || 'both').toLowerCase();
const SEVEN_ZIP_PATH = path.resolve(__dirname, '7z', '7za.exe');
const DEPLOY_DIR = path.resolve(__dirname, 'deployment');

if (!fs.existsSync(DEPLOY_DIR)) {
  fs.mkdirSync(DEPLOY_DIR, { recursive: true });
}

const SHARED_FILES = ['server.js', 'web.config', 'package.json', '.env.production'];
const BACKEND_FILES = ['backend/dist', 'backend/node_modules', 'backend/package.json'];
const FRONTEND_FILES = ['frontend/standalone']; // Perfectly aligned by build-post.js!

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
  console.error(`❌ Error: Invalid argument '${mode}'.`);
  process.exit(1);
}

const target7zAbs = path.join(DEPLOY_DIR, outputFileName);

if (fs.existsSync(target7zAbs)) {
  fs.unlinkSync(target7zAbs);
}

const validPaths = artifactsToPack.filter(artifact => {
  const fullPath = path.resolve(__dirname, artifact);
  return fs.existsSync(fullPath);
}).map(p => `"${path.resolve(__dirname, p)}"`);

const command = `"${SEVEN_ZIP_PATH}" a "${target7zAbs}" ${validPaths.join(' ')} -t7z -mx=0 -m0=Copy -spf`;

try {
  execSync(command, { stdio: 'inherit' });
  console.log(`\n🎉 Success! Created: deployment/${outputFileName}\n`);
} catch (error) {
  console.error('❌ Error executing 7za:', error.message);
  process.exit(1);
}