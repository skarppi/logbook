import { createProxyMiddleware } from "http-proxy-middleware";
import { Router } from "express";
import { BASE_URL } from "../config";

export function staticsDevRouter() {
  const router = Router();

  // All the assets are hosted by Webpack on localhost:3001 (Webpack-dev-server)
  router.use(
    ["/public", "/sockjs-node"],
    createProxyMiddleware({
      target: "http://localhost:3001/",
      ws: true,
    })
  );

  // Any route should render the web app html (hosted by by Webpack-dev-server)
  router.use(
    "**",
    createProxyMiddleware({
      target: "http://localhost:3001/",
      pathRewrite: (path) => `${BASE_URL}/public/index.html`,
    })
  );

  return router;
}
