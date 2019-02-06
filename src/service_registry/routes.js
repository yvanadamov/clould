const registry = require('./db');
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    registry.get()
        .then((portInfo) => res.json(portInfo))
        .catch(error => res.json({ error: error.toString() }));
});

router.post('/clear', (req, res) => {
    console.log('Clearing ports');
    registry.clear()
        .then(() => res.json({ success: true }))
        .catch(error => res.json({ error: error.toString() }));
});

router.post('/reserve', (req, res) => {
    const serviceType = req.body.serviceType;
    console.log(`Registering ${serviceType}`);
    registry.reservePort(serviceType)
        .then(ports => res.json({ports: ports}))
        .catch(error => res.json({ error: error.toString() }));
});

router.post('/free', (req, res) => {
    const port = req.body.port;
    console.log(`Freeing ${port}`);
    registry.freePort(port)
        .then(() => res.json({ success: true }))
        .catch(error => res.json({ error: error.toString() }));
});

router.post('/add', (req, res) => {
    const port = req.body.port;
    console.log(`Adding ${port}`);
    registry.add(port)
        .then(() => res.json({ success: true }))
        .catch(error => res.json({ error: error.toString() }));
});

module.exports = router;