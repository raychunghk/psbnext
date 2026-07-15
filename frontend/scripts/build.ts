import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

console.log('\x1b[32m%s\x1b[0m', 'Building Next.js application...');

// Install dependencies
execSync('npm install', { stdio: 'inherit' });

// Build for production
execSync('npm run build', { stdio: 'inherit' });

// Copy standalone build
const source = '.next/standalone';
const destination = '../deploy/nextjs-app';

if (fs.existsSync(destination)) {
  fs.rmSync(destination, { recursive: true, force: true });
}

fs.cpSync(source, destination, { recursive: true });

// Copy static files
fs.cpSync('.next/static', path.join(destination, '.next', 'static'), { recursive: true });
fs.copyFileSync('package.json', path.join(destination, 'package.json'));

console.log('\x1b[32m%s\x1b[0m', `Build complete! Deploy to IIS physical path: ${destination}`);