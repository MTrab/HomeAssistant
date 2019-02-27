/* eslint-disable no-invalid-this,consistent-this */
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 @biddster
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict';
module.exports = function(RED) {
    const moment = require('moment');
    const SunCalc = require('suncalc');
    const _ = require('lodash');
    const fmt = 'YYYY-MM-DD HH:mm';

    RED.nodes.registerType('schedex', function(config) {
        RED.nodes.createNode(this, config);
        const node = this,
            events = {
                on: setupEvent('on', 'dot'),
                off: setupEvent('off', 'ring')
            };
        events.on.inverse = events.off;
        events.off.inverse = events.on;

        // migration code : if new values are undefined, set all to true
        if (
            config.sun === undefined &&
            config.mon === undefined &&
            config.tue === undefined &&
            config.wed === undefined &&
            config.thu === undefined &&
            config.fri === undefined &&
            config.sat === undefined
        ) {
            const name = config.name || `${config.ontime} - ${config.offtime}`;
            node.warn(
                `Schedex [${name}]: New weekday configuration attributes are not defined, please edit the node. Defaulting to true.`
            );
            config.sun = config.mon = config.tue = config.wed = config.thu = config.fri = config.sat = true;
        }

        const weekdays = [
            config.mon,
            config.tue,
            config.wed,
            config.thu,
            config.fri,
            config.sat,
            config.sun
        ];

        node.on('input', function(msg) {
            let handled = false,
                requiresBootstrap = false;
            if (_.isString(msg.payload)) {
                // TODO - with these payload options, we can't support on and ontime etc.
                if (msg.payload === 'on') {
                    handled = true;
                    send(events.on, true);
                } else if (msg.payload === 'off') {
                    handled = true;
                    send(events.off, true);
                } else if (msg.payload === 'info') {
                    handled = true;
                    node.send({
                        topic: 'info',
                        payload: {
                            on: isSuspended()
                                ? 'suspended'
                                : events.on.moment.toDate().toUTCString(),
                            off: isSuspended()
                                ? 'suspended'
                                : events.off.moment.toDate().toUTCString(),
                            state: isSuspended()
                                ? 'suspended'
                                : events.off.moment.isAfter(events.on.moment) ? 'off' : 'on',
                            ontopic: events.on.topic,
                            onpayload: events.on.payload,
                            offtopic: events.off.topic,
                            offpayload: events.off.payload
                        }
                    });
                } else {
                    if (msg.payload.indexOf('suspended') !== -1) {
                        handled = true;
                        const match = /.*suspended\s+(\S+)/.exec(msg.payload);
                        const previous = config.suspended;
                        config.suspended = toBoolean(match[1]);
                        requiresBootstrap = requiresBootstrap || previous !== config.suspended;
                    }
                    enumerateProgrammables(function(obj, prop, payloadName, typeConverter) {
                        const match = new RegExp(`.*${payloadName}\\s+(\\S+)`).exec(
                            msg.payload
                        );
                        if (match) {
                            handled = true;
                            const previous = obj[prop];
                            obj[prop] = typeConverter(match[1]);
                            requiresBootstrap = requiresBootstrap || previous !== obj[prop];
                        }
                    });
                }
            } else {
                if (msg.payload.hasOwnProperty('suspended')) {
                    handled = true;
                    const previous = config.suspended;
                    config.suspended = !!msg.payload.suspended;
                    requiresBootstrap = requiresBootstrap || previous !== config.suspended;
                }
                enumerateProgrammables(function(obj, prop, payloadName, typeConverter) {
                    if (msg.payload.hasOwnProperty(payloadName)) {
                        handled = true;
                        const previous = obj[prop];
                        obj[prop] = typeConverter(msg.payload[payloadName]);
                        requiresBootstrap = requiresBootstrap || previous !== obj[prop];
                    }
                });
            }
            if (!handled) {
                node.status({
                    fill: 'red',
                    shape: 'dot',
                    text: 'Unsupported input'
                });
            } else if (requiresBootstrap) {
                bootstrap();
            }
        });

        node.on('close', suspend);

        function setupEvent(eventName, shape) {
            const filtered = _.pickBy(config, function(value, key) {
                return key && key.indexOf(eventName) === 0;
            });
            const event = _.mapKeys(filtered, function(value, key) {
                return key.substring(eventName.length).toLowerCase();
            });
            event.name = eventName.toUpperCase();
            event.shape = shape;
            event.callback = function() {
                send(event);
                schedule(event);
            };
            return event;
        }

        function send(event, manual) {
            node.send({
                topic: event.topic,
                payload: event.payload
            });
            node.status({
                fill: manual ? 'blue' : 'green',
                shape: event.shape,
                text:
                    event.name +
                    (manual ? ' manual' : ' auto') +
                    (isSuspended()
                        ? ' - scheduling suspended'
                        : ` until ${event.inverse.moment.format(fmt)}`)
            });
        }

        function schedule(event, isInitial) {
            const now = node.now();
            const matches = new RegExp(/(\d+):(\d+)/).exec(event.time);
            if (matches && matches.length) {
                // Don't use existing 'now' moment here as hour and minute mutate the moment.
                event.moment = node
                    .now()
                    .hour(+matches[1])
                    .minute(+matches[2]);
            } else {
                const sunCalcTimes = SunCalc.getTimes(new Date(), config.lat, config.lon);
                const date = sunCalcTimes[event.time];
                if (date) {
                    event.moment = moment(date);
                }
            }
            if (!event.moment) {
                node.status({
                    fill: 'red',
                    shape: 'dot',
                    text: `Invalid time: ${event.time}`
                });
                return false;
            }
            event.moment.seconds(0);

            if (event.offset) {
                let adjustment = event.offset;
                if (event.randomoffset) {
                    adjustment = event.offset * Math.random();
                }
                event.moment.add(adjustment, 'minutes');
            }

            if (!isInitial || (isInitial && now.isAfter(event.moment))) {
                event.moment.add(1, 'day');
            }

            // Adjust weekday if not selected
            while (!weekdays[event.moment.isoWeekday() - 1]) {
                event.moment.add(1, 'day');
            }

            if (event.timeout) {
                clearTimeout(event.timeout);
            }
            const delay = event.moment.diff(now);
            event.timeout = setTimeout(event.callback, delay);
            return true;
        }

        function suspend() {
            clearTimeout(events.on.timeout);
            events.on.moment = null;
            clearTimeout(events.off.timeout);
            events.off.moment = null;
            node.status({
                fill: 'grey',
                shape: 'dot',
                text: `Scheduling suspended ${
                    weekdays.indexOf(true) === -1 ? '(no weekdays selected) ' : ''
                } - manual mode only`
            });
        }

        function resume() {
            if (schedule(events.on, true) && schedule(events.off, true)) {
                const firstEvent = events.on.moment.isBefore(events.off.moment)
                    ? events.on
                    : events.off;
                const message = `${firstEvent.name} ${firstEvent.moment.format(fmt)}, ${
                    firstEvent.inverse.name
                } ${firstEvent.inverse.moment.format(fmt)}`;
                node.status({
                    fill: 'yellow',
                    shape: 'dot',
                    text: message
                });
            }
        }

        function bootstrap() {
            if (isSuspended()) {
                suspend();
            } else {
                resume();
            }
        }

        function isSuspended() {
            return config.suspended || weekdays.indexOf(true) === -1;
        }

        function enumerateProgrammables(callback) {
            callback(events.on, 'time', 'ontime', String);
            callback(events.on, 'topic', 'ontopic', String);
            callback(events.on, 'payload', 'onpayload', String);
            callback(events.on, 'offset', 'onoffset', Number);
            callback(events.on, 'randomoffset', 'onrandomoffset', toBoolean);
            callback(events.off, 'time', 'offtime', String);
            callback(events.off, 'topic', 'offtopic', String);
            callback(events.off, 'payload', 'offpayload', String);
            callback(events.off, 'offset', 'offoffset', Number);
            callback(events.off, 'randomoffset', 'offrandomoffset', toBoolean);
            callback(config, 'mon', 'mon', toBoolean);
            callback(config, 'tue', 'tue', toBoolean);
            callback(config, 'wed', 'wed', toBoolean);
            callback(config, 'thu', 'thu', toBoolean);
            callback(config, 'fri', 'fri', toBoolean);
            callback(config, 'sat', 'sat', toBoolean);
            callback(config, 'sun', 'sun', toBoolean);
            callback(config, 'lon', 'lon', Number);
            callback(config, 'lat', 'lat', Number);
        }

        function toBoolean(val) {
            // eslint-disable-next-line prefer-template
            return (val + '').toLowerCase() === 'true';
        }

        // Bodges to allow testing
        node.schedexEvents = () => events;
        node.schedexConfig = () => config;
        node.now = moment;

        bootstrap();
    });
};
