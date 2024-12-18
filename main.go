package main

import (
	"main/router"

	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	r := router.InitRouter()
	r.SetTrustedProxies(nil)
	r.Run(":80")
	// r.RunTLS(":443", "domain.cert.pem", "private.key.pem")
}
