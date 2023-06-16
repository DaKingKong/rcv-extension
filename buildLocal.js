require('dotenv').config();
const { build } = require('esbuild');
const copyStaticFiles = require('esbuild-copy-static-files');
const envFilePlugin = require('esbuild-envfile-plugin');

const envVars = ['APP_SERVER','RC_SERVER','CLIENT_ID','REDIRECT_URI']

async function runBuild() {
    const define = {}
        for (const k in process.env) {
            if(envVars.includes(k))
            {
                define[`process.env.${k}`] = JSON.stringify(process.env[k])
            }
        }

    build({
        entryPoints: ['src/client/content.js', 'src/client/sw.js', 'src/client/ringcentral.js'],
        loader: { '.js': 'jsx', '.png': 'dataurl' },
        bundle: true,
        jsx: 'automatic',
        write: true,
        outdir: 'dist',
        define,
        plugins: [
            copyStaticFiles({
                src: './local',
                dest: './dist',
                dereference: true,
                recursive: true,
            }),
            envFilePlugin
        ]
    })
}

runBuild();