const GameService = require('../services/gameService'); // Ensure this import is correct
const  Game  = require('../models/Game');
const Player = require('../models/Player');

// Join game
const joinGame = (req, res) => {
    const { name, code } = req.body;
    try {
        if (!name || !code) {
            return res.status(400).send("Name and/or code missing");
        }
        if (name.toLowerCase().includes("moderator") || name.length < 3 || name.length > 15 || !/^[\x00-\x7F]*$/.test(name)) {
            return res.status(403).send("Invalid name format.");
        }

        const response = GameService.joinGame(code, name);
        if (response.failed) {
            return res.status(404).send(response.reason);
        }
        res.status(200).json(response);
    } catch (error) {s
        console.error('Error joining game:', error); // Log the error for debugging
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const startGame = (req, res) => {
    const { code, name} = req.body;
    try {
        // console.log(code);
        const game = Game.findByCode(code);
        if (!game) {
            return res.status(404).send("Game not found");
        }
        const player = Player.findByName(name);
        if (!player) {
            return res.status(404).send("Player not found");
        }
        if (!player.host) {
            return res.status(403).send("Player is not host");
        }
        // console.log('Starting game:', game);
        GameService.startGame(game, player);
        console.log('Game started');
        res.status(200).json({message: "Game started"});
    } catch (error) {
        console.error('Error starting game:', error); // Log the error for debugging
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
const createGame = (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).send("Name missing");
        }
        if (name.toLowerCase().includes("moderator") || name.length < 3 || name.length > 15 || !/^[\x00-\x7F]*$/.test(name)) {
            return res.status(403).send("Invalid name format.");
        }
        const response = GameService.newGame(name);
        console.log('Starting game with name:', name);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error starting game:', error); // Log the error for debugging
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const getStatus = (req, res) => {
    res.status(200).json({ status: 'OK' });
}


module.exports = { joinGame, createGame, getStatus, startGame };