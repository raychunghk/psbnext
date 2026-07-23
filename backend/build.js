// backend/build.js
const esbuild = require('esbuild');
const esbuildPluginTsc = require('esbuild-plugin-tsc');

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/main.js',
  keepNames: true,
  plugins: [
    esbuildPluginTsc({
      tsconfigPath: './tsconfig.json' // Forces tsc to emit decorator metadata for NestJS
    })
  ],
  // Prevent esbuild from replacing process.env during bundling
  define: {
    // Keep standard node environment variable calls intact at runtime
    'process.env.NODE_ENV': 'process.env.NODE_ENV',
  },
  external: [
    '@nestjs/microservices',
    '@nestjs/websockets',
    'class-transformer',
    'class-validator'
  ],
}).then(() => {
  console.log('🎉 NestJS bundled successfully with TypeScript metadata intact!');
}).catch(() => process.exit(1));