const esbuild = require('esbuild');
const path = require('path');

const isWatch = process.argv.includes('--watch');

const buildOptions = {
    entryPoints: ['src/extension.ts'],
    bundle: true,
    outfile: 'dist/extension.js',
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    minify: !isWatch,
    logLevel: 'info',
};

async function build() {
    try {
        if (isWatch) {
            const context = await esbuild.context(buildOptions);
            await context.watch();
            console.log('👀 Watching for changes...');
        } else {
            await esbuild.build(buildOptions);
            console.log('✓ Build complete!');
        }
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
