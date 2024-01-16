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
    angular
        .module('app.featurerule')
        .controller('FeatureRuleEditController', controller);

    controller.$inject = ['$rootScope', '$scope', '$controller', '$state', '$stateParams', 'featureRuleService', 'ruleHelperService', 'alertsService', 'RFC_RULE_OPERATION_ARRAY', 'LOG_UPLOAD_FREE_ARG_AUTOCOMPLETE_VALUE', 'FREE_ARG_NAME', 'ruleValidationService', 'ruleConditionService', 'featureService', 'EDIT_MODE', 'featureRuleValidationService', '$q'];

    function controller($rootScope, $scope, $controller, $state, $stateParams, featureRuleService, ruleHelperService, alertsService, RFC_RULE_OPERATION_ARRAY, LOG_UPLOAD_FREE_ARG_AUTOCOMPLETE_VALUE, FREE_ARG_NAME, ruleValidationService, ruleConditionService, featureService, EDIT_MODE, featureRuleValidationService, $q) {
        var vm = this;

        angular.extend(vm, $controller('EditController', {
            $scope: $scope,
            mainPage: 'featurerule',
            stateParameters: null
        }));

        vm.isFeatureRuleId = $stateParams.featureRuleId;

        vm.saveFeatureRule = saveFeatureRule;

        vm.namespacedListData = ruleHelperService.buildNamespacedListData();
        vm.operations = {general: RFC_RULE_OPERATION_ARRAY};
        vm.representation = ruleHelperService.buildRepresentation();
        vm.freeArgAutocompleteValues = LOG_UPLOAD_FREE_ARG_AUTOCOMPLETE_VALUE;
        vm.validationFunction = ruleValidationService.validate;
        vm.percentFreeArgName = FREE_ARG_NAME.ESTB_MAC_ADDRESS;
        vm.features = [];
        vm.featureRule = {
            applicationType: $rootScope.applicationType,
            name:'',
            featureIds: [],
            rule: {}
        };
        vm.availablePriorities = [];
        vm.featureRulesSize = $stateParams.featureRulesSize ? parseInt($stateParams.featureRulesSize) : 0;
        vm.currentEditMode = $stateParams.featureRuleId ? EDIT_MODE.UPDATE : EDIT_MODE.CREATE;
        vm.allowedNumberOfFeatures = null;
        vm.isSaving = false;

        vm.validator = featureRuleValidationService;

        $scope.$root.$on("rule::remove", function(e, obj) {
            var watchResult = ruleHelperService.watchRuleRemoveOperation(vm.isValidCondition, vm.featureRule.rule, obj);
            vm.featureRule.rule = watchResult.rule;
            vm.isValidCondition = watchResult.isValidCondition;
        });
        vm.ipMacIsConditionLimit = "";

        init();
        function init() {

            getFeatures();

            setAvailablePriorities(vm.featureRulesSize);
            if (vm.currentEditMode === EDIT_MODE.CREATE) {
                vm.featureRule.priority = vm.availablePriorities[vm.availablePriorities.length - 1];
            }

            $q.all([getFeatureRules(), featureRuleService.getAllowedNumberOfFeatures()]).then(function (responses) {
                if (responses[0]) {
                    vm.featureRule = responses[0].data;
                }
                vm.allowedNumberOfFeatures = responses[1].data;
                vm.validator.validate(vm.featureRule);
            });
            ruleConditionService.getIpMacIsConditionLimit().then(function(resp) {
                vm.ipMacIsConditionLimit = resp.data.ipMacIsConditionLimit;
            })
        }

        function getFeatureRules() {
            var deferred = $q.defer();
            if (!vm.isFeatureRuleId) {
                deferred.resolve(null);
            }
            featureRuleService.getFeatureRule($stateParams.featureRuleId).then(function(result) {
                deferred.resolve(result);
            }, alertsService.errorHandler);
            return deferred.promise;
        }

        function saveFeatureRule() {
            vm.isSaving = true; 
            var method = (vm.isFeatureRuleId) ? 'updateFeatureRule' : 'createFeatureRule';
            featureRuleService[method](vm.featureRule).then(function(result) {
                alertsService.successfullySaved(result.data.name);
                $state.go('featurerule');
            }, function(error) {
                alertsService.errorHandler(error);
              }).finally(function() {
                vm.isSaving = false; 
              });
            }


        function getFeatures() {
            featureService.getAll().then(function(resp) {
                vm.features = resp.data;
            }, alertsService.errorHandler);
        }

        function setAvailablePriorities(size) {
            if (vm.currentEditMode === EDIT_MODE.UPDATE) {
                size = parseInt(size);
            }

            if (vm.currentEditMode === EDIT_MODE.CREATE) {
                size = parseInt(size) + 1;
            }

            vm.availablePriorities = [];
            for (var i = 1; i < size + 1; i++) {
                vm.availablePriorities.push(i);
            }
        }
    }

})();