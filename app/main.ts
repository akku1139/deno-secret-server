import { Context, Hono } from "hono"
const app = new Hono()
import { validator } from 'hono/validator'

import { bearerAuth } from "hono/bearer-auth"
import { getCookie }from "hono/cookie"

app.get("/", (c) => c.text("Hono!"))

const kv = await Deno.openKv()

/*
CORS
CSRF
*/
app.use("/api/*", async (c, next) => {
  // Cookie
  // https://qiita.com/NewGyu/items/0b3111b61405366a76c5#%E4%BD%99%E8%AB%87cooke%E3%81%AE%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3

  // Bearer
  if(Deno.env.has("DEV")) {
    await next()
  } else {
    return new Response("unauthorized", {status: 401})
  }
})

const secretType = ["text", "list", "json"] as const
type SecretType = (typeof secretType)[number]

const valiType = (c: Context, type: SecretType, value: any /* string | Array<any> | Object */) => {
  let init
  switch(type) {
    case "text":
      if(typeof value === "undefined") {
        init = ""
      } else if(typeof value === "string") {
        init = value
      } else {
        return c.text("Wrong type: \"init\"", 400)
      }
      break
      case "list":
        if(typeof value === "undefined") {
          init = []
        } else if(Array.isArray(value)) {
          init = value
        } else {
          return c.text("Wrong type: \"init\"", 400)
        }
        break
      case "json":
        if(typeof value === "undefined") {
          init = {}
        } else if(typeof value === 'object' && value !== null && !Array.isArray(value)) {
          init = value
        } else {
          return c.text("Wrong type: \"init\"", 400)
        }
        break
  }
  return init
}

app.get("/api", (c) => c.text("api!"))

app.post("/api/store",
  validator("json", (value, c) => {
    const type = value.type
    if(typeof type == "undefined") {
      return c.text("Missing value: \"type\"", 400)
    }

    if(!secretType.includes(type)) {
      return c.text("Wrong value: \"type\"", 400)
    }

    const init = valiType(c, type, value.init)
    if(init instanceof Response) {
      return init
    }

    return {
      type,
      init
    }
  }),
  async (c) => {
    const req = c.req.valid("json")
    const id = crypto.randomUUID()
    await kv.set(["store", id, "type"], req.type)
    await kv.set(["store", id, "content"], req.init)

    return c.json({
      id,
      type: req.type,
      content: req.init
    }, 201, {
      Location: `/api/store/${id}`
    })
  }
)

app.use("/api/store/:id/*", validator("param", async (value, c) => {
  const id = value["id"] ?? ""
  const type = (await kv.get(["store", id, "type"])).value
  if(type === null) {
    return c.notFound()
  }

  const content = (await kv.get(["store", id, "content"])).value

  return c.json({
    id,
    type: type,
    content,
  })
}))

app.get("/api/store/:id", async (c) => {
  const { id } = c.req.param()
  const type = await kv.get(["store", id, "type"])
  switch(type.value) {
    case "text":
      break

    default:

  }
})

Deno.serve({
  port: Number(Deno.env.get("PORT")) ?? 8000
}, app.fetch)

// export default app
