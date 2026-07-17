// frontend/build-post.js
const fs = require('fs');
const path = require('path');

// CORRECTED: Point directly to '.next/standalone' (no nested '/frontend' folder)
const standaloneAppDir = path.resolve(__dirname, '.next/standalone');

// Helper to recursively copy directories
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('🏁 Next.js build completed. Starting post-build asset alignment...');

if (fs.existsSync(standaloneAppDir)) {
  const srcStatic = path.resolve(__dirname, '.next/static');
  const srcPublic = path.resolve(__dirname, 'public');
  
  // These targets match your standalone folder perfectly:
  // - .next/static goes to .next/standalone/.next/static
  // - public goes to .next/standalone/public
  const destStatic = path.join(standaloneAppDir, '.next/static');
  const destPublic = path.join(standaloneAppDir, 'public');

  // 1. Copy static folder to .next/standalone/.next/static
  if (fs.existsSync(srcStatic)) {
    console.log(`[Post-Build] Copying static assets -> .next/standalone/.next/static`);
    copyDirSync(srcStatic, destStatic);
  } else {
    console.warn(`[Post-Build Warning] '.next/static' folder not found.`);
  }

  // 2. Copy public folder to .next/standalone/public
  if (fs.existsSync(srcPublic)) {
    console.log(`[Post-Build] Copying public assets -> .next/standalone/public`);
    copyDirSync(srcPublic, destPublic);
  } else {
    console.warn(`[Post-Build Warning] 'public' folder not found.`);
  }

  console.log('✨ Post-build alignment complete! Standalone app is ready to run.');
} else {
  console.error(`❌ Error: '${standaloneAppDir}' directory not found. Did 'next build' run successfully?`);
  process.exit(1);
}