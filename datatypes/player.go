package datatypes

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Player struct {
	Id   int
	Name string
}

type Present struct {
	Id       int
	SteamUrl string
	Name     string
	Tags     []string
	Wrapped  bool
	Player   *Player
}

type Client struct {
	Conn *websocket.Conn
	Send chan []byte
	Id   int
}

var (
	Players  map[int]Player  = make(map[int]Player)
	Presents map[int]Present = make(map[int]Present)
	Clients  map[int]*Client = make(map[int]*Client)
)

var (
	PlayersLock  = sync.Mutex{}
	PresentsLock = sync.Mutex{}
	ClientsLock  = sync.Mutex{}
)

var (
	UpdatePresents chan byte = make(chan byte, 1)
	UpdatePlayers  chan byte = make(chan byte, 1)
)
