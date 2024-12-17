package datatypes

import (
	"sync"
)

type Player struct {
	Id         int
	Name       string
	HasPresent bool
}

type Present struct {
	Id       int
	SteamUrl string
	Name     string
	Tags     []string
	Wrapped  bool
	Player   *Player
	Gifter   *Player
}

type Client struct {
	UpdatePresents chan byte
	UpdatePlayers  chan byte
	Id             int
}

var (
	Players  map[int]*Player  = make(map[int]*Player)
	Presents map[int]*Present = make(map[int]*Present)
	Clients  map[int]*Client  = make(map[int]*Client)
)

var PlayersOrder []*Player = make([]*Player, 0)

var (
	Turn     *Player = nil
	GameOver bool    = false
)

var (
	PlayersLock  = sync.Mutex{}
	PresentsLock = sync.Mutex{}
	ClientsLock  = sync.Mutex{}
	TurnLock     = sync.Mutex{}
)

func NextTurn() {
	for _, player := range PlayersOrder {
		if !player.HasPresent {
			println(player.Name + "'s turn")
			Turn = player
			return
		}
	}
	GameOver = true
}
