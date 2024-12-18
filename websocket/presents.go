package websocket

import (
	"main/datatypes"
)

func takepresent(presentid int, playerid int) {
	present := datatypes.Presents[presentid]
	player := datatypes.Players[playerid]

	if present.Wrapped {
		present.Wrapped = false
	} else {
		victim := present.Player
		victim.HasPresent = false
	}

	present.Player = player
	player.HasPresent = true

	datatypes.NextTurn()
}
