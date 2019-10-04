import * as proxy from 'http-proxy-middleware';
import { Router } from 'express';
import { PUBLIC_URL } from '../config';

export function staticsDevRouter() {
  const router = Router();

  // All the assets are hosted by Webpack on localhost:8080 (Webpack-dev-server)
  router.use('/public', proxy(
    {
      target: 'http://localhost:8080/'
    }));

  router.use('/sockjs-node/info', proxy({
    target: 'http://localhost:8080',
    ws: true
  }));

  // Any route should render the web app html (hosted by by Webpack-dev-server)
  router.use('**', proxy(
    {
      target: 'http://localhost:8080/',
      pathRewrite: path => `${PUBLIC_URL}/public/index.html`,
    }));

  return router;
}
