// frontend/clean.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Targets to purge
const targets = ['.next', 'dist', 'src/generated'];

console.log('🧹 Starting fast, Explorer-safe directory purge...');

// Create a temporary blank staging directory
const emptyDir = path.join(__dirname, '_empty_purge_holder_');
if (!fs.existsSync(emptyDir)) {
  fs.mkdirSync(emptyDir, { recursive: true });
}

targets.forEach((target) => {
  const targetPath = path.join(__dirname, target);

  if (fs.existsSync(targetPath)) {
    try {
      console.log(`[Clean] Purging contents of: ${target}...`);
      // Robocopy mirrors the empty directory into the target, instantly wiping its files 
      // without locking or disrupting explorer.exe notification cycles
      execSync(`robocopy "${emptyDir}" "${targetPath}" /MIR /w:0 /r:0`, { stdio: 'ignore' });
      
      // Now that it's empty, safely drop the root folder shell index
      fs.rmdirSync(targetPath);
    } catch (err) {
      // Robocopy returns exit codes 0-3 on successful copies/mirrors, which Node treats as an error.
      // Double check if the directory was successfully removed.
      if (fs.existsSync(targetPath)) {
        console.warn(`[Clean Warning] Native purge failed for ${target}, falling back to sync unlinking.`);
        fs.rmSync(targetPath, { recursive: true, force: true });
      }
    }
  }
});

// Clean up the temporary empty folder
if (fs.existsSync(emptyDir)) {
  fs.rmdirSync(emptyDir);
}

console.log('✨ Cleanup complete! Windows Explorer remains happy.');