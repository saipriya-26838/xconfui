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
        .module('app.penetrationData')
        .controller('PenetrationDataController', controller);

    controller.$inject = ['$rootScope', 'alertsService', 'utilsService', 'penetrationDataService', 'namespacedListService', 'CAPABILITIES', 'testPageUtils'];

    function controller($rootScope, alertsService, utilsService, penetrationDataService, namespacedListService, CAPABILITIES, testPageUtils) {
        var vm = this;

        vm.parameters = [{key: '', value: ''}];
        vm.autoCompleteValues = ["eStbMac"];
        vm.quickAddValues = [];
        vm.result = null;
        vm.context = null;

        vm.matchRules = matchRules;
        vm.stopAdd = true;
        vm.timeFromTimestamp = timeFromTimestamp;

        init();

        function init() {
            angular.forEach(CAPABILITIES, function(capability) {
                vm.quickAddValues.push({display: capability, key: 'capabilities', value: capability});
            });
        }

        function timeFromTimestamp(timestamp) {
            var date = new Date(timestamp);
            var regexp = /\((.)*\)/;
            var result = date.toTimeString().replace(regexp, '');
            return result;
        }

        function matchRules() {
            if (testPageUtils.validateInput(vm.parameters)) {
                const macAddress = vm.parameters[0].value;
                if(macAddress && namespacedListService.isMacAddress(macAddress)) {
                    penetrationDataService.getMatchedRules(macAddress).then(function (resp) {
                        vm.result = resp.data;
                    }, function (error) {
                        alertsService.showError({title: 'Error', message: error.data.message});
                    });
                } else {
                    alertsService.showError({title: 'Error', message: "Invalid MacAddress"});
                }
            }
        }
    }
})();