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
package server

import (
	"fmt"
	"net/http"
)

func RouteAdminUIApi(mux *http.ServeMux, ProxyRequestHandler func(http.ResponseWriter, *http.Request)) {
	mux.HandleFunc("/provider", ProxyRequestHandler)
	mux.HandleFunc("/auth/", ProxyRequestHandler)
	mux.HandleFunc("/acl/auth", ProxyRequestHandler)
	mux.HandleFunc("/environment/", ProxyRequestHandler)
	mux.HandleFunc("/environment", ProxyRequestHandler)

	mux.HandleFunc("/model/", ProxyRequestHandler)
	mux.HandleFunc("/model", ProxyRequestHandler)

	mux.HandleFunc("/genericnamespacedlist/", ProxyRequestHandler)
	mux.HandleFunc("/genericnamespacedlist", ProxyRequestHandler)

	mux.HandleFunc("/firmwareconfig/", ProxyRequestHandler)
	mux.HandleFunc("/firmwareconfig", ProxyRequestHandler)

	mux.HandleFunc("/activationMinimumVersion/", ProxyRequestHandler)
	mux.HandleFunc("/activationMinimumVersion", ProxyRequestHandler)

	mux.HandleFunc("/firmwarerule/", ProxyRequestHandler)
	mux.HandleFunc("/firmwarerule", ProxyRequestHandler)

	mux.HandleFunc("/firmwareruletemplate/", ProxyRequestHandler)
	mux.HandleFunc("/firmwareruletemplate", ProxyRequestHandler)

	mux.HandleFunc("/percentfilter/", ProxyRequestHandler)
	mux.HandleFunc("/percentfilter", ProxyRequestHandler)

	mux.HandleFunc("/roundrobinfilter/", ProxyRequestHandler)
	mux.HandleFunc("/roundrobinfilter", ProxyRequestHandler)

	mux.HandleFunc("/reportpage/", ProxyRequestHandler)
	mux.HandleFunc("/reportpage", ProxyRequestHandler)

	mux.HandleFunc("/log/", ProxyRequestHandler)
	mux.HandleFunc("/log", ProxyRequestHandler)

	mux.HandleFunc("/dcm/", ProxyRequestHandler)
	mux.HandleFunc("/dcm", ProxyRequestHandler)

	mux.HandleFunc("/setting/", ProxyRequestHandler)
	mux.HandleFunc("/setting", ProxyRequestHandler)
	mux.HandleFunc("/settings/", ProxyRequestHandler)
	mux.HandleFunc("/settings", ProxyRequestHandler)

	mux.HandleFunc("/telemetry/", ProxyRequestHandler)
	mux.HandleFunc("/telemetry", ProxyRequestHandler)

	mux.HandleFunc("/rfc/", ProxyRequestHandler)
	mux.HandleFunc("/rfc", ProxyRequestHandler)

	mux.HandleFunc("/change/", ProxyRequestHandler)
	mux.HandleFunc("/change", ProxyRequestHandler)

	mux.HandleFunc("/telemetrytwo/", ProxyRequestHandler)
	mux.HandleFunc("/telemetrytwo", ProxyRequestHandler)

	mux.HandleFunc("/changelog/", ProxyRequestHandler)
	mux.HandleFunc("/changelog", ProxyRequestHandler)

	mux.HandleFunc("/stats/", ProxyRequestHandler)
	mux.HandleFunc("/stats", ProxyRequestHandler)

	mux.HandleFunc("/penetrationdata/", ProxyRequestHandler)

	mux.HandleFunc("/config/", ProxyRequestHandler)
}

func RouteStaticResources(mux *http.ServeMux, webRoot string) {
	appDir := fmt.Sprintf("%s/app", webRoot)
	fsApp := http.FileServer(http.Dir(appDir))
	mux.Handle("/app/", http.StripPrefix("/app/", fsApp))

	imgDir := fmt.Sprintf("%s/img", webRoot)
	fsImg := http.FileServer(http.Dir(imgDir))
	mux.Handle("/img/", http.StripPrefix("/img/", fsImg))
}

func RouteBaseApi(mux *http.ServeMux) {
	mux.HandleFunc("/monitor", MonitorHandler)
	mux.HandleFunc("/healthz", HealthZHandler)
	mux.HandleFunc("/version", VersionHandler)
	mux.HandleFunc("/config", ServerConfigHandler)
}
