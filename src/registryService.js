const request = require('request-promise');

const HOST = 'localhost:8090';

module.exports = {
    reservePort: function (serviceType) {
        const options = {
            method: 'POST',
            uri: `http://${HOST}/reserve`,
            body: { serviceType: serviceType },
            json: true
        };
        return request(options)
            .then(parsedBody => {
                if (parsedBody.error) {
                    throw parsedBody.error;
                }
                return parsedBody.ports;
            });
    },

    freePort: function (port) {
        const options = {
            method: 'POST',
            uri: `http://${HOST}/free`,
            body: { port: port },
            json: true
        };
        return request(options)
            .then(parsedBody => {
                if (parsedBody.error) {
                    throw parsedBody.error;
                }
                return true;
            });
    }
};