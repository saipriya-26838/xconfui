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

(function() {
    'use strict';

    angular
        .module('app.authorization')
        .controller('AuthorizationController', controller);

    controller.$inject=['$scope', '$rootScope', '$controller', 'authorizationService', 'alertsService', '$state', 'authUtilsService'];
    function controller($scope, $rootScope, $controller, authorizationService, alertsService, $state, authUtils) {
        let vm = this;
        vm.crendentials = {
            login: '',
            password: ''
        }

        vm.signInWithAcl = signInWithAcl;

        angular.extend(vm, $controller('MainController', {
            $scope: $scope
        }));

        init();

        function init() {
            if (authUtils.isAuthorized()) {
                $state.go('environments');
            }
            authorizationService.getAuthProvider().then(function (resp) {
                vm.authProvider = resp.data.name;
            }, function (error) {
                alertsService.showError({title: 'Error', message: error.data.message});
            });

        }

        function signInWithAcl() {
            authorizationService.signInWithAcl(vm.crendentials).then(function (resp) {
                $rootScope.currentUser = resp.data;
                $state.go('environments');
            }, function (error) {
                alertsService.showError({title: 'Authorization Error', message: error.data});
            });
        }
    }
})();