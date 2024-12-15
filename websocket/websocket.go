package websocket

import (
	"fmt"
	"main/datatypes"
	"main/views"
	"maps"
	"slices"
	"strconv"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func Test(ctx *gin.Context) {
}

func SSE(ctx *gin.Context) {
}

func Connect(ctx *gin.Context) {
	playerid := ctx.Param("id")
	playerid_int, err := strconv.Atoi(playerid)
	if err != nil {
		return
	}
	var player datatypes.Player
	var ok bool
	if player, ok = datatypes.Players[playerid_int]; !ok {
		return
	}
	var client *datatypes.Client
	if c, ok := datatypes.Clients[playerid_int]; ok {
		client = c
	} else {
		client, err = NewClient(ctx, player)
	}

	var connlock sync.Mutex

	for {
		select {
		case _ = <-datatypes.UpdatePresents:
			presents := views.Presents(slices.Collect(maps.Values(datatypes.Presents)))
			connlock.Lock()
			defer connlock.Unlock()
			w, err := client.Conn.NextWriter(websocket.TextMessage)
			defer w.Close()
			if err != nil {
				fmt.Println(err.Error())
				return
			}
			presents.Render(ctx, w)
		case _ = <-datatypes.UpdatePlayers:
			players := views.Players(slices.Collect(maps.Values(datatypes.Players)))
			connlock.Lock()
			defer connlock.Unlock()
			w, err := client.Conn.NextWriter(websocket.TextMessage)
			defer w.Close()
			if err != nil {
				fmt.Println(err.Error())
				return
			}
			players.Render(ctx, w)
		case <-ctx.Done():
			return
		}
	}
}

func NewClient(ctx *gin.Context, player datatypes.Player) (client *datatypes.Client, err error) {
	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		return nil, err
	}

	client = &datatypes.Client{
		Conn: conn,
		Send: make(chan []byte, 256),
		Id:   player.Id,
	}

	datatypes.ClientsLock.Lock()
	datatypes.Clients[player.Id] = client
	datatypes.ClientsLock.Unlock()

	return client, nil
}
