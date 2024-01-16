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

    angular.module('app.services')
        .factory('testPageUtils', service);

    service.$inject = ['utilsService', 'alertsService'];

    function service(utilsService, alertsService) {
        return {
            validateInput: validateInput,
            getParametersAsString: getParametersAsString,
            getParametersAsObject: getParametersAsObject
        };

        function validateInput(parameters) {
            var isInputValid = true;
            parameters.forEach(function (item) {
                if (utilsService.isNullOrUndefinedOrEmptyOrWhiteSpaceString(item.key)) {
                    isInputValid = false;
                }
            });
            if (!isInputValid) {
                alertsService.showError({title: 'Error', message: 'Key is required'});
            }
            return isInputValid;
        }

        function getParametersAsString(parameters) {
            var result = '';
            if (!parameters || parameters.length == 0) {
                return result;
            }
            for (let i = 0; i < parameters.length; i ++) {
                result += (parameters[i].key + '=' + parameters[i].value);
                if (i < parameters.length - 1) {
                    result += '&';
                }
            }
            return result;
        }

        function getParametersAsObject(parameters) {
            var result = {};
            parameters.forEach(function (item) {
               result[item.key] = item.value;
            });
            return result;
        }
    }
})();