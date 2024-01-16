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
(function () {
    'use strict';

    angular
        .module('app.firmwareTestPage')
        .controller('FirmwareTestPageController', controller);

    controller.$inject = ['$rootScope', 'firmwareTestPageService', 'alertsService', 'utilsService', 'FIRMWARE_FREE_ARG_AUTOCOMPLETE_VALUE', 'CAPABILITIES', 'testPageUtils', 'FREE_ARG_NAME'];

    function controller($rootScope, firmwareTestPageService, alertsService, utilsService, FIRMWARE_FREE_ARG_AUTOCOMPLETE_VALUE, CAPABILITIES, testPageUtils, FREE_ARG_NAME) {
        var vm = this;

        vm.parameters = [{key: '', value: ''}];
        vm.autoCompleteValues = FIRMWARE_FREE_ARG_AUTOCOMPLETE_VALUE;
        vm.capabilities = CAPABILITIES;
        vm.quickAddValues = [];
        vm.rebootDecoupled = false;
        vm.rcdl = false;
        vm.supportsFullHttpUrl = false;
        vm.result = null;
        vm.context = null;

        vm.matchRules = matchRules;
        vm.printFilterName = printFilterName;

        init();

        function init() {
            angular.forEach(CAPABILITIES, function (capability) {
                vm.quickAddValues.push({display: capability, key: 'capabilities', value: capability});
            });
        }

        function printFilterName(filter) {
            return filter.name ? filter.name : filter.id;
        }

        function matchRules() {
            if (testPageUtils.validateInput(vm.parameters)) {
                var params = testPageUtils.getParametersAsString(vm.parameters);
                for (var i = 0; i < vm.parameters.length; i++) {
                    var obj = vm.parameters[i];
                    if (obj.key === FREE_ARG_NAME.ESTB_MAC || obj.key === FREE_ARG_NAME.ECM_MAC) {
                        var macAddress = obj.value;
                        if ((macAddress).includes(";")) {
                            alertsService.showError({title: 'Error', message: 'Invalid MAC address'});
                            return;
                        }
                    }
                }
                firmwareTestPageService.getMatchedRules(params).then(function (resp) {
                    vm.result = resp.data.result;
                    vm.context = resp.data.context;
                }, function (error) {
                    alertsService.showError({title: 'Error', message: error.data.message});
                });
            }
        }
    }
})();