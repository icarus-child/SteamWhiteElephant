import { dburl } from "@/constants";
import { Present } from "@/types/present";

export async function CreatePresent(
  present: Present,
  playerId: string,
): Promise<boolean> {
  const res = await fetch(dburl + "present/", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gifterId: playerId,
      items: present.items,
    }),
  });
  if (res.status == 200) {
    return true;
  }
  return false;
}
