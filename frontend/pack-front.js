// frontend/pack-frontend.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ==========================================
// CLI ARGUMENT PARSING
// ==========================================
const args = process.argv.slice(2);
const KEEP_STAGING = args.includes('--keep-staging') || args.includes('-k');

// ==========================================
// CONFIGURATION & PATH RESOLUTION
// ==========================================
const ZIP_ENGINE_PATH = 'C:\\workbench\\js\\nodejs\\psb\\7z\\7za.exe';

const FRONTEND_DIR = __dirname;
const PROJECT_ROOT = path.resolve(FRONTEND_DIR, '..');

const STAGE_DIR = path.join(PROJECT_ROOT, 'frontend-stage');
const DEPLOY_DIR = path.join(PROJECT_ROOT, 'deployment');
const TARGET_ZIP_ABS = path.join(DEPLOY_DIR, 'frontenddeploy.zip');

const STANDALONE_ROOT = path.join(FRONTEND_DIR, '.next', 'standalone');
const SRC_STATIC = path.join(FRONTEND_DIR, '.next', 'static');
const SRC_PUBLIC = path.join(FRONTEND_DIR, 'public');

function cleanStagingDirectory() {
  console.log('[Step 1/6] Purging staging workspace...');
  if (fs.existsSync(STAGE_DIR)) {
    fs.rmSync(STAGE_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(STAGE_DIR, { recursive: true });
}

function buildNextApplication() {
  console.log('\n[Step 2/6] Compiling Next.js binaries...');
  execSync('npm run build', { stdio: 'inherit', cwd: FRONTEND_DIR });
}

function extractStandaloneFramework() {
  console.log('\n[Step 3/6] Copying complete standalone tree...');

  if (!fs.existsSync(STANDALONE_ROOT)) {
    throw new Error(`Standalone folder missing at:\n👉 ${STANDALONE_ROOT}`);
  }

  // Copy full standalone structure (preserving monorepo paths)
  fs.cpSync(STANDALONE_ROOT, STAGE_DIR, { recursive: true });
}

function injectStaticAssets() {
  console.log('\n[Step 4/6] Injecting missing static/chunk assets...');

  // Destination paths where server.js and clients look for chunk files
  const targets = [
    // 1. Staging Root
    { static: path.join(STAGE_DIR, '.next', 'static'), public: path.join(STAGE_DIR, 'public') },
    // 2. Nested Frontend Subfolder (where server.js executes in monorepo)
    { static: path.join(STAGE_DIR, 'frontend', '.next', 'static'), public: path.join(STAGE_DIR, 'frontend', 'public') }
  ];

  targets.forEach(({ static: destStatic, public: destPublic }) => {
    if (fs.existsSync(SRC_STATIC)) {
      console.log(`✨ Injecting static chunks -> ${destStatic}`);
      fs.cpSync(SRC_STATIC, destStatic, { recursive: true });
    }
    if (fs.existsSync(SRC_PUBLIC)) {
      console.log(`✨ Injecting public assets -> ${destPublic}`);
      fs.cpSync(SRC_PUBLIC, destPublic, { recursive: true });
    }
  });
}

function portRuntimeConfigurations() {
  console.log('\n[Step 5/6] Porting runtime configurations...');
  const environmentalAssets = ['.env', '.env.production', 'web.config'];

  environmentalAssets.forEach(file => {
    const srcFile = path.join(FRONTEND_DIR, file);
    // Port to nested frontend directory alongside server.js
    const destFile = path.join(STAGE_DIR, 'frontend', file);
    
    if (fs.existsSync(srcFile)) {
      console.log(`📄 Porting profile: ${file}`);
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

function compileZipArchive() {
  console.log('\n[Step 6/6] Compressing output into deployment package...');
  
  if (!fs.existsSync(DEPLOY_DIR)) {
    fs.mkdirSync(DEPLOY_DIR, { recursive: true });
  }

  if (fs.existsSync(TARGET_ZIP_ABS)) {
    fs.unlinkSync(TARGET_ZIP_ABS);
  }

  const command = `"${ZIP_ENGINE_PATH}" a -tzip "${TARGET_ZIP_ABS}" *`;
  execSync(command, { stdio: 'inherit', cwd: STAGE_DIR });
}

function purgeWorkspaceScratchFiles() {
  console.log('\n🧹 Cleaning up staging files...');
  if (fs.existsSync(STAGE_DIR)) {
    fs.rmSync(STAGE_DIR, { recursive: true, force: true });
  }
}

function main() {
  try {
    cleanStagingDirectory();
    buildNextApplication();
    extractStandaloneFramework();
    injectStaticAssets();
    portRuntimeConfigurations();

    // FLAG CHECK: Pause and preserve staging folder if --keep-staging or -k is passed
    if (KEEP_STAGING) {
      console.log('\n======================================================================');
      console.log('🛑 PIPELINE HALTED BEFORE COMPRESSION (--keep-staging ACTIVE)');
      console.log(`📂 Inspect staging contents at: ${STAGE_DIR}`);
      console.log('======================================================================\n');
      return;
    }

    compileZipArchive();
    
    console.log('\n======================================================================');
    console.log('🎉 SUCCESS! Deployment package created cleanly.');
    console.log(`📦 Archive: ${TARGET_ZIP_ABS}`);
    console.log('======================================================================\n');
    
    purgeWorkspaceScratchFiles();
  } catch (error) {
    console.error('\n❌ Build pipeline error:', error.message);
    process.exit(1);
  }
}

main();