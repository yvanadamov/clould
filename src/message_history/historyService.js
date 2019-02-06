const http = require('http');
const level = require('level');
const timestamp = require('monotonic-timestamp');
const JSONStream = require('JSONStream');
const db = level('messageHistory')
const { Consumer } = require('redis-smq');

class HistoryService extends Consumer {
    consume(message, cb) {  
        console.log(`Saving message in history service: ${JSON.stringify(message, null, 2)}`);
        db.put(timestamp(), message.content, err => {
            if (err) {
                return cb(err);
            }
            cb();
        });
    }
}
HistoryService.queueName = 'chat_queue';

const server = http.createServer((req, res) => {
    res.writeHead(200);
    db.createValueStream()
        .pipe(JSONStream.stringify())
        .pipe(res);
});
server.listen(8092, () => console.log('Server listening'));

const historyService = new HistoryService({
    log: {
        enabled: 1,
        options: {
            level: 'error'
        },
    },
});
historyService.run();
// historyService.on('message.next', (data) => console.log(data));


