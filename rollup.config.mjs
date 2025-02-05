import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/main.ts',
    output: {
        dir: '.',
        format: 'cjs',
        exports: 'default',
    },
    external: ['obsidian'],
    plugins: [
        resolve(),
        commonjs(),
        typescript() // Aggiungi il plugin TypeScript qui
    ],
};
