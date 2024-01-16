/*******************************************************************************
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
 *******************************************************************************/
(function() {
    'use strict';

    angular
        .module('app.targetingrule')
        .controller('TargetingRuleEditController', controller);

    controller.$inject=['$rootScope', '$scope', '$controller', '$state', '$stateParams', 'alertsService', 'ruleHelperService', 'targetingRuleService', 'permanentProfileService', 'namespacedListService', 'TARGETING_RULE_OPERATION_ARRAY', 'LOG_UPLOAD_FREE_ARG_AUTOCOMPLETE_VALUE', 'FREE_ARG_NAME', 'ruleValidationService', 'ruleConditionService'];

    function controller($rootScope, $scope, $controller, $state, $stateParams, alertsService, ruleHelperService, targetingRuleService, permanentProfileService, namespacedListService, TARGETING_RULE_OPERATION_ARRAY, LOG_UPLOAD_FREE_ARG_AUTOCOMPLETE_VALUE, FREE_ARG_NAME, ruleValidationService, ruleConditionService) {
        var vm = this;

        angular.extend(vm, $controller('EditController', {
            $scope: $scope,
            mainPage: 'targetingrules',
            stateParameters: null
        }));

        vm.targetingRule = {
            "rule": {
                applicationType: $rootScope.applicationType,
                name:'',
                boundTelemetryId: ''
            }
        };
        vm.saveTargetingRule = saveTargetingRule;
        vm.namespacedListIds = [];
        vm.profiles = [];
        vm.namespacedListData = ruleHelperService.buildNamespacedListData();
        vm.operations = {general: TARGETING_RULE_OPERATION_ARRAY};
        vm.freeArgAutocompleteValues = LOG_UPLOAD_FREE_ARG_AUTOCOMPLETE_VALUE;
        vm.validationFunction = ruleValidationService.validate;
        vm.percentFreeArgName = FREE_ARG_NAME.ESTB_MAC_ADDRESS;
        vm.representation = ruleHelperService.buildRepresentation();
        vm.ipMacIsConditionLimit = "";
        init();

        function init() {

            permanentProfileService.getAll()
                .then(function(resp) {
                    vm.profiles = resp.data;
                }, alertsService.errorHandler);

            namespacedListService.getNamespacedListIds().then(function(resp) {
                vm.namespacedListIds = resp;
            }, alertsService.errorHandler);

            if ($stateParams.ruleId) {
                targetingRuleService.getById($stateParams.ruleId).then(function(resp) {
                    vm.targetingRule.rule = resp.data;
                }, alertsService.errorHandler);
            }

            $scope.$root.$on("rule::remove", function(e, obj) {
                var rule = vm.targetingRule.rule;
                if (ruleHelperService.isCompound(rule)) {
                    var compoundParts = rule.compoundParts || [];
                    for (var i = 0; i < compoundParts.length; i++) {
                        var currentRule = compoundParts[i];
                        if (currentRule === obj.rule) {
                            if (i === 0) {
                                $.extend(rule, ruleHelperService.createEmptyRule());
                            } else {
                                compoundParts.splice(i, 1);
                                if (compoundParts.length === 1) {
                                    var clonedFeatureRule = angular.copy(rule);
                                    $.extend(clonedFeatureRule, compoundParts[0]);
                                    vm.targetingRule.rule = clonedFeatureRule;
                                }
                            }
                            if (rule.compoundParts.length === 0 && !rule.condition) {
                                vm.isValidCondition = false;
                            }
                            return;
                        }
                    }
                } else {
                    if (obj.rule === rule) {
                        $.extend(rule, ruleHelperService.createEmptyRule());
                        vm.isValidCondition = false;
                    }
                }
            });
            ruleConditionService.getIpMacIsConditionLimit().then(function(resp) {
                vm.ipMacIsConditionLimit = resp.data.ipMacIsConditionLimit;
            })

        }
        vm.isSaving = false;
        function saveTargetingRule() {
            if (validateRule(vm.targetingRule.rule)) {
                if (vm.targetingRule.rule.id) {
                    vm.isSaving = true;
                    targetingRuleService.update(vm.targetingRule.rule).then(function (resp) {
                        alertsService.successfullySaved(resp.data.name);
                        $state.go('targetingrules');
                    }, function (error) {
                        vm.isSaving = false;
                        alertsService.errorHandler(error);
                    });
                } else {
                    vm.isSaving = true;
                    targetingRuleService.create(vm.targetingRule.rule).then(function (resp) {
                        alertsService.successfullySaved(resp.data.name);
                        $state.go('targetingrules');
                    }, function (error) {
                        vm.isSaving = false;
                        alertsService.errorHandler(error);
                    });
                }
            }
        }
        

        function validateRule(rule) {
            var emptyFields = [];
            if (!rule.condition && !rule.compoundParts) {
                 emptyFields.push('condition');
            }
            if (!rule.name) {
                emptyFields.push('name');
            }
            if (!rule.boundTelemetryId) {
                emptyFields.push('telemetry profile');
            }

            if (emptyFields.length > 0) {
                alertsService.showError({title: 'Error', message: 'Next fields are empty: ' + emptyFields.join(", ")});
                return false;
            }
            return true;
        }
    }
})();