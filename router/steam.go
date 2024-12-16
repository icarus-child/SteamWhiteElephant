package router

import (
	"main/steam"

	"github.com/gin-gonic/gin"
)

func getgamename(ctx *gin.Context) {
	steamcode := ctx.Query("game-id")
	if steamcode == "" {
		print("steamcode")
		ctx.Writer.WriteString("Counter-Strike 2")
		return
	}
	gamename := steam.GetGameName(steam.GetGameUrl(steamcode))
	if gamename == "" {
		print("gamename")
		ctx.Writer.WriteString("Game not found")
		return
	}
	ctx.Writer.WriteString(gamename)
	return
}

func startgame(ctx *gin.Context) {
}
