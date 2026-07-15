import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

interface DeployOptions {
  environment?: 'development' | 'production';
}

async function deploy(options: DeployOptions = {}): Promise<void> {
  const env = options.environment || 'production';
  
  console.log('\x1b[32m%s\x1b[0m', `Deploying to ${env}...`);

  // Load environment variables from .env file
  const envFile = env === 'production' ? '.env.production' : '.env.development';
  const envPath = path.resolve(process.cwd(), envFile);
  console.log('\x1b[36m%s\x1b[0m', `Loading env from: ${envPath}`);
  
  // Read the env file and set environment variables
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.log('\x1b[33m%s\x1b[0m', `Warning: Could not load ${envFile}`);
  }

  // Build with environment variables
  execSync('npm run build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
    }
  });

  // Restart IIS Application Pool
  const appPoolName = 'NextJS-AppPool';
  try {
    execSync(`C:\\Windows\\System32\\inetsrv\\appcmd.exe recycle apppool ${appPoolName}`, { 
      stdio: 'inherit' 
    });
    console.log('\x1b[32m%s\x1b[0m', 'Application Pool restarted');
  } catch (error) {
    console.log('\x1b[33m%s\x1b[0m', 'Application Pool not found, creating...');
    execSync(`C:\\Windows\\System32\\inetsrv\\appcmd.exe add apppool /name:${appPoolName} /managedRuntimeVersion:v4.0`, { 
      stdio: 'inherit' 
    });
  }

  console.log('\x1b[32m%s\x1b[0m', 'Deployment complete!');
}

// Run deployment
const args = process.argv.slice(2);
const envFlag = args.find(arg => arg.startsWith('--env='));
const environment = envFlag?.split('=')[1] as 'development' | 'production' || 'production';


deploy({ environment }).catch(console.error);