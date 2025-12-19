import { GetPlayer } from "@/db/players";
import Form from "./components/form";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function checkForSession() {
  const cookieStore = await cookies();
  if (!cookieStore.has("session")) return;
  const session = cookieStore.get("session");
  if (session == undefined) return;
  const playerId = session.value;
  const player = await GetPlayer(playerId);
  if (player == undefined) {
    return;
  }

  return redirect(`/${player.room}`);
}

export default async function Signup() {
  await checkForSession();
  return (
    <div className="flex flex-col w-full h-screen place-items-center bg-[#4B744C]">
      <h1 className="font-flavors text-4xl md:text-6xl lg:text-8xl text-white my-20">
        Steam White Elephant
      </h1>
      <Form />
    </div>
  );
}
