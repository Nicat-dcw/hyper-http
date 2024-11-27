import autocannon from 'autocannon';
import { App as HyperHttp } from '../src/framework/app.ts';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';

// Test data
const users = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`
}));

// Utility to run benchmark
async function runBenchmark(name: string, port: number) {
  console.log(`\nRunning benchmark for ${name}...`);
  
  return new Promise<autocannon.Result>((resolve, reject) => {
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
      console.log(`Throughput (MB/s): ${(result.throughput.average / 1024 / 1024).toFixed(2)}`);
      resolve(result);
    });

    instance.on('error', reject);
  });
}

async function main() {
  let hyperHttpServer;
  let honoServer;

  try {
    // Setup and run HyperHttp benchmark
    const hyperHttp = new HyperHttp();
    
    hyperHttp.get('/', (c) => c.json({ hello: 'world' }));
    hyperHttp.get('/users/:id', (c) => {
      const userId = parseInt(c.params.id);
      if (isNaN(userId)) {
        return c.json({ error: 'Invalid user ID' }, 400);
      }
      const user = users.find(u => u.id === userId);
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
      const user = users.find(u => u.id === userId);
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

    // Create server and wait for it to start
    await new Promise<void>((resolve) => {
      honoServer = serve({
        fetch: hono.fetch,
        port: 3002
      }, () => resolve());
    });

    const honoResults = await runBenchmark('Hono', 3002);

    // Compare results
    console.log('\nComparison (HyperHttp vs Hono):');
    console.log('Requests/sec ratio:', (hyperHttpResults.requests.average / honoResults.requests.average).toFixed(2));
    console.log('Latency ratio:', (hyperHttpResults.latency.average / honoResults.latency.average).toFixed(2));
    console.log('Throughput ratio:', (hyperHttpResults.throughput.average / honoResults.throughput.average).toFixed(2));

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
  }
}

main();