const level = require('level');
const db = level('./registry');

const KEY = 'ports';

const registry = {
    get: () => {
        return db.get(KEY)
            .then(jsonStr => JSON.parse(jsonStr))
            .catch(error => {
                if (!error.notFound) {
                    console.error(error);
                    throw error;
                }
                return [];
            });
    },

    clear: function () {
        const ports = {
            used: {},
            notused: {}
        };
        return this._savePorts(ports);
    },
    
    add: function (port) {
        return this.get()
            .then(ports => {
                if (ports.used[port] || ports.notused[port]) {
                    throw new Error('ALREADY ADDED');
                }
                ports.notused[port] = port;
                return this._savePorts(ports);
            })
            .catch(error => {
                if (!error.notFound) {
                    console.error(error);
                    throw error;
                }
                const ports = {
                    notused: {},
                    used: {}
                };
                ports.notused[port] = port;
                return this._savePorts(ports);
            });
    },
    // not safe
    reservePort: function (serviceType) {
        return this.get()
            .then(ports => {
                const freePorts = Object.keys(ports.notused);
                if (freePorts.length < 1) {
                    throw new Error('NO FREE PORT');
                }

                const port = freePorts.shift();
                const servicePorts = Object
                    .keys(ports.used)
                    .filter(port => ports.used[port] === serviceType);
                servicePorts.push(port);

                delete ports.notused[port];
                ports.used[port] = serviceType;
                return this._savePorts(ports).then(() => freePorts.concat(servicePorts));
            });
    },

    freePort: function (port) {
        return this.get()
            .then(ports => {
                if (!ports.used[port]) {
                    throw new Error('PORT NOT USED');
                }
                delete ports.used[port];
                ports.notused[port] = port;
                return this._savePorts(ports);
            });
    },

    _savePorts: function (ports) {
        ports = JSON.stringify(ports);
        return db
            .put(KEY, ports)
            .catch(error => {
                console.error(error);
                throw error;
            });;
    }
};


module.exports = registry;