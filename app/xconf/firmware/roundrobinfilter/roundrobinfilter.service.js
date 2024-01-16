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
        .module('app.roundrobinfilter')
        .factory('roundRobinFilterService', service);

    service.$inject=['$http'];

    function service($http) {
        var URL = 'roundrobinfilter/';

        return {
            getFilter: getFilter,
            saveFilter: saveFilter,
            exportFilter: exportFilter
        };

        function getFilter(applicationType) {
            if (applicationType) {
                return $http.get(URL + applicationType);
            }
            return $http.get(URL);
        }

        function saveFilter(filter) {
            return $http.post(URL, filter);
        }

        function exportFilter(applicationType) {
            if (applicationType) {
                window.open(URL + applicationType + '?export');
            } else {
                window.open(URL + '?export');
            }
        }
    }
})();