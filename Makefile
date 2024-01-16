#
# Copyright 2023 Comcast Cable Communications Management, LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# SPDX-License-Identifier: Apache-2.0
#
GOARCH ?= amd64
GOOS ?= linux
GOHOSTARCH = $(shell go env GOHOSTARCH)
GOHOSTOS = $(shell go env GOHOSTOS)

BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD)
# must be "Version", NOT "VERSION" to be consistent with xpc jenkins env
Version ?= $(shell git log -1 --pretty=format:"%h")
BUILDTIME := $(shell date -u +"%F_%T_%Z")

all: build

compile_ui: ## Install all UI dependencies and compile UI files
	npm install
	grunt install

build:  ## Build a version
	go build -v -ldflags="-X xconfui/server/common.BinaryBranch=${BRANCH} -X xconfui/server/common.BinaryVersion=${Version} -X xconfui/server/common.BinaryBuildTime=${BUILDTIME}" -o bin/xconfui-${GOOS}-${GOARCH} main.go

test:
	go test ./... -cover -count=1

cover:
	go test ./... -count=1 -coverprofile=coverage.out

html:
	go tool cover -html=coverage.out

clean: ## Remove temporary files
	go clean
	go clean --testcache

release:
	go build -v -ldflags="-X xconfui/common.BinaryBranch=${BRANCH} -X xconfui/common.BinaryVersion=${Version} -X xconfui/common.BinaryBuildTime=${BUILDTIME}" -o bin/xconfui-${GOOS}-${GOARCH} main.go
