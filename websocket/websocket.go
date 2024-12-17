package websocket

import (
	"fmt"
	"log"
	"main/datatypes"
	"main/views"
	"maps"
	"slices"
	"strconv"
	"time"

	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
)

func WS(ctx *gin.Context) {
	println("ws hit")
	playerid := ctx.Param("id")
	playerid_int, err := strconv.Atoi(playerid)
	if err != nil {
		fmt.Printf("error: %v", err)
		return
	}
	var player *datatypes.Player
	var ok bool
	if player, ok = datatypes.Players[playerid_int]; !ok {
		println("error: player id not found")
		return
	}
	var client *datatypes.Client
	client, err = NewClient(ctx)
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	go WritePump(client, player, ctx)
	go ReadPump(client, player, ctx)
}

func WritePump(client *datatypes.Client, player *datatypes.Player, ctx *gin.Context) {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		client.Conn.Close()
	}()
	for {
		select {
		case _ = <-client.Update:
			println("update hit")
			updatepresents(ctx, player, client)
			updateplayers(ctx, player, client)
			return
		case <-ticker.C:
			client.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := client.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func ReadPump(client *datatypes.Client, player *datatypes.Player, ctx *gin.Context) {
	defer func() {
		datatypes.ClientsLock.Lock()
		delete(datatypes.Clients, client.Id)
		datatypes.ClientsLock.Unlock()
		client.Conn.Close()
	}()
	client.Conn.SetReadLimit(maxMessageSize)
	client.Conn.SetReadDeadline(time.Now().Add(pongWait))
	client.Conn.SetPongHandler(func(appData string) error {
		client.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})
	for {
		_, _, err := client.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func NewClient(ctx *gin.Context) (client *datatypes.Client, err error) {
	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		return nil, err
	}
	client = &datatypes.Client{
		Conn:   conn,
		Update: make(chan byte),
		Id:     int(uuid.New().ID()),
	}
	datatypes.ClientsLock.Lock()
	datatypes.Clients[client.Id] = client
	datatypes.ClientsLock.Unlock()
	return
}

func updatepresents(ctx *gin.Context, player *datatypes.Player, client *datatypes.Client) {
	presents := views.Presents(slices.Collect(maps.Values(datatypes.Presents)), player, datatypes.Turn)
	w, err := client.Conn.NextWriter(websocket.TextMessage)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	defer w.Close()
	presents.Render(ctx, w)
}

func updateplayers(ctx *gin.Context, player *datatypes.Player, client *datatypes.Client) {
	var players templ.Component
	if len(datatypes.PlayersOrder) > 0 {
		players = views.Players(datatypes.PlayersOrder, player, datatypes.Turn)
	} else {
		players = views.Players(slices.Collect(maps.Values(datatypes.Players)), player, datatypes.Turn)
	}
	w, err := client.Conn.NextWriter(websocket.TextMessage)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	defer w.Close()
	players.Render(ctx, w)
}
