const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController'); // Ensure this import is correct

// Get public games


// Start game
router.post('/createGame', gameController.createGame);

// Join game
router.post('/joinGame', gameController.joinGame);

router.post('/startGame', gameController.startGame);
// Check server status
router.get('/status', gameController.getStatus);

module.exports = router;