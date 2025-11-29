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
    <div className="grid w-full h-screen place-content-center">
      <div className="bg-purple-700 w-96 md:w-fit md:max-w-[768px] md:h-96 md:p-5 p-5 rounded-xl flex flex-col md:flex-row">
        <Form />
      </div>
    </div>
  );
}
