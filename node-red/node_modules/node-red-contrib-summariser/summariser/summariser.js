var _ = require('lodash');

module.exports = function(RED) {
    function SummariserNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        node.on('input', function(msg) {
            var data = msg.payload;

            // if msg.payload is an array, process the rules
            if (_.isArray(data)) {
              var retMsg = [];
              config.rules.forEach(function(rule, idx) {
                var rm = RED.util.cloneMessage(msg);
                if (rule.op == "sum") {
                  rm.payload = _.sumBy(data, rule.field)
                } else if (rule.op == "count") {
                  rm.payload = _.map(data, rule.field).length
                } else if (rule.op == "mean") {
                  rm.payload = _.meanBy(data, rule.field)
                } else if (rule.op == "group") {
                  rm.payload = _.countBy(data, rule.field)
                } else if (rule.op == "join") {
                  rm.payload = _.map(data, rule.field).join(rule.sep)
                } else if (rule.op == "extract") {
                  rm.payload = _.map(data, rule.field)
                };
                retMsg.push(rm);
              })
            } else {
              var retMsg = _.times(config.rules.length, function() { return RED.util.cloneMessage(msg) });
            };
            node.send(retMsg);
        });
    }
    RED.nodes.registerType("summariser",SummariserNode);
}
