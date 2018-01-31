import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/mahjong.js',
    format: 'cjs'
  },
  sourcemap: true,
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: 'build/tsconfig.json'
    })
  ]
};
