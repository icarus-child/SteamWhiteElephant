package main

import (
	"main/router"

	"github.com/gin-gonic/autotls"
)

func main() {
	r := router.InitRouter()
	// r.Run(":80")
	autotls.Run(r, "ethanmeier.com")
}
