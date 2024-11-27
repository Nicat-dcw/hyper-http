## Benchmarks

This directory contains benchmarking tools to compare HyperHttp with other frameworks.

### Running Benchmarks

```bash
# Run basic HyperHttp benchmark
npm run bench

# Run comparison benchmark with Hono
npm run bench:compare
```

### Benchmark Details

The comparison benchmark tests three endpoints:

1. GET / - Simple JSON response
2. GET /users/:id - Dynamic route with parameter
3. POST /data - JSON body handling

Metrics measured:
- Requests per second
- Average latency
- Throughput

Both frameworks are tested with:
- 100 concurrent connections
- 10 pipelining factor
- 10 second duration
- Identical routes and handlers
- Random port allocation to avoid conflicts

### Interpreting Results

Ratios greater than 1.0 indicate HyperHttp is performing better, while ratios less than 1.0 indicate Hono is performing better in that metric.