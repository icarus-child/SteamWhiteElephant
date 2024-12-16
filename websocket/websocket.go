package websocket

import (
	// "bytes"
	"main/datatypes"
	// "main/views"
	// "maps"
	// "slices"
	"strconv"

	"github.com/gin-gonic/gin"
)

func SSE(ctx *gin.Context) {
	playerid := ctx.Param("id")
	playerid_int, err := strconv.Atoi(playerid)
	if err != nil {
		return
	}
	var ok bool
	if _, ok = datatypes.Players[playerid_int]; !ok {
		return
	}
	var client *datatypes.Client
	if c, ok := datatypes.Clients[playerid_int]; ok {
		client = c
	} else {
		client = NewClient(playerid_int)
	}

	for {
		select {
		case _ = <-client.UpdatePresents:
			println("present")
			// presents := views.Presents(slices.Collect(maps.Values(datatypes.Presents)), )
			// var buffer bytes.Buffer
			// presents.Render(ctx, &buffer)
			// ctx.SSEvent("presents", buffer.String())
			return
		case _ = <-client.UpdatePlayers:
			println("player")
			// players := views.Players(slices.Collect(maps.Values(datatypes.Players)), 0)
			// var buffer bytes.Buffer
			// players.Render(ctx, &buffer)
			// ctx.SSEvent("players", buffer.String())
			return
		case <-ctx.Done():
			return
		}
	}
}

func NewClient(playerid int) (client *datatypes.Client) {
	client = &datatypes.Client{
		UpdatePresents: make(chan byte),
		UpdatePlayers:  make(chan byte),
		Id:             playerid,
	}
	datatypes.ClientsLock.Lock()
	datatypes.Clients[playerid] = client
	datatypes.ClientsLock.Unlock()
	return
}
