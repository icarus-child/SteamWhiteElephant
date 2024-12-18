package websocket

import (
	"main/datatypes"
)

func takepresent(presentid int, playerid int) {
	present := datatypes.Presents[presentid]
	player := datatypes.Players[playerid]

	if present.Wrapped {
		present.Wrapped = false
		for _, v := range datatypes.Presents {
			v.Stolen = false
		}
	} else {
		present.Stolen = true
		victim := present.Player
		victim.HasPresent = false
	}

	present.Player = player
	player.HasPresent = true

	datatypes.NextTurn()
}
