package router

import (
	"fmt"
	"main/datatypes"
	"strconv"

	"github.com/gin-gonic/gin"
)

func takepresent(ctx *gin.Context) {
	presentid, err := strconv.Atoi(ctx.Query("presentid"))
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	playerid, err := strconv.Atoi(ctx.Query("playerid"))
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	present := datatypes.Presents[presentid]
	player := datatypes.Players[playerid]

	present.Player = player
	present.Wrapped = false
	player.HasPresent = true

	// datatypes.PlayersLock.Lock()
	// datatypes.Players[player.Id] = player
	// datatypes.PlayersLock.Unlock()
	// datatypes.PresentsLock.Lock()
	// datatypes.Presents[present.Id] = present
	// datatypes.PresentsLock.Unlock()

	datatypes.NextTurn()
	if datatypes.GameOver {
		println("GAME OVER")
	}
	updateplayers()
}

func swappresent(ctx *gin.Context) {
	presentid, err := strconv.Atoi(ctx.Query("presentid"))
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	playerid, err := strconv.Atoi(ctx.Query("playerid"))
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	present := datatypes.Presents[presentid]
	player := datatypes.Players[playerid]
	victim := present.Player

	present.Player = player
	player.HasPresent = true
	victim.HasPresent = false

	// datatypes.PlayersLock.Lock()
	// datatypes.Players[player.Id] = player
	// datatypes.Players[victim.Id] = victim
	// datatypes.PlayersLock.Unlock()
	// datatypes.PresentsLock.Lock()
	// datatypes.Presents[present.Id] = present
	// datatypes.PresentsLock.Unlock()

	datatypes.NextTurn()
	updateplayers()
}
