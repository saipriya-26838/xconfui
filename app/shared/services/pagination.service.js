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
        .factory('paginationService', PaginationService);

    PaginationService.$inject = ['$localStorage', '$location', '$log'];

    function PaginationService($localStorage, $location, $log) {

        var availablePageSizes = [
            '10',
            '50',
            '100',
            '200'
        ];

        var defaultPageSize = '50';
        var defaultPageNumber = '1';

        function getAvailablePageSizes() {
            return availablePageSizes;
        }

        function getDefaultPageSize(storageKey) {
            return $localStorage[storageKey] ? $localStorage[storageKey] : defaultPageSize;
        }

        function getPageSize(storageKey, customDefaultPageSize) {
            if (pageSizeInLocationIsValid()) {
                var pageSize = $location.search().pageSize;
                saveDefaultPageSize(pageSize, storageKey);
                return pageSize;
            }
            else if(customDefaultPageSize) {
                defaultPageSize = customDefaultPageSize;
                saveDefaultPageSize(customDefaultPageSize, storageKey);
            }

            return getDefaultPageSize(storageKey);
        }

        function getPageNumber() {
            return $location.search().pageNumber > 0 ? $location.search().pageNumber : defaultPageNumber;
        }

        function saveDefaultPageSize(pageSize, storageKey) {
            $localStorage[storageKey] = pageSize;
        }

        function paginationSettingsInLocationHaveChanged(pageNumber, pageSize) {
            return ($location.search().pageNumber && pageNumber !== $location.search().pageNumber) ||
                        ($location.search().pageSize && pageSize !== $location.search().pageSize);
        }

        function pageSizeInLocationIsValid() {
            return availablePageSizes.indexOf($location.search().pageSize) > -1;
        }

        function savePaginationSettingsInLocation(pageNumber, pageSize) {
            $location.search('pageNumber', pageNumber);
            $location.search('pageSize', pageSize);
        }

        return {
            getAvailablePageSizes: getAvailablePageSizes,
            getDefaultPageSize: getDefaultPageSize,
            getPageSize: getPageSize,
            getPageNumber: getPageNumber,
            saveDefaultPageSize: saveDefaultPageSize,
            paginationSettingsInLocationHaveChanged: paginationSettingsInLocationHaveChanged,
            pageSizeInLocationIsValid: pageSizeInLocationIsValid,
            savePaginationSettingsInLocation : savePaginationSettingsInLocation
        };
    }
})();
