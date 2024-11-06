const { Player } = require('../models/Player');
const Game = require('../models/Game');

// Create a new player
const createPlayer = (req, res) => {
    const { name, gameCode } = req.body;
    try {
        if (!name || !gameCode) {
            return res.status(400).send("Name and/or game code missing");
        }
        if (name.toLowerCase().includes("moderator") || name.length < 3 || name.length > 15 || !/^[\x00-\x7F]*$/.test(name)) {
            return res.status(403).send("Invalid name format.");
        }

        const game = Game.findByCode(gameCode);
        if (!game) {
            return res.status(404).send("Game not found");
        }

        const player = new Player(name, game);
        res.locals.player = player;
        res.status(200).json({ player });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Find a player by ID
const findPlayerById = (req, res) => {
    const { id } = req.params;
    try {
        const player = Player.findById(id);
        if (!player) {
            return res.status(404).send("Player not found");
        }
        res.locals.player = player;
        res.status(200).json({ player });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Find a player by connection
const findPlayerByConnection = (req, res) => {
    const { connectionId } = req.query;
    try {
        const player = Player.findByConnection(connectionId);
        if (!player) {
            return res.status(404).send("Player not found");
        }
        res.locals.player = player;
        res.status(200).json({ player });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Player leaves the game
const playerLeaveGame = (req, res) => {
    const { playerId } = req.body;
    try {
        const player = Player.findById(playerId);
        if (!player) {
            return res.status(404).send("Player not found");
        }
        player.leaveGame();
        res.status(200).json({ message: 'Player has left the game.' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Kick a player from the game
const kickPlayer = (req, res) => {
    const { playerId } = req.body;
    try {
        const player = Player.findById(playerId);
        if (!player) {
            return res.status(404).send("Player not found");
        }
        player.kick();
        res.status(200).json({ message: 'Player has been kicked.' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

module.exports = {
    createPlayer,
    findPlayerById,
    findPlayerByConnection,
    playerLeaveGame,
    kickPlayer
};