import { Hyper as App, HyperContext } from "./index.ts";
import { logger } from "./middleware/logger.ts";
import { cors } from "./middleware/cors.ts";

const app = new App();
console.log(App);


app.use(async (ctx, next) => {
  console.log(`Request: ${ctx.request.method} ${ctx.url.pathname}`);
  const startTime = Date.now();
  const response = await next();
  console.log(`Response time: ${Date.now() - startTime}ms`);
  return response;
});
app.use(cors())
// Routes
app.get("/", (c: HyperContext) => {
  logger("error", "Fix it", c, () => {});
  return c.json({
    message: "Welcome to Hyper HTTP",
    version: "1.0.0",
  });
});

app.get("/users/:id", (c: any) => {
  return c.json({
    userId: c.params.id,
    query: c.query,
  });
});

app.post("/api/data", async (c: any) => {
  return c.json({
    received: c.body,
    timestamp: new Date().toISOString(),
  });
});

app.get("/html", (c: any) => {
  return c.html("<h1>Hello World!</h1>");
});

app.post("/redirect", async (c: HyperContext) => {
  const d = await c.data();
  console.log(c);
  return c.redirect("/");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
