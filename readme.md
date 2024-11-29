## Hyper HTTP - Fastest NodeJS Web Framework
---
Fast and Optimized Web Framework for nodejs

###  Features
- ⛈️ Lightweight and Extremely fast: The Package is uses less packages and uses web standarts `node:http`. İt's speed come from `find-my-way` and our optimized code
- 🚚 Middleware: Hyper has middleware support. You can do custom middlewares and use it
- 📃 Type Support: Hyper has its own typings

 
### Quick Start
```ts
import { Hyper, HyperContext } from "@hyper/server";

const app = new Hyper();
// Use HyperContext for ts support
app.get("/", (c: HyperContext) => {
  return c.json({
    message: "Welcome to Hyper HTTP",
    version: "1.0.0",
  });
});
```
---
> ### Future Plans
- [ ] Add Plugin Support @hyper/cors
- [ ] Make Bun Version of Hyper HTTP
- [ ] İncrease İt's speed and performance over other packages 
- [ ] Add Custom Log messages with debug mode new Hyper({ debug: { enabled: true, stylize: true}})
