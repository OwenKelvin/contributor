import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtmlPath = resolve(browserDistFolder, 'index.html');

const runtimeBackendUrl = process.env['BACKEND_URL'];
const runtimeConfigScript = runtimeBackendUrl
  ? `<script>window.__RUNTIME_CONFIG__={BACKEND_URL:${JSON.stringify(runtimeBackendUrl)}};</script>`
  : '';

function injectRuntimeConfig(html: string): string {
  if (!runtimeConfigScript) {
    return html;
  }
  // Inject before the closing </head> tag, or before the first <script> if no </head>.
  const headCloseIndex = html.indexOf('</head>');
  if (headCloseIndex !== -1) {
    return html.slice(0, headCloseIndex) + runtimeConfigScript + html.slice(headCloseIndex);
  }
  const firstScriptIndex = html.indexOf('<script');
  if (firstScriptIndex !== -1) {
    return html.slice(0, firstScriptIndex) + runtimeConfigScript + html.slice(firstScriptIndex);
  }
  return html;
}

function readIndexHtml(): string {
  try {
    return readFileSync(indexHtmlPath, 'utf8');
  } catch {
    return '';
  }
}

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts: ['*.sslip.io', 'localhost'],
  trustProxyHeaders: true,
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser (skip index.html so we can inject runtime config)
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Serve index.html with injected runtime config for direct navigation.
 */
app.get('/index.html', (req, res) => {
  res.send(injectRuntimeConfig(readIndexHtml()));
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req, { backendUrl: process.env['BACKEND_URL'] })
    .then((response) => {
      if (!response) {
        return next();
      }
      // If the engine served a prerendered index.html, inject runtime config.
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        return response
          .text()
          .then((html) => {
            const modified = injectRuntimeConfig(html);
            // Rebuild headers; drop Content-Length so the modified body isn't truncated.
            const modifiedHeaders = new Headers(response.headers);
            modifiedHeaders.delete('content-length');
            return new Response(modified, {
              status: response.status,
              statusText: response.statusText,
              headers: modifiedHeaders,
            });
          })
          .then((modifiedResponse) => writeResponseToNodeResponse(modifiedResponse, res));
      }
      return writeResponseToNodeResponse(response, res);
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
