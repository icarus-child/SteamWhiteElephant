package router

import (
	"main/websocket"

	"github.com/a-h/templ"
	"github.com/gin-gonic/gin"
)

func InitRouter() *gin.Engine {
	r := gin.Default()
	r.Static("static", "static")

	r.GET("/", index)
	r.GET("/:id/game", game)

	r.POST("/createplayer", createplayer)
	r.GET("/gamename", getgamename)

	r.GET("/ws", websocket.Test)
	r.GET("/client/:id", websocket.Connect)
	r.GET("/sseclient/:id", websocket.SSE)

	r.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"code": "PAGE_NOT_FOUND", "message": "Page not found"})
	})

	return r
}

func Render(ctx *gin.Context, status int, template templ.Component) error {
	ctx.Status(status)
	return template.Render(ctx.Request.Context(), ctx.Writer)
}
