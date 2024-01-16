# xconf-web-admin
XConf Web Admin

How to run:
Xconf Web Admin is running with a golang server

1. Go to project directory and run to install all UI dependencies:
```shell
npm install
```
3. Compile UI files:
```shell
grunt install
```
4. Check if config file (server/config) has correct log and backend path. XConf backend should be run separately.
5. Start golang UI server:
```shell
go run *.go -f <path to config file>
```
6. Open following link in browser http://localhost:<port>


***Important Note about Licensing: The XConf UI uses the Bootstrap framework. When building XConf UI, Bootstrap and other modules are pulled in by NPM. Bootstrap contains a small set of Glyphicons. According to the Bootstrap license, Bootstrap and the included Glyphicons are available to use commercially for free. However, any party building and using XConf UI should review the licenses and make their own determination.
