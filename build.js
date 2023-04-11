const { build } = require('esbuild');
const copyStaticFiles = require('esbuild-copy-static-files');


async function runBuild() {
    build({
        entryPoints: ['src/content.js', 'src/sw.js','src/ringcentral.js'],
        loader: { '.js': 'jsx' },
        bundle: true,
        jsx: 'automatic',
        write: true,
        outdir: 'dist',
        plugins: [
            copyStaticFiles({
                src: './public',
                dest: './dist',
                dereference: true,
                recursive: true,
            })
        ]
    })
}

runBuild();