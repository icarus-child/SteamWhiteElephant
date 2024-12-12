package main

import (
	"main/router"
)

func main() {
	r := router.InitRouter()
	r.Run(":80")
}
