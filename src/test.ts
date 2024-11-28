import { Hyper as App, HyperContext } from './index.ts';
import { logger } from './middleware/logger.ts';
import { cors } from './middleware/cors.ts';

const app = new App();

// Middleware
app.use(logger());
app.use(cors());

// Routes
app.get('/', (c:HyperContext) => {
  return c.json({
    message: 'Welcome to Hyper HTTP',
    version: '1.0.0'
  });
});

app.get('/users/:id', (c:any) => {
  return c.json({
    userId: c.params.id,
    query: c.query
  });
});

app.post('/api/data', async (c:any) => {
  return c.json({
    received: c.body,
    timestamp: new Date().toISOString()
  });
});

app.get('/html', (c:any) => {
  return c.html('<h1>Hello World!</h1>');
});

app.post('/redirect', (c:HyperContext) => {
  console.log(c.body)
  return c.redirect('/');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});