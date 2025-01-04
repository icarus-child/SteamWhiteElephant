export async function CreateGift(
  sessionid: string,
  playerid: string,
  gift: ,
) {
  console.log(playerid);
  fetch(dburl + "player/", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId: sessionid,
      playerId: playerid,
      name: player.name,
    }),
  });
}
