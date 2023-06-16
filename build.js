const { build } = require('esbuild');
const copyStaticFiles = require('esbuild-copy-static-files');


async function runBuild() {
    build({
        entryPoints: ['src/client/content.js', 'src/client/sw.js', 'src/client/ringcentral.js'],
        loader: { '.js': 'jsx', '.png': 'dataurl' },
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