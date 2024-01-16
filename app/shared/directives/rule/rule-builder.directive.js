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
    "use strict";

    angular.module('app.directives').directive('ruleBuilderDirective', ['$log', 'ruleHelperService', 'alertsService', 'utilsService', 'RELATION', 'OPERATION', 'OPERATION_ARRAY', '$uibModal', 'namespacedListService', 'FREE_ARG_NAME',
        function($log, ruleHelperService, alertsService, utilsService, RELATION, OPERATION, OPERATION_ARRAY, $modal, namespacedListService, FREE_ARG_NAME) {
        var targetEventObject = null;
        var newRule = {
            "negated": false,
            "relation": null,
            "compoundParts": [],
            "condition": {
                "freeArg": {
                    "type": "STRING",
                    "name": ""
                },
                "operation": "",
                "fixedArg": {
                    "bean": {
                        "value": ""
                    }
                }
            }
        };
        var ipFreeArgs = ["ipAddress","estbIP"];
        var macFreeArgs = ["eStbMac","estbMacAddress","ecmMacAddress"];
        
        function link(scope, element, attrs) {
            var showIpFreeArgAlert = true;
            var showMacFreeArgAlert = true;
            scope.ruleHelperService = ruleHelperService;
            scope.RELATION = RELATION;
            scope.disableFreeArgInput = false;
            scope.disableFixedArgInput = false;
            scope.OPERATION = OPERATION;
            scope.prevRuleOperation = null;
            scope.fixedArgValue = '';
            scope.operationsDependingOnFreeArg = scope.operations && scope.operations.general ? scope.operations.general : OPERATION_ARRAY;
            newRule.condition.operation = scope.operationsDependingOnFreeArg[0];
            scope.rule = angular.copy(newRule);
            scope.$root.$on("rule::edit", function(e, obj) {
                targetEventObject = obj;
                angular.copy(obj.rule, scope.rule);
                scope.fixedArgValue = ruleHelperService.renderValue(scope.rule.condition);

                if (obj.rule === scope.data) {
                    scope.showRelation = false;
                } else {
                    if (scope.data.compoundParts && scope.data.compoundParts.length >= 1) {
                        if (obj.rule === scope.data.compoundParts[0]) {
                            scope.showRelation = false;
                        } else {
                            scope.showRelation = true;
                        }
                    } else {
                        scope.showRelation = true;
                    }
                }
                scope.reloadOperations();
            });

            scope.reloadOperations = function() {
                var freeArg = scope.rule.condition.freeArg.name;
                if (scope.operations && scope.operations[freeArg]) {
                    scope.operationsDependingOnFreeArg = scope.operations[freeArg];
                } else {
                    scope.operationsDependingOnFreeArg = scope.operations && scope.operations.general ? scope.operations.general : OPERATION_ARRAY;
                }
                scope.reloadSelectedOperation();
            };

            scope.changeRelation = function(event, relation) {
                var element = event.currentTarget;
                $(element).addClass('ads-rule-builder-relation-active');
                scope.rule.relation = relation;
            };

            scope.addOrUpdate = function() {
                normalizeCondition();

                if (isNewRule()) {
                    // add new rule

                    if (validate(scope)) {
                        return;
                    }
                    if (checkISConditionExceeded(ipFreeArgs) && showIpFreeArgAlert) {
                        showIpFreeArgAlert = false;
                        alertsService.showWarningMessage({message: 'Maximum number of IS conditions has been reached. Please use IN_LIST operation if possible to group IP addresses'});
                    }
                    if(checkISConditionExceeded(macFreeArgs) && showMacFreeArgAlert) {
                        showMacFreeArgAlert = false;
                        alertsService.showWarningMessage({message: 'Maximum number of IS conditions has been reached. Please use IN_LIST operation if possible to group MAC addresses'});
                    }
                    scope.data = ruleHelperService.addRule(scope.rule, scope.data);
                    scope.$root.$broadcast("rule::created", {data: scope.data, rule: scope.rule});
                } else {
                    // update selected rule

                    if (!ruleHelperService.equalRules(scope.rule, targetEventObject.rule) && validate(scope)) {
                        return;
                    }
                    angular.copy(scope.rule, targetEventObject.rule);
                    scope.$root.$broadcast("rule::updated", {data: scope.data, rule: scope.rule});
                }
                scope.isValidCondition = true;
                clearActiveRule(scope);
                resetPrevOperation(scope);
            };

            function checkISConditionExceeded(allowedFreeArgs) {
                var isConditionCount = 1;
                if(!scope.ipMacIsConditionLimit) {
                    return false
                }
                if(scope.data && scope.data.compoundParts) {
                    for(var i = 0; i < scope.data.compoundParts.length; i++) {
                        const existingCompoundPart = scope.data.compoundParts[i];
                        const currentRule = scope.rule;
                        if(existingCompoundPart.condition.operation === "IS" && allowedFreeArgs.indexOf(existingCompoundPart.condition.freeArg.name) > -1  && allowedFreeArgs.indexOf(currentRule.condition.freeArg.name) > -1 && currentRule.condition.operation === "IS") { 
                            if(isConditionCount >= parseInt(scope.ipMacIsConditionLimit)) {
                                return true;
                            }
                            isConditionCount++;
                        }
                    }
                }
                return false;
            }

            function normalizeCondition() {
                var condition = scope.rule.condition;
                switch(condition.operation) {
                    case OPERATION.IN:
                        break;
                    case OPERATION.EXISTS:
                        break;
                    case OPERATION.PERCENT:
                        var type = 'java.lang.Double';
                        var sourceValue = condition.fixedArg.bean.value;
                        var isSourceValueObject = angular.isObject(sourceValue);
                        if (isSourceValueObject && !utilsService.isNumeric(sourceValue[type]) ||
                            !isSourceValueObject && !utilsService.isNumeric(sourceValue)) {
                            break;
                        }
                        condition.fixedArg.bean.value = doFixedArgWrapper(type, isSourceValueObject ? parseFloat(sourceValue[type]) : parseFloat(sourceValue));
                        break;
                    default:
                        var type = 'java.lang.String';
                        var sourceValue = condition.fixedArg.bean.value;
                        condition.fixedArg.bean.value = doFixedArgWrapper(type, angular.isObject(sourceValue)
                            ? sourceValue[type] : sourceValue);
                }

                normalizeMacAddress();
            }

            function normalizeMacAddress() {
                var condition = scope.rule.condition;
                if (_.values(FREE_ARG_NAME).indexOf(condition.freeArg.name) === -1) {
                    return;
                }

                switch (condition.operation) {
                    case OPERATION.IS:
                        condition.fixedArg.bean.value['java.lang.String'] = namespacedListService.normalizeMacAddress(condition.fixedArg.bean.value['java.lang.String']);
                        break;
                    case OPERATION.LIKE:
                        condition.fixedArg.bean.value['java.lang.String'] = namespacedListService.normalizeMacAddress(condition.fixedArg.bean.value['java.lang.String']);
                        break;
                    case OPERATION.IN:
                        for (var i = 0; i < condition.fixedArg.collection.value.length; i++) {
                            if (condition.fixedArg.collection.value[i]) {
                                condition.fixedArg.collection.value[i] = namespacedListService.normalizeMacAddress(condition.fixedArg.collection.value[i]);
                            }
                        }
                        break;
                }
                return condition;
            }

            function doFixedArgWrapper(type, value) {
                var result = {};
                result[type] = value;

                return result;
            }

            scope.$watch('rule.condition.operation', function() {
                var condition = scope.rule.condition;
                if (scope.prevRuleOperation === OPERATION.PERCENT || scope.prevRuleOperation === OPERATION.RANGE) {
                    scope.rule.condition.freeArg.name = '';
                }
                scope.prevRuleOperation = condition.operation;
                switch(condition.operation) {
                    case OPERATION.LT:
                    case OPERATION.GT:
                        scope.disableFreeArgInput = false;
                        scope.disableFixedArgInput = false;

                        condition.freeArg.type = 'LONG';
                        break;
                    case OPERATION.EXISTS:
                        scope.disableFreeArgInput = false;
                        scope.disableFixedArgInput = true;
                        condition.fixedArg.bean.value = '';

                        condition.freeArg.type = 'ANY';
                        break;
                    case OPERATION.PERCENT:
                    case OPERATION.RANGE:
                        scope.disableFreeArgInput = false;
                        scope.disableFixedArgInput = false;
                        condition.freeArg.name = scope.percentFreeArgName;

                        condition.freeArg.type = 'STRING';
                        break;
                    default:
                        scope.disableFreeArgInput = false;
                        scope.disableFixedArgInput = false;

                        condition.freeArg.type = 'STRING';
                }
            });

            scope.$root.$on("rule::remove", function(e, obj) {
                clearActiveRule(scope);
            });

            scope.$root.$on("rulebuilder::clean", function() {
                clearActiveRule(scope);
            });

            scope.$watch('data', function() {
                showRelation(scope);
            });

            scope.disableNegated = function() {
                return scope.rule.condition.operation === OPERATION.PERCENT;
            };

            scope.showAddNamespacedListModal = function() {
                var modalInstance = $modal.open({
                    templateUrl: 'app/shared/filtered-select/filtered-select.html',
                    size: 'lg',
                    controller: 'FilteredSelect as vm',
                    resolve: {
                        title: function() {
                            return 'NamespacedLists';
                        },
                        data: function() {
                            var currentDataEntry = null;
                            if (scope.namespacedListData) {
                                if (scope.namespacedListData.length > 1 && ['estbIP', 'ipAddress'].indexOf(scope.rule.condition.freeArg.name) > -1) {
                                    currentDataEntry = scope.namespacedListData[1];
                                } else {
                                    currentDataEntry = scope.namespacedListData[0];
                                }
                            }
                            return currentDataEntry;
                        },
                        onSelect: function() {
                            return function(id) {
                                scope.fixedArgValue = id;
                                scope.changeFixedArgValue();
                            }
                        }
                    }
                });
            };

            scope.disableNegated = function() {
                return scope.rule.condition.operation === OPERATION.PERCENT;
            };

            scope.cleanFixedArg = function(scope) {
                scope.rule.condition.fixedArg.bean.value = '';
            };

            scope.changeOperation = function() {
                scope.fixedArgValue = '';
                if (scope.rule.condition.operation === OPERATION.IN) {
                    delete scope.rule.condition.fixedArg.bean;
                    scope.rule.condition.fixedArg['collection'] = {value: []};
                } else {
                    delete scope.rule.condition.fixedArg.collection;
                    scope.rule.condition.fixedArg['bean'] = {value: ""};
                }
            };

            scope.showInListModal = function(values, data) {
                $modal.open({
                    templateUrl: 'app/shared/directives/tagautocomplete/tagautocomplete-modal.html',
                    size: 'lg',
                    controller: 'TagautocompleteModal as vm',
                    resolve: {
                        data: function() {
                            return {
                                selectedTags: angular.copy(values),
                                data: data,
                                disableAutocomplete: data && _.size(data) > 0 ? false : true,
                                onSave: function(ids) {
                                    scope.fixedArgValue = ids;
                                    scope.changeFixedArgValue();
                                }
                            }
                        }
                    }
                });
            };

            scope.renderValue = function() {
                return ruleHelperService.renderValue(scope.rule.condition);
            };

            scope.changeFixedArgValue = function() {
                var type;
                switch (scope.rule.condition.operation) {
                    case OPERATION.IN:
                        scope.rule.condition.fixedArg.collection.value = scope.fixedArgValue;
                        return;
                    case OPERATION.PERCENT:
                        type = "java.lang.Double";
                        break;
                    default :
                        type = "java.lang.String";
                }
                scope.rule.condition.fixedArg.bean.value = doFixedArgWrapper(type, scope.fixedArgValue);
            };

            scope.reloadSelectedOperation = function() {
                if (scope.operationsDependingOnFreeArg.indexOf(scope.rule.condition.operation) < 0) {
                    scope.rule.condition.operation = scope.operationsDependingOnFreeArg[0];
                }
            };

            scope.shouldShow = function(operation) {
                var argName = scope.rule.condition.freeArg.name.toLowerCase();
                if (!(argName.includes("ip") || argName.includes("mac")) && operation === 'IN_LIST') {
                    return false;
                }
                return !(operation === 'PERCENT' && scope.rule.negated);
            }
        }

        function isNewRule() {
            return targetEventObject === null;
        }

        function validate(scope) {
            return scope.validationFunction()(scope);
        }

        function showRelation(scope) {
            if (scope.data.condition || (scope.data.compoundParts && scope.data.compoundParts.length > 0)) {
                scope.showRelation = true;
            } else {
                scope.showRelation = false;
            }
        }

        function clearActiveRule(scope) {
            targetEventObject = null;
            scope.rule = angular.copy(newRule);
            scope.fixedArgValue = '';
            scope.reloadOperations();
            newRule.condition.operation = scope.operationsDependingOnFreeArg[0];
            scope.rule = angular.copy(newRule);
            showRelation(scope);
        }

        function resetPrevOperation(scope) {
            scope.prevRuleOperation = '';
        }

        return {
            restrict: 'E',
            scope: {
                ipMacIsConditionLimit: '=',
                data: '=',
                namespacedListData: '=',
                representation: '=',
                fixedArgRequired: '=',
                isValidCondition: '=',
                disableValidation: '=',
                freeArgAutocompleteValues: '=',
                percentFreeArgName: '=',
                operations: '=',
                validationFunction: '&'
            },
            templateUrl: 'app/shared/directives/rule/rule-builder.directive.html',
            link: link
        };
    }]);

})();