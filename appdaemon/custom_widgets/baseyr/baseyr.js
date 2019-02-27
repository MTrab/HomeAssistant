function baseyr(widget_id, url, skin, parameters) {
    var self = this;
    // the api should probably be changed so this isn't necessary
    self.parameters = parameters;

    var symbols = function(forecast) {
        var prev = '';
        var count = 0;
        var symbolCount = [];

        var addSymbol = function(name, count) {
            symbolCount.push({
                name: name,
                count: count,
                asset: self.parameters.assets + '/b48/' + name + '.png',
            });
        };

        forecast.forEach(function(value) {
            if (prev == value['symbol']) {
                count++;
            } else {
                if (count != 0) {
                    addSymbol(prev, count);
                }
            
                prev = value['symbol'];
                count = 1;
            }
        });

        addSymbol(prev, count);

        return symbolCount;
    };

    var zeroPad = function(value, length) {
        value = value + '';
        var numPads = length - value.length;
        if (numPads > 0) {
            value = new Array(numPads + 1).join('0') + value;
        }
        return value;
    };
    
    var intervalRounded = function(value, interval) {
        return Math.round(parseFloat(value) / interval) * interval;
    }
    
    var getWindAsset = function(speed, direction) {
        if (parseFloat(speed) <= 0.2) {
            return self.parameters.assets + '/w24/vindstille.png';
        }
        
        var speedAsset = zeroPad(intervalRounded(speed, 2.5) * 10, 4);
        var directionAsset = zeroPad(intervalRounded(direction, 5) % 360, 3);
        
        var file = 'vindpil.' + speedAsset + '.' + directionAsset;
        return self.parameters.assets + '/w24/' + file + '.png';
    }

    var hours = function(forecast) {
        var hours = [];

        for (var i = 0; i < forecast.length; i += 2) {
            hours.push({
                hour: moment(forecast[i].from).format('HH'),
                wind1: getWindAsset(forecast[i].windSpeed, forecast[i].windDirection),
                wind2: getWindAsset(forecast[i+1].windSpeed, forecast[i+1].windDirection),
            });
        }
    
        return hours;
    };

    // hook up callbacks and widget stuff
    self.onData = function(self, data) {
        var forecast = data.attributes.forecast;
        var disclaimer = data.attributes.disclaimer;

        self.set_field(self, 'symbols', symbols(forecast));
        self.set_field(self, 'hours', hours(forecast));
        self.set_field(self, 'forecast', forecast);
        self.set_field(self, 'disclaimer', disclaimer);
    };

    var callbacks = [];
    var monitored_entities = [
        {
            'entity': parameters.entity,
            'initial': self.onData,
            'update': self.onData,
        },
    ];

    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);
}

