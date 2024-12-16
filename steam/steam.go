package steam

import (
	"fmt"
	"strings"

	"github.com/gocolly/colly/v2"
)

func GetGameUrl(steamid string) string {
	return fmt.Sprintf("http://store.steampowered.com/app/%s", steamid)
}

func GetGameInfo(steamurl string) (name string, tags []string) {
	tags = make([]string, 0)
	c := colly.NewCollector()
	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
	})
	c.OnResponse(func(r *colly.Response) {
		fmt.Println("Got a response from", r.Request.URL)
	})
	c.OnError(func(r *colly.Response, e error) {
		fmt.Println("An error occured while visiting site:", e.Error())
	})
	c.OnHTML(".glance_tags.popular_tags", func(e *colly.HTMLElement) {
		no_of_tags := min(len(e.DOM.Children().Nodes), 3)
		for _, n := range e.DOM.Children().Nodes[:no_of_tags] {
			if n != nil {
				tags = append(tags, strings.TrimSpace(n.FirstChild.Data))
			}
		}
	})
	c.OnHTML(".apphub_AppName", func(e *colly.HTMLElement) {
		name = e.Text
	})
	c.Visit(steamurl)
	return
}

func GetGameName(steamurl string) (name string) {
	c := colly.NewCollector()
	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
	})
	c.OnResponse(func(r *colly.Response) {
		fmt.Println("Got a response from", r.Request.URL)
	})
	c.OnError(func(r *colly.Response, e error) {
		fmt.Println("An error occured while visiting site:", e.Error())
	})
	c.OnHTML(".apphub_AppName", func(e *colly.HTMLElement) {
		name = e.Text
	})
	c.Visit(steamurl)
	return
}
