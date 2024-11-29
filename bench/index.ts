import autocannon from "autocannon";
import { App } from "../src/framework/app.ts";

// Start server
const app = new App();

app.get("/", (c: any) => c.json({ hello: "world" }));
app.get("/users/:id", (c: any) => c.json({ id: c.params.id }));
app.post("/data", async (c: any) => c.json(c.body));

const server = app.listen(3000);

// Run benchmark
const instance = autocannon({
  url: "http://localhost:3000",
  connections: 100,
  pipelining: 10,
  duration: 10,
  requests: [
    {
      method: "GET",
      path: "/",
    },
    {
      method: "GET",
      path: "/users/1",
    },
    {
      method: "POST",
      path: "/data",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ hello: "world" }),
    },
  ],
});

instance.on("done", (result) => {
  console.log("\nResults:");
  console.log(`Requests/sec: ${result.requests.average}`);
  console.log(`Latency (ms): ${result.latency.average}`);
  console.log(
    `Throughput (MB/s): ${(result.throughput.average / 1024 / 1024).toFixed(2)}`,
  );

  server.close();
  process.exit(0);
});
