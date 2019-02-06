const http = require('http');
const WebSocketServer = require('ws').Server;
const ecstatic = require('ecstatic');
const zmq = require('zeromq');
const registryService = require('./registryService');

const { Message, Producer } = require('redis-smq');
const producer = new Producer('chat_queue');

registryService
    .reservePort('service')
    .then(servicePorts => {
        const port = servicePorts.pop();
        const pubSocket = zmq.socket('pub');
        console.log(`Publishing on port: ${port}`);
        pubSocket.bind(`tcp://127.0.0.1:${port}`);
        const subSocket = zmq.socket('sub');
        servicePorts.forEach(servicePort => {
            console.log(`Subscribing for port: ${servicePort}`);
            subSocket.connect(`tcp://127.0.0.1:${servicePort}`);
        });
        subSocket.subscribe('chat');

        function unregisterService() {
            registryService.freePort(port)
                .then(() => process.exit(0))
                .catch(error => {
                    console.error(error);
                    process.exit(0);
                });
        }

        process.on('exit', unregisterService);
        process.on('SIGINT', unregisterService);
        process.on('uncaughtException', unregisterService);

        // Http server
        const server = http.createServer(ecstatic({ root: `${__dirname}/www` }));

        const httpPort = process.argv[2] || 8080;
        server.listen(httpPort, () => {
            console.log(`Server listening on ${httpPort}`);
        });

        // Web socket
        const wws = new WebSocketServer({ server: server });
        wws.on('connection', ws => {
            console.log('Client(web) connected');
            ws.on('message', message => {
                console.log(`Message received from web: ${message}`);
                broadcast(message);
                pubSocket.send(`chat ${message}`);

                const historyMessage = new Message();
                historyMessage
                    .setBody({ content: message })
                    .setTTL(3600000)
                    .setScheduledDelay(10);
                console.log('Try to produce');
                producer.produceMessage(historyMessage, err => {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        console.log('Successfully produced message for history');
                    }
                });
            });
        });
        subSocket.on('message', message => {
            console.log(`Message to be consumed by subscriber: ${message.toString()}`);
            broadcast(message.toString().split(' ').slice(1).join(' '));
        });

        function broadcast(message) {
            wws.clients.forEach(client => client.send(message));
        }
    })
    .catch(error => console.error(error));