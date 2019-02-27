function basecalendar(widget_id, url, skin, parameters) {
    var self = this;
    // the api should probably be changed so this isn't necessary
    self.parameters = parameters;
    
    var locale = (parameters.locale) ? parameters.locale : 'en';
    moment.locale(locale);

    // create shortest possible
    var humanizeDuration = function(beginDate, endDate) {
        var begin = moment(beginDate);
        var end = moment(endDate);

        var diff = moment.duration(end.diff(begin));
        var fromNow = moment.duration(end.diff(moment()));
    
        var dayFormat = "dddd";
        var shortDateFormat = "D MMM";

        var dateFormat = (fromNow.asDays() < 7) ? dayFormat + " Do" : dayFormat + ", " + shortDateFormat;
        var hourFormat = "HH:mm";
        var dateAndHourFormat = dateFormat + ", " + hourFormat;

        // whole days
        if (diff.asHours() % 24 === 0) {
            if (diff.asHours() === 24) {
                // one day
                return begin.format(dateFormat);
            }
            // more days
            return begin.format(dateFormat) + " →\n" + end.format(dateFormat);
        }

        // no duration, only show the start time
        if (diff.asMinutes() === 0) {
            var format = (fromNow.asHours() < 24) ? hourFormat : dateAndHourFormat;
            return begin.format(beginFormat);
        }

        // single day event 
        if (diff.asHours() < 24) {
            var period = begin.format(hourFormat) + " → " + end.format(hourFormat);
            return begin.format(dateFormat) + "\n" + period;
        }

        // event streches over multiple days, with different times
        dateFormat = (fromNow.asDays() > 7) ? dayFormat : shortDateFormat;
        dateAndHourFormat = dateFormat + ", " + hourFormat;
        return begin.format(dateAndHourFormat) + " →\n" + end.format(dateAndHourFormat);
    };
    

    // hook up callbacks and widget stuff
    self.onData = function(self, state) {
        var events = state.attributes.calendar_events.map(function (event) {
            return {
                name: event.name,
                location: event.location,
                duration: humanizeDuration(event.begin, event.end),
            };
        });

        self.set_field(self, 'events', events);
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

