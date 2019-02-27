"""
Sensor for retrieving Repetier Server status.

by Morten Trab - 2018
"""
import logging
from datetime import timedelta

import requests
import voluptuous as vol

import homeassistant.helpers.config_validation as cv
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import (CONF_URL, CONF_API_KEY, CONF_PORT, CONF_SCAN_INTERVAL, STATE_IDLE, STATE_ON, STATE_OFF)
from homeassistant.helpers.entity import Entity
from homeassistant.util import Throttle

__version__ = '0.1'

_LOGGER = logging.getLogger(__name__)

SCAN_INTERVAL = timedelta(seconds=5)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_URL): cv.string,
    vol.Required(CONF_API_KEY): cv.string,
    vol.Optional(CONF_PORT, default='3344'): cv.string,
    vol.Optional('decimals', default=1): int,
    vol.Optional('state_percent', default=False): bool,
})

DEC_NUM = 0
SHOW_PCT = True

def parse_repetier_api_response(response):
    """Parse the Repetier Server API json response."""
    data_dict = {} 

    i=0
    for printer in response['data']:
        _key = i
        i += 1
        if _key not in data_dict.keys():
            data_dict[_key] = printer
        else:
            data_dict[_key].update(printer)
    return data_dict
    
    
def setup_platform(hass, config, add_devices, discovery_info=None):
    """Set up the Repetier sensors."""
    try:
        global DEC_NUM
        global SHOW_PCT
        DEC_NUM = config.get("decimals")
        SHOW_PCT = config.get("state_percent")

        data = RepetierData(parse_repetier_api_response, config)
        data.update()
        sensors = []
        for key in data.data.keys():
            sensors.append(RepetierSensor(key, data))
        add_devices(sensors, True)
    except:
        _LOGGER.warning("Cannot setup Repetier sensors, check your config")

def format_data(self):
    self._name = self._data.data[self._repetier_id]['name']

    if self._data.data[self._repetier_id]['online'] == 1:
        if self._data.data[self._repetier_id]['job'] != "none":
            if SHOW_PCT:
                self._state = round(self._data.data[self._repetier_id]['done'],DEC_NUM)
                self._units = '%'
            else:
                self._state = STATE_ON
                self._units = None
            self._attributes = {
                'active': self._data.data[self._repetier_id]['active'],
                'analysed': self._data.data[self._repetier_id]['analysed'],
                'done': self._data.data[self._repetier_id]['done'],
                'job': self._data.data[self._repetier_id]['job'],
                'jobid': self._data.data[self._repetier_id]['jobid'],
                'linesSend': self._data.data[self._repetier_id]['linesSend'],
                'ofLayer': self._data.data[self._repetier_id]['ofLayer'],
                'pauseState': self._data.data[self._repetier_id]['pauseState'],
                'paused': self._data.data[self._repetier_id]['paused'],
                'printTime': self._data.data[self._repetier_id]['printTime'],
                'printedTimeComp': self._data.data[self._repetier_id]['printedTimeComp'],
                'start': self._data.data[self._repetier_id]['start'],
                'totalLines': self._data.data[self._repetier_id]['totalLines'],
                'online': self._data.data[self._repetier_id]['online'],
            }
        else:
            if SHOW_PCT:
                self._state = STATE_IDLE
            else:
                self._state = STATE_ON
            self._attributes = {
                'active': self._data.data[self._repetier_id]['active'],
                'job': self._data.data[self._repetier_id]['job'],
                'pauseState': self._data.data[self._repetier_id]['pauseState'],
                'paused': self._data.data[self._repetier_id]['paused'],
                'online': self._data.data[self._repetier_id]['online'],
            }
            self._units = None
    else:
        self._state = STATE_OFF
        self._attributes = {
            'active': self._data.data[self._repetier_id]['active'],
            'job': self._data.data[self._repetier_id]['job'],
            'pauseState': self._data.data[self._repetier_id]['pauseState'],
            'paused': self._data.data[self._repetier_id]['paused'],
            'online': self._data.data[self._repetier_id]['online'],
        }
        self._units = None

        
class RepetierData(object):
    """Get the latest sensor data."""

    def __init__(self, parse_repetier_api_response, config):
        """Initialize the data object."""
        self.url = self._build_url(config)
        self.data = None
        self.parse_repetier_api_response = parse_repetier_api_response

    # Update only once in scan interval.
    @Throttle(SCAN_INTERVAL)
    def update(self):
        """Get the latest data."""
        
        response = requests.get(self.url)
        if response.status_code != 200:
            _LOGGER.warning("Invalid response from API")
        else:
            self.data = self.parse_repetier_api_response(response.json())

    def _build_url(self, config):
        url = config.get(CONF_URL)
        port = config.get(CONF_PORT)
        api_key = config.get(CONF_API_KEY)

        return url + ":" + port + "/printer/list/?apikey=" + api_key


class RepetierSensor(Entity):
    """Class to hold Repetier Sensor basic info."""

    def __init__(self, repetier_id, data):
        """Initialize the sensor object."""

        self._repetier_id = repetier_id
        self._data = data    # data is in .data
        self._icon = 'mdi:printer-3d'
        format_data(self)
        
    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name
    
    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    @property
    def icon(self):
        """Icon to use in the frontend, if any."""
        return self._icon

    @property
    def unit_of_measurement(self):
        """Set units of measurement"""
        return self._units
        
    @property
    def device_state_attributes(self):
        """Attributes."""
        return self._attributes

    def update(self):
        """Update the sensor."""
        try:
            self._data.update()

            format_data(self)
        except:
            _LOGGER.error("Error updating Repetier Server sensors")