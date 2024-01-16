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
        .module('app.services')
        .factory('authUtilsService', service);

    service.$inject=['$rootScope', 'PERMISSION', 'APPLICATION_TYPE', 'APPLICATION_TYPES', 'SINGLE_APPLICATION_TYPE_PAGE', '$cookies'];

    function service($rootScope, PERMISSION, APPLICATION_TYPE, APPLICATION_TYPES, SINGLE_APPLICATION_TYPE_PAGE, $cookies) {

        var RDKCLOUD_PERMISSIONS = [PERMISSION.READ_FIRMWARE_RDKCLOUD, PERMISSION.WRITE_FIRMWARE_RDKCLOUD,
            PERMISSION.READ_DCM_RDKCLOUD, PERMISSION.WRITE_DCM_RDKCLOUD,
            PERMISSION.READ_TELEMETRY_RDKCLOUD, PERMISSION.WRITE_TELEMETRY_RDKCLOUD];

        var hasPermissions = function(permissions) {
            var userPermissions = getUserPermissions();
            if (userPermissions.indexOf(PERMISSION.PERMIT_ALL) === -1) {
                for (var i = 0, length = permissions.length; i < length; i++) {
                    if (userPermissions.indexOf(permissions[i]) === -1) {
                        return false;
                    }
                }
            }
            return true;
        };

        var hasPermission = function(permission) {
            return hasPermissions([permission]);
        };

        function canWriteByApplication(section, application) {
            if (!application) {
                return false;
            }
            var writePermission = 'write-' + section + '-' + application;
            var writeAllPermission = 'write-' + section + '-*';
            return hasPermission(writeAllPermission) || hasPermission(writePermission);
        }

        function canWriteFirmwareByApplication(application) {
            return canWriteByApplication('firmware', application);
        }

        function canWriteDcmByApplication(application) {
            return canWriteByApplication('dcm', application);
        }

        function canWriteTelemetryByApplication(application) {
            return canWriteByApplication('telemetry', application);
        }

        function canWriteChangesByApplication(application) {
            return canWriteByApplication('changes', application);
        }

        function canReadFirmware() {
            return hasOneOfPermissions(PERMISSION.READ_FIRMWARE_PERMISSIONS);
        }

        function canReadDcm() {
            return hasOneOfPermissions(PERMISSION.READ_DCM_PERMISSIONS);
        }

        function canReadTelemetry() {
            return hasOneOfPermissions(PERMISSION.READ_TELEMETRY_PERMISSIONS);
        }

        function canReadChanges() {
            return hasOneOfPermissions(PERMISSION.READ_CHANGES_PERMISSIONS);
        }

        function hasOneOfPermissions(permissions) {
            if (!permissions) {
                return false;
            }
            for (var i = 0; i < permissions.length; i++) {
                if (hasPermission(permissions[i])) {
                    return true;
                }
            }
            return false;
        }

        function getUserPermissions() {
            var user = $rootScope.currentUser;
            if (!user || !user.permissions) {
                return [];
            }
            return user.permissions;
        }

        function getApplicationType() {
            if (hasOneOfPermissions(RDKCLOUD_PERMISSIONS)) {
                return APPLICATION_TYPE.RDKCLOUD;
            } 
            return APPLICATION_TYPE.STB;
        }

        function getAvailableApplicationTypes(permissions) {
            var availableTypes = [];
            for (var i = 0; i < permissions.length; i++) {
                var permission = permissions[i];
                var type = endsWithApplicationType(permission);
                if (type && hasPermission(permission) && availableTypes.indexOf(type) < 0) {
                    availableTypes.push(type);
                }
            }

            return availableTypes.indexOf('*') > -1 ? APPLICATION_TYPES : availableTypes;
        }

        function endsWithApplicationType(permission) {
            var suffixes = [APPLICATION_TYPE.STB, APPLICATION_TYPE.RDKCLOUD, '*'];
            if (!permission) {
                return null;
            }
            for (var i = 0; i < suffixes.length; i++) {
                if (permission.endsWith(suffixes[i]) ) {
                    return suffixes[i];
                }
            }
            return null;
        }

        function isMultipleApplication() {
            for (let i = 0; i < SINGLE_APPLICATION_TYPE_PAGE.length; i++) {
                if (window.location.hash.includes(SINGLE_APPLICATION_TYPE_PAGE[i])) {
                    return false;
                }
            }
            return true;
        }

        function isAuthorized() {
            return $rootScope.currentUser && $cookies.get('token');
        }

        return {
            hasPermissions: hasPermissions,
            hasPermission: hasPermission,
            hasOneOfPermissions: hasOneOfPermissions,
            canWriteFirmwareByApplication: canWriteFirmwareByApplication,
            canWriteDcmByApplication: canWriteDcmByApplication,
            canWriteTelemetryByApplication: canWriteTelemetryByApplication,
            canReadFirmware: canReadFirmware,
            canReadDcm: canReadDcm,
            canReadTelemetry: canReadTelemetry,
            getApplicationType: getApplicationType,
            getAvailableApplicationTypes: getAvailableApplicationTypes,
            isMultipleApplication: isMultipleApplication,
            canWriteChangesByApplication: canWriteChangesByApplication,
            canReadChanges: canReadChanges,
            isAuthorized: isAuthorized
        };
    }
})();
