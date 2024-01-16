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
        .module('app.core')
        .factory('alertsService', alertsService);


    alertsService.$inject = ['toastr', 'utilsService'];

    function alertsService($toastr, utils) {
        var TIMEOUT = 10000;

        return {
            failedToLoadData: failedToLoadData,
            failedToSave: failedToSave,
            failedValidation: failedValidation,
            successfullySaved: successfullySaved,
            successfullyDeleted: successfullyDeleted,
            failedToDelete: failedToDelete,
            ruleHasNotChangedWarning: ruleHasNotChangedWarning,
            showSuccessMessage: showSuccessMessage,
            showWarningMessage: showWarningMessage,
            showError: showError,
            errorHandler: errorHandler
        };


        function failedToLoadData(entity, reason) {
            var errorMsg = 'Failed to load \' ' + entity + ' \'';
            if (!utils.isEmptyString(reason)) {
                errorMsg += ' ' + reason;
            }
            $toastr.error(errorMsg, 'Error', {
                closeButton: true,
                timeOut: TIMEOUT
            });
        }

        function successfullySaved(entity) {
            var message = 'Saved ' + entity;

            $toastr.success(message, 'Success', {
                closeButton: true,
                timeOut: TIMEOUT
            });
        }

        function successfullyDeleted(entity) {
            var message = 'Deleted ' + entity;

            $toastr.success(message, 'Success', {
                closeButton: true,
                timeOut: TIMEOUT
            });
        }

        function failedToSave(entity, reason) {
            var errorMsg = 'Failed to save ' + entity +'.';
            if (!utils.isEmptyString(reason)) {
                errorMsg += ' ' + reason;
            }
            $toastr.error(errorMsg, 'Error', {
                closeButton: true,
                timeOut: TIMEOUT
            });
        }

        function failedValidation(entity, reason) {
            var errorMsg = 'Validation failed ' + entity +'.';
            if (!utils.isEmptyString(reason)) {
                errorMsg += ' ' + reason;
            }
            $toastr.error(errorMsg, 'Error', {
                closeButton: true,
                timeOut: TIMEOUT
            });
        }

        function failedToDelete(entity, reason) {
            var errorMsg = 'Failed to delete ' + entity +'.';
            if (!utils.isEmptyString(reason)) {
                errorMsg += ' ' + reason;
            }
            $toastr.error(errorMsg, 'Error', {
                closeButton: true,
                timeOut: TIMEOUT
            });
        }

        function ruleHasNotChangedWarning() {
            $toastr.warning('Make some changes before saving the rule.', 'Warning', {
                closeButton: true,
                timeOut: TIMEOUT
            });
        }

        function showWarningMessage(obj) {
            $toastr.warning(obj.message, obj.title ? obj.title : 'Warning', {
                closeButton: true,
                timeOut: TIMEOUT
            });
        }

        function showSuccessMessage(obj) {
            $toastr.success(obj.message, obj.title ? obj.title : 'Success', {
                closeButton: true,
                timeOut: TIMEOUT
            });
        }

        function showError(errorObj) {
            $toastr.error(errorObj.message, errorObj.title ? errorObj.title : 'Error', {
                closeButton: true,
                timeOut: TIMEOUT
            });
        }

        function errorHandler(error) {
            var message = error.data.message ? error.data.message : error.statusText;
            showError({title: error.data.type,  message: message});
        }
    }

})();