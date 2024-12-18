package router

import (
	"main/datatypes"
	"main/steam"
	"main/views"
	"main/websocket"
	"maps"
	"net/http"
	"slices"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/exp/rand"
)

func createplayer(ctx *gin.Context) {
	if datatypes.GameOver {
		return
	}

	var errors []string

	player := datatypes.Player{
		Id:         int(uuid.New().ID()),
		HasPresent: false,
	}
	player.Name = ctx.PostForm("name")

	present := datatypes.Present{
		Id:       int(uuid.New().ID()),
		SteamUrl: steam.GetGameUrl(ctx.PostForm("game-id")),
		Wrapped:  true,
		Player:   nil,
		Gifter:   &player,
		Stolen:   false,
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

	datatypes.PlayersLock.Lock()
	datatypes.Players[player.Id] = &player
	if datatypes.Turn != nil {
		datatypes.PlayersOrder = append(datatypes.PlayersOrder, &player)
	}
	datatypes.PlayersLock.Unlock()

	datatypes.PresentsLock.Lock()
	datatypes.Presents[present.Id] = &present
	datatypes.PresentsLock.Unlock()

	go websocket.UpdatePlayers()

	ctx.Header("HX-Redirect", "/"+strconv.Itoa(player.Id)+"/game")
}

func startgame(ctx *gin.Context) {
	for _, v := range datatypes.PlayersOrder {
		println(v.Name)
	}
	if datatypes.Turn != nil {
		return
	}
	datatypes.PlayersOrder = slices.Collect(maps.Values(datatypes.Players))
	for i := range datatypes.PlayersOrder {
		j := rand.Intn(i + 1)
		datatypes.PlayersOrder[i], datatypes.PlayersOrder[j] = datatypes.PlayersOrder[j], datatypes.PlayersOrder[i]
	}
	datatypes.Turn = datatypes.PlayersOrder[0]
	go websocket.UpdatePlayers()
}
