import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

// https://stenciljs.com/docs/config

export const config: Config = {
  plugins: [
    sass()
  ],
  taskQueue: 'async',
  namespace: 'i2d',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'www',
      serviceWorker: null
    },
    {
      type: 'docs-readme'
    },
  ],
  globalScript: 'src/global/app.ts',
};
