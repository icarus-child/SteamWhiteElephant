package steam

import (
	"fmt"
	"strings"

	"github.com/gocolly/colly/v2"
)

func GetGameUrl(steamid string) string {
	return fmt.Sprintf("http://store.steampowered.com/app/%s", steamid)
}

func GetGameTags(steamurl string) (tags []string) {
	tags = make([]string, 0)
	c := colly.NewCollector()
	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
	})
	c.OnResponse(func(r *colly.Response) {
		fmt.Println("Got a response from", r.Request.URL)
	})
	c.OnError(func(r *colly.Response, e error) {
		fmt.Println("An error occured:", e)
	})
	c.OnHTML(".glance_tags.popular_tags", func(e *colly.HTMLElement) {
		for _, n := range e.DOM.Children().Nodes[:5] {
			if n != nil {
				tags = append(tags, strings.TrimSpace(n.FirstChild.Data))
			}
		}
	})
	c.Visit(steamurl)
	return
}
