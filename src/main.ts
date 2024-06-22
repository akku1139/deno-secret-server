import { Hono } from "hono"
const app = new Hono()

app.get("/", (c) => c.text("Hono!"))

app.use("/api/*", async (c, next) => {
  // Cookie
  // Bearer
  await next()
})

/*
ストア管理
- Text
- KV (JSON)
- List
*/

export default app
