import { dburl } from "@/constants";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  const res = await fetch(`${dburl}texture?id=${id}`);
  return new Response(res.body, {
    headers: {
      "Content-Type": "image/png",
    },
  });
}
