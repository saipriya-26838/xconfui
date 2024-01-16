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
	"encoding/json"
	"net/http"
	"xconfui/server/common"
)

func MonitorHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-length", "0")
}

func HealthZHandler(w http.ResponseWriter, r *http.Request) {
	WriteOkResponse(w, r, nil)
}

func VersionHandler(w http.ResponseWriter, r *http.Request) {
	sc := common.GetServerConfig()
	version := common.Version{
		CodeGitCommit:   sc.GetString("xconfui.code_git_commit"),
		BuildTime:       sc.GetString("xconfui.build_time"),
		BinaryVersion:   common.BinaryVersion,
		BinaryBranch:    common.BinaryBranch,
		BinaryBuildTime: common.BinaryBuildTime,
	}
	WriteOkResponse(w, r, version)
}

func ServerConfigHandler(w http.ResponseWriter, r *http.Request) {
	sc := common.GetServerConfig()
	w.WriteHeader(http.StatusOK)
	w.Write(sc.ConfigBytes())
}

func WriteOkResponse(w http.ResponseWriter, r *http.Request, data interface{}) {
	resp := common.HttpResponse{
		Status:  http.StatusOK,
		Message: http.StatusText(http.StatusOK),
		Data:    data,
	}

	if b, err := json.Marshal(resp); err == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(resp.Status)
		w.Write(b)
	} else {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
	}
}
