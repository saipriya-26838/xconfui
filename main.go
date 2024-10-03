/**
 * Copyright 2023 Comcast Cable Communications Management, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
package main

import (
	"flag"
	"fmt"
	"html/template"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"xconfui/server"
	"xconfui/server/common"
	"xconfui/server/logging"

	log "github.com/sirupsen/logrus"
)

const defaultConfigFile = "/app/xconfui/xconfui.conf"

var web_root string

func main() {
	configFile := flag.String("f", defaultConfigFile, "config file")
	flag.Parse()

	sc, err := common.NewServerConfig(*configFile)
	if err != nil {
		log.Fatal(err)
	}

	common.SetServerConfig(sc)

	logFile := sc.GetString("xconfui.log.file")
	if len(logFile) > 0 {
		file, err := os.OpenFile(logFile, os.O_APPEND|os.O_CREATE|os.O_RDWR, 0666)
		if err != nil {
			fmt.Printf("ERROR opening file: %v", err)
			panic(err)
		}
		defer file.Close()

		log.SetOutput(file)
		logging.InitLogging(sc, file)
	} else {
		log.SetOutput(os.Stdout)
	}

	web_root = sc.GetString("xconfui.server.web_root")
	if web_root == "" {
		panic("server.web_root property must be set")
	} else {
		web_root = strings.TrimSuffix(web_root, "/")
	}
	log.Info(fmt.Sprintf("Web server document root: %s", web_root))

	mux := http.NewServeMux()
	mux.HandleFunc("/", Index)

	backendUrlStr := sc.GetString("xconfui.xconfadmin.host")
	proxy := NewProxyToBackend(backendUrlStr)

	server.RouteAdminUIApi(mux, ProxyRequestHandler(proxy))
	server.RouteBaseApi(mux)
	server.RouteStaticResources(mux, web_root)

	port := sc.GetString("xconfui.server.port")
	log.Fatal(http.ListenAndServe(port, mux))
}

func Index(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "index.html")
}

func renderTemplate(w http.ResponseWriter, tmpl string) {
	fileName := fmt.Sprintf("%s/templates/%s", web_root, tmpl)
	parsedTemplate, err := template.ParseFiles(fileName)
	if err != nil {
		log.Errorf("Template parsing error: %v", err)
	}
	err = parsedTemplate.Execute(w, nil)
	if err != nil {
		log.Errorf("Template executing error: %v", err)
	}
}

func NewProxyToBackend(targetHost string) *httputil.ReverseProxy {
	url, err := url.Parse(targetHost)
	if err != nil {
		log.Errorf("Proxy error: %v", err)
		panic(err)
	}
	return httputil.NewSingleHostReverseProxy(url)
}

func ProxyRequestHandler(proxy *httputil.ReverseProxy) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		r.Header.Set("X-Request-ID", "adminui")
		proxy.ServeHTTP(w, r)
	}
}
