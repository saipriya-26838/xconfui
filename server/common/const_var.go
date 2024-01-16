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
package common

const (
	LoggingTimeFormat = "2006-01-02 15:04:05.000"
)

var (
	BinaryVersion   = ""
	BinaryBranch    = ""
	BinaryBuildTime = ""
)

type Version struct {
	CodeGitCommit   string `json:"code_git_commit"`
	BuildTime       string `json:"build_time"`
	BinaryVersion   string `json:"binary_version"`
	BinaryBranch    string `json:"binary_branch"`
	BinaryBuildTime string `json:"binary_build_time"`
}

// http ok response
type HttpResponse struct {
	Status  int         `json:"status"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}
