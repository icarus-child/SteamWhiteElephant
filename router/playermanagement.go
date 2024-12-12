package router

import (
	"main/steam"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Player struct {
	Id   int
	Name string
}

type Present struct {
	Id       int
	SteamUrl string
	tags     []string
}

var (
	players  map[int]Player  = make(map[int]Player)
	presents map[int]Present = make(map[int]Present)
)

func createplayer(ctx *gin.Context) {
	player := Player{
		Id: int(uuid.New().ID()),
	}
	player.Name = ctx.PostForm("name")

	present := Present{
		Id:       int(uuid.New().ID()),
		SteamUrl: steam.GetGameUrl(ctx.PostForm("game-id")),
	}
	present.tags = steam.GetGameTags(present.SteamUrl)

	players[player.Id] = player
	presents[present.Id] = present
}
