package router

import (
	"main/datatypes"
	"main/steam"
	"main/views"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func createplayer(ctx *gin.Context) {
	var errors []string

	player := datatypes.Player{
		Id: int(uuid.New().ID()),
	}
	player.Name = ctx.PostForm("name")

	present := datatypes.Present{
		Id:       int(uuid.New().ID()),
		SteamUrl: steam.GetGameUrl(ctx.PostForm("game-id")),
		Wrapped:  true,
	}

	if len(player.Name) == 0 {
		errors = append(errors, "Name cannot be blank")
	}

	if len(ctx.PostForm("game-id")) == 0 {
		errors = append(errors, "Steam game ID cannot be blank")
	} else {
		present.Name, present.Tags = steam.GetGameInfo(present.SteamUrl)
		if present.Name == "" {
			errors = append(errors, "Could not find that game")
		}
	}

	if len(errors) > 0 {
		Render(ctx, http.StatusOK, views.Form(errors...))
		return
	}

	present.Player = &player

	datatypes.PlayersLock.Lock()
	datatypes.Players[player.Id] = player
	datatypes.PlayersLock.Unlock()

	datatypes.PresentsLock.Lock()
	datatypes.Presents[present.Id] = present
	datatypes.PresentsLock.Unlock()

	ctx.Header("HX-Redirect", "/"+strconv.Itoa(player.Id)+"/game")
}
