package router

import (
	"main/views"
	"net/http"

	"github.com/gin-gonic/gin"
)

func index(ctx *gin.Context) {
	Render(ctx, http.StatusOK, views.Index(views.Form()))
}

func game(ctx *gin.Context) {
	Render(ctx, http.StatusOK, views.Index(views.Game()))
}
