// backend/build.js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20', // Matches your Node runtime
  outfile: 'dist/main.js',
  keepNames: true, // Crucial for NestJS dependency injection & decorators
  external: [
    // Exclude optional lazy-loaded NestJS drivers that you aren't using
    '@nestjs/microservices',
    '@nestjs/websockets',
    'class-transformer',
    'class-validator'
  ],
}).then(() => {
  console.log('? NestJS successfully bundled into a single file with esbuild!');
}).catch(() => process.exit(1));