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
        .module('app.settingrule')
        .controller('SettingRuleEditController', controller);

    controller.$inject=['$rootScope', '$scope', '$state', '$stateParams', '$controller', 'alertsService', 'ruleHelperService', 'settingRuleService', 'settingProfileService', 'ruleValidationService', 'ruleConditionService','SETTING_RULE_OPERATION_ARRAY', 'LOG_UPLOAD_FREE_ARG_AUTOCOMPLETE_VALUE', 'FREE_ARG_NAME'];

    function controller($rootScope, $scope, $state, $stateParams, $controller, alertsService, ruleHelperService, settingRuleService, settingProfileService, ruleValidationService, ruleConditionService, SETTING_RULE_OPERATION_ARRAY, LOG_UPLOAD_FREE_ARG_AUTOCOMPLETE_VALUE, FREE_ARG_NAME) {
        var vm = this;

        angular.extend(vm, $controller('EditController', {
            $scope: $scope,
            mainPage: 'settingrules',
            stateParameters: null
        }));

        vm.isValidCondition = true;
        vm.settingRule = {
            applicationType: $rootScope.applicationType,
            rule: {},
            name:'',
            boundSettingId: ''
        };
        vm.saveRule = saveRule;
        vm.profiles = [];
        vm.namespacedListData = ruleHelperService.buildNamespacedListData();
        vm.operations = {general: SETTING_RULE_OPERATION_ARRAY};
        vm.freeArgAutocompleteValues = LOG_UPLOAD_FREE_ARG_AUTOCOMPLETE_VALUE;
        vm.validationFunction = ruleValidationService.validate;
        vm.percentFreeArgName = FREE_ARG_NAME.ESTB_MAC_ADDRESS;
        vm.representation = ruleHelperService.buildRepresentation();
        vm.ipMacIsConditionLimit = "";

        init();

        function init() {

            settingProfileService.getAll()
                .then(function (resp) {
                    vm.profiles = resp.data;
                }, alertsService.errorHandler);

            if ($stateParams.ruleId) {
                settingRuleService.getRule($stateParams.ruleId)
                    .then(function (resp) {
                        vm.settingRule = resp.data;
                    }, alertsService.errorHandler);
            }

            $scope.$root.$on("rule::remove", function (e, obj) {
                var watchResult = ruleHelperService.watchRuleRemoveOperation(vm.isValidCondition, vm.settingRule.rule, obj);
                vm.settingRule.rule = watchResult.rule;
                vm.isValidCondition = watchResult.isValidCondition;
            });

            ruleConditionService.getIpMacIsConditionLimit().then(function(resp) {
                vm.ipMacIsConditionLimit = resp.data.ipMacIsConditionLimit;
            })
        }

        function saveRule() {
            if (validateRule(vm.settingRule)) {
                var promise = (vm.settingRule.id) ?
                    settingRuleService.updateRule(vm.settingRule) :
                    settingRuleService.createRule(vm.settingRule);

                promise.then(function (resp) {
                    alertsService.successfullySaved(resp.data.name);
                    $state.go('settingrules');
                }, alertsService.errorHandler);
            }
        }

        function validateRule(rule) {
            var emptyFields = [];
            if (!rule.rule.condition && !rule.rule.compoundParts) {
                 emptyFields.push('condition');
            }
            if (!rule.name) {
                emptyFields.push('name');
            }
            if (!rule.boundSettingId) {
                emptyFields.push('setting profile');
            }

            if (emptyFields.length > 0) {
                alertsService.showError({title: 'Error', message: 'Next fields are empty: ' + emptyFields.join(", ")});
                return false;
            }
            return true;
        }
    }
})();