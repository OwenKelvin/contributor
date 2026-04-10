import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// Add request logging middleware BEFORE the SSR handler
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', async (req, res, next) => {
  console.log(`[SSR] Rendering: ${req.url}`);

  try {
    const response = await angularApp.handle(req);

    if (response) {
      console.log(`[SSR] Success for: ${req.url} - Status: ${response.status}`);
      await writeResponseToNodeResponse(response, res);
    } else {
      console.log(`[SSR] No response for: ${req.url}, calling next()`);
      next();
    }
  } catch (error) {
    console.error(`[SSR] Error rendering ${req.url}:`, error);
    console.error('Error stack:', error instanceof Error ? error.stack : error);

    // Send a clear error response for debugging
    res.status(500).send(`
      <html>
        <body>
          <h1>SSR Error</h1>
          <pre>${error instanceof Error ? error.message : String(error)}</pre>
          <h2>Stack Trace:</h2>
          <pre>${error instanceof Error ? error.stack : 'No stack trace'}</pre>
        </body>
      </html>
    `);
  }
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = Number(process.env['PORT']) || 4000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Node Express server listening on http://0.0.0.0:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
