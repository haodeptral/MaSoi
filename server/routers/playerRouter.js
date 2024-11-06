const express = require('express');
const router = express.Router();

const playerController = require('../controllers/playerController');

router.post('/create', playerController.createPlayer, (req, res) => {
    try {
        res.status(200).json({ player: res.locals.player });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

router.get('/find/:id', playerController.findPlayerById, (req, res) => {
    try {
        res.status(200).json({ player: res.locals.player });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

router.get('/find/connection', playerController.findPlayerByConnection, (req, res) => {
    try {
        res.status(200).json({ player: res.locals.player });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});





module.exports = router;