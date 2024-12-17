package router

import (
	"main/websocket"

	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func InitRouter() *gin.Engine {
	r := gin.Default()
	r.Static("static", "static")
	r.StaticFile("favicon.ico", "./static/favicon.ico")

	r.GET("/", index)
	r.GET("/:id/game", game)

	r.POST("/createplayer", createplayer)
	r.GET("/gamename", getgamename)
	r.GET("/startgame", startgame)

	r.GET("/take", takepresent)
	r.GET("/swap", swappresent)

	r.GET("/ws/:id", websocket.WS)

	r.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"code": "PAGE_NOT_FOUND", "message": "Page not found"})
	})

	return r
}

func Render(ctx *gin.Context, status int, template templ.Component) error {
	ctx.Status(status)
	return template.Render(ctx.Request.Context(), ctx.Writer)
}
