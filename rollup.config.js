import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import pkg from './package.json';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }),
      commonjs({
        include: /node_modules/,
        extensions: ['.js', '.jsx'],
      }),
      typescript({ 
        tsconfig: './tsconfig.json', 
        exclude: ['**/__tests__/**'],
        jsx: 'react',
      }),
    ],
    external: [
      'react', 
      'react-dom', 
      'react-native', 
      'react-native-web',
      '@expo/vector-icons',
      'expo-font',
    ],
  },
];