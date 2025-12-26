import { GetPresentStolenThisRound } from "@/db/present";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), {
      status: 400,
    });
  }

  const stolen: boolean = await GetPresentStolenThisRound(id ?? "");
  return Response.json(stolen ?? false);
}
