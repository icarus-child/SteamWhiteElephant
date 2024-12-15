package router

import (
	"main/datatypes"
	"main/views"
	"maps"
	"net/http"
	"slices"
	"strconv"

	"github.com/gin-gonic/gin"
)

func index(ctx *gin.Context) {
	Render(ctx, http.StatusOK, views.Index(views.Form()))
}

func game(ctx *gin.Context) {
	playerid := ctx.Param("id")
	playerid_int, _ := strconv.Atoi(playerid)
	player := datatypes.Players[playerid_int]
	println(player.Id)
	Render(ctx, http.StatusOK, views.Index(views.Game(player, slices.Collect(maps.Values(datatypes.Presents)), slices.Collect(maps.Values(datatypes.Players)))))
}
