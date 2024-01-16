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
        .module('app.core')

        .constant('AUTH_EVENT', {
            'SESSION_TIMEOUT': 'auth-session-timeout',
            'UNAUTHORIZED': 'auth-anauthorized',
            'NO_ACCESS': 'auth-no-access'
        })

        .factory('responseErrorInterceptor', ['$rootScope', '$q', '$injector', 'AUTH_EVENT',
            function($rootScope, $q, $injector, AUTH_EVENT) {
                return {
                    /**
                     * The API returns an error object if there is something wrong.
                     * Example: {
                     *     status: 404,
                     *     type: "EntityNotFoundException",
                     *     message: "NamespacedList "test" does not exist"
                     * }
                     */
                    responseError: function(response) {
                        var status = response.status;
                        if (status === 401) {
                            $rootScope.$broadcast(AUTH_EVENT.UNAUTHORIZED);
                        }
                        return $q.reject(response);
                    }
                };
            }]).factory('applicationTypeRequestInterceptor', ['$rootScope', '$cookies', function($rootScope, $cookies) {
                const apiToExclude = ['model', 'environment', 'firmwareruletemplate', 'genericnamespacedlist', 'auth'];
                return {
                    request: function(config) {
                        if (!config.url
                            || config.url.includes('.html')
                            || containsAnyMatch(config.url, apiToExclude)) {
                            return config;
                        }
                        let currentApplicationType = getApplicationType($cookies, $rootScope);
                        let relativeRequestUrl = config.url;
                        if (relativeRequestUrl.includes('?')) {
                            relativeRequestUrl += '&applicationType=' + currentApplicationType;
                        } else {
                            relativeRequestUrl += '?applicationType=' + currentApplicationType;
                        }
                        config.url = relativeRequestUrl;
                        config.headers['token'] = $cookies.get("token");
                        return config;
                    }
                };
            }])
        .config(['$httpProvider', function($httpProvider) {
            $httpProvider.interceptors.push('responseErrorInterceptor');
            $httpProvider.interceptors.push('applicationTypeRequestInterceptor');
        }]);

    function getApplicationType(cookies, rootScope) {
        let applicationType = cookies.get("applicationType");
        return applicationType ? applicationType : rootScope.applicationType;
    }

    function containsAnyMatch(path, apiToExcludeList) {
        for (let apiToExclude of apiToExcludeList) {
            if (path.startsWith(apiToExclude)) {
                return true;
            }
        }
        return false;
    }
})();
