import resolve from '@rollup/plugin-node-resolve';
import ts from '@wessberg/rollup-plugin-ts';
import postcss from 'rollup-plugin-postcss';
import markdown from '@jackfranklin/rollup-plugin-markdown';
import json from 'rollup-plugin-json';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import del from 'rollup-plugin-delete';

const commonPlugins = [
  ts({ transpiler: 'babel' }),
];

export default [
  {
    input: './src/index.ts',
    inlineDynamicImports: true,
    output: {
      file: 'dist/index.js',
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'styled-components': 'styled',
      },
    },
    external: [
      /^@babel\/runtime\//,
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',
      'styled-components',
    ],
    plugins: [
      del({ targets: 'dist/*' }),
      resolve(),
      commonjs(),
      peerDepsExternal(),
      postcss({
        modules: true,
        extract: true
      }),
      markdown(),
      json({
        // All JSON files will be parsed by default,
        // but you can also specifically include/exclude files
        include: 'node_modules/**',
        exclude: [ 'node_modules/foo/**', 'node_modules/bar/**' ],

        // for tree-shaking, properties will be declared as
        // variables, using either `var` or `const`
        preferConst: true, // Default: false

        // specify indentation for the generated default export —
        // defaults to '\t'
        indent: '  ',

        // ignores indent and generates the smallest code
        compact: true, // Default: false

        // generate a named export for every property of the JSON object
        namedExports: true // Default: true
      }),
      ...commonPlugins,
      replace({
        "process.env.NODE_ENV": JSON.stringify("production")
      }),
    ],
  },
];