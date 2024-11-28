import autocannon from 'autocannon';
import { App as HyperHttp } from '../dist/framework/app.cjs';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import express from 'express';

// Test data
const users = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`
}));

// Utility to run benchmark
async function runBenchmark(name, port) {
  console.log(`\nRunning benchmark for ${name}...`);

  return new Promise((resolve, reject) => {
    const instance = autocannon({
      url: `http://localhost:${port}`,
      connections: 100,
      pipelining: 10,
      duration: 10,
      requests: [
        {
          method: 'GET',
          path: '/'
        },
        {
          method: 'GET',
          path: '/users/1'
        },
        {
          method: 'POST',
          path: '/data',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({ hello: 'world' })
        }
      ]
    });

    instance.on('done', (result) => {
      console.log('\nResults:');
      console.log(`Requests/sec: ${result.requests.average}`);
      console.log(`Latency (ms): ${result.latency.average}`);
      console.log(
        `Throughput (MB/s): ${(result.throughput.average / 1024 / 1024).toFixed(2)}`
      );
      resolve(result);
    });

    instance.on('error', reject);
  });
}

async function main() {
  let hyperHttpServer;
  let honoServer;
  let expressServer;

  try {
    // Setup and run HyperHttp benchmark
    const hyperHttp = new HyperHttp();

    hyperHttp.get('/', (c) => c.json({ hello: 'world' }));
    hyperHttp.get('/users/:id', (c) => {
      const userId = parseInt(c.params.id);
      if (isNaN(userId)) {
        return c.json({ error: 'Invalid user ID' }, 400);
      }
      const user = users.find((u) => u.id === userId);
      return c.json(user || { error: 'User not found' });
    });
    hyperHttp.post('/data', async (c) => {
      try {
        const body = await c.body;
        if (!body || typeof body !== 'object') {
          return c.json({ error: 'Invalid JSON body' }, 400);
        }
        return c.json(body);
      } catch (err) {
        return c.json({ error: 'Malformed JSON' }, 400);
      }
    });

    hyperHttpServer = hyperHttp.listen(3001);
    const hyperHttpResults = await runBenchmark('HyperHttp', 3001);

    // Setup and run Hono benchmark
    const hono = new Hono();

    hono.get('/', (c) => c.json({ hello: 'world' }));
    hono.get('/users/:id', (c) => {
      const userId = parseInt(c.req.param('id'));
      if (isNaN(userId)) {
        return c.json({ error: 'Invalid user ID' }, 400);
      }
      const user = users.find((u) => u.id === userId);
      return c.json(user || { error: 'User not found' });
    });
    hono.post('/data', async (c) => {
      try {
        const body = await c.req.json();
        if (!body || typeof body !== 'object') {
          return c.json({ error: 'Invalid JSON body' }, 400);
        }
        return c.json(body);
      } catch (err) {
        return c.json({ error: 'Malformed JSON' }, 400);
      }
    });

    await new Promise((resolve) => {
      honoServer = serve(
        {
          fetch: hono.fetch,
          port: 3002
        },
        () => resolve()
      );
    });

    const honoResults = await runBenchmark('Hono', 3002);

    // Setup and run Express benchmark
    const expressApp = express();

    expressApp.get('/', (req, res) => res.json({ hello: 'world' }));
    expressApp.get('/users/:id', (req, res) => {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      const user = users.find((u) => u.id === userId);
      return res.json(user || { error: 'User not found' });
    });
    expressApp.post('/data', express.json(), (req, res) => {
      const body = req.body;
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
      return res.json(body);
    });

    expressServer = expressApp.listen(3004, () => {
      console.log(`Express server listening at http://localhost:3004`);
    });
    const expressResults = await runBenchmark('Express', 3004);

    // Compare results
    console.log('\nComparison (HyperHttp vs Hono vs Express):');
    console.log(
      'Requests/sec ratio (HyperHttp vs Hono):',
      (hyperHttpResults.requests.average / honoResults.requests.average).toFixed(2)
    );
    console.log(
      'Requests/sec ratio (Hono vs Express):',
      (honoResults.requests.average / expressResults.requests.average).toFixed(2)
    );
    console.log(
      'Latency ratio (HyperHttp vs Hono):',
      (hyperHttpResults.latency.average / honoResults.latency.average).toFixed(2)
    );
    console.log(
      'Latency ratio (Hono vs Express):',
      (honoResults.latency.average / expressResults.latency.average).toFixed(2)
    );
    console.log(
      'Throughput ratio (HyperHttp vs Hono):',
      (hyperHttpResults.throughput.average / honoResults.throughput.average).toFixed(2)
    );
    console.log(
      'Throughput ratio (Hono vs Express):',
      (honoResults.throughput.average / expressResults.throughput.average).toFixed(2)
    );
  } catch (error) {
    console.error('Benchmark error:', error);
    process.exit(1);
  } finally {
    // Cleanup
    if (hyperHttpServer) {
      hyperHttpServer.close();
    }
    if (honoServer) {
      honoServer.close();
    }
    if (expressServer) {
      expressServer.close();
    }
  }
}

main();