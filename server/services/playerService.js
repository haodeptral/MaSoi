const { Player } = require('../models/Player');
const Roles = require('../models/Roles');
const Game = require('../models/Game');
// const deepClone = require('lodash.clonedeep');

class PlayerService {
    static createPlayer(name, gameCode) {
        const game = Game.findByCode(gameCode);
        if (!game) {
            throw new Error('Game not found');
        }
        return new Player(name, game);
    }

    static findPlayerById(id) {
        const player = Player.findById(id);
        if (!player) {
            throw new Error('Player not found');
        }
        return player;
    }

    static findPlayerByConnection(connection) {
        const player = Player.players.find(player => player.connections.includes(connection));
        if (!player) {
            throw new Error('Player not found');
        }
        return player;
    }

    static playerLeaveGame(playerId) {
        const player = this.findPlayerById(playerId);
        player.leaveGame();
    }

    static kickPlayer(playerId) {
        const player = this.findPlayerById(playerId);
        player.kick();
    }

    static playerReady(playerId) {
        const player = this.findPlayerById(playerId);
        player.ready = true;
    }

    static playerUnready(playerId) {
        const player = this.findPlayerById(playerId);
        player.ready = false;
    }

    static onDeathEvent(playerId, killerId) {
        const player = this.findPlayerById(playerId);
        const killer = this.findPlayerById(killerId);
        // checks if player was killed by vote
        if (killer.lynched) {
            // chooses random voter as victim
            // Add your logic here
        }
    }
}

module.exports = PlayerService;