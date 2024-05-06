import { Hono } from "$hono/mod.ts";
import { Handler } from "$fresh/server.ts";

const app = new Hono().basePath('/api');

export const handler: Handler = (req) => app.fetch(req);