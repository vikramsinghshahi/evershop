import type { AddressInfo } from 'net';
import express from 'express';
import healthProbe from '../../healthProbe.js';

function listen(app: express.Express): Promise<{ port: number; close: () => void }> {
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;
  return Promise.resolve({
    port,
    close: () => {
      server.close();
    }
  });
}

describe('healthProbe', () => {
  const app = express();
  app.use(healthProbe);
  app.all('*', (_req, res) => res.status(200).send('page'));

  let base: string;
  let close: () => void;

  beforeAll(async () => {
    const started = await listen(app);
    base = `http://127.0.0.1:${started.port}`;
    close = started.close;
  });

  afterAll(() => {
    close();
  });

  it('returns a tiny 200 for GET /health without reaching later handlers', async () => {
    const response = await fetch(`${base}/health`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/text\/plain/);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.text()).toBe('ok');
  });

  it('returns 200 for HEAD /health with an empty body', async () => {
    const response = await fetch(`${base}/health`, { method: 'HEAD' });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('');
  });

  it('answers /healthz the same way', async () => {
    const response = await fetch(`${base}/healthz`);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('ok');
  });

  it('leaves every other path to the next handler', async () => {
    const response = await fetch(`${base}/`);
    expect(await response.text()).toBe('page');
  });

  it('does not treat POST /health as a probe', async () => {
    const response = await fetch(`${base}/health`, { method: 'POST' });
    expect(await response.text()).toBe('page');
  });

  it.each(['/favicon.ico', '/assets/favicon.ico'])(
    'serves the icon at %s without reaching later handlers',
    async (path) => {
      const response = await fetch(`${base}${path}`);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toMatch(/image\/x-icon/);
      const body = Buffer.from(await response.arrayBuffer());
      // ICO header: reserved 0, type 1 (icon).
      expect(body.subarray(0, 4)).toEqual(Buffer.from([0, 0, 1, 0]));
    }
  );

  it('returns 200 for HEAD /favicon.ico with an empty body', async () => {
    const response = await fetch(`${base}/favicon.ico`, { method: 'HEAD' });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('');
  });
});
