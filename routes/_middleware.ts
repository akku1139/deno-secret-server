import type { FreshContext } from "$fresh/server.ts";

interface State {
  data: string;
}

export const handler =  async (
  req: Request,
  ctx: FreshContext<State>,
) => {
  // 認証コード
  const res = await ctx.next();
  return res;
};
