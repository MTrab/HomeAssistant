# node-red-configurable-ping

A <a href="http://nodered.org" target="_new">Node-RED</a> node which takes input and pings a remote server.

This is a modification of the [node-red-contrib-advanced-ping](https://github.com/emiloberg/node-red-contrib-advanced-ping) node. Difference is that the timeout and the number of requests are configurable.


## Install

Run the following command in the root directory of your Node-RED install

    npm install node-red-configurable-ping

## Usage

* Pings a machine and returns the trip time in ms. Ping time is returned in `msg.payload`. Returns boolean **false** if no response received within 5 seconds, or if the host is unresolveable.
* Will perform ping on **any** input.
* You may override the host set in the configuration by passing in a value in `msg.host`.
* For legacy reasons, the node will output the host as `msg.topic` (the original [node-red-node-ping](https://github.com/node-red/node-red-nodes/tree/master/io/ping) does it this way).
* Any incomming data will be passed on to the output.
  * Incoming `msg.payload` data will be outputted as `msg._payload` (as the new `msg.payload` will contain the result of the ping).
  * Incoming `msg.topic` data will be outputted as `msg._topic` (as the new `msg.topic` will contain the the host).

## Changes over node-red-contrib-advanced-ping
Ability to set ping options (timeout and number of requests). 
The defaults are:
* 5 seconds timeout 
* 1 ping request
