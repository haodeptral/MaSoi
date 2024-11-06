const Player = require('./Player'); // Ensure this import is correct

class Game {
    static games = [];
    static codes = [];

    constructor() {
        this.code = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.players = [];
        this.chat = [];
        this.connections = [];
        this.inGame = false;
        this.gameEnded = false;
        this.votingOpen = false;
        this.settings = {
            allowPlayersToJoin: true,
            allowSelfVotes: false,
            public: false,
            revealRolesInGame: true,
            revealRolesOnDeath: false,
        };
        this.votes = {};
        this.data = {
            wolfpack: {
                killsAllowed: 1,
            },
        };
        this.dayPhase = {
            phase: null,
            timeStarted: new Date(),
        };

        // Add game into list
        Game.games.push(this);
        Game.codes.push(this.code);
    }

    static findByCode(code) {
        return Game.games.find(game => game.code === code);
    }

    addPlayer(player) {
        if (!this.players.includes(player)) {
            this.players.push(player);
            player.game = this;
        }
    }

    static findPlayerByName(name){
        return this.players.find(player => player.name === name);
    }
    sendMessage(message) {
        this.players.forEach(player => {
            console.log(`Sending message to player ${player.name}:`, message);
            player.sendMsg(message);

        });
    }


    getCode() {
        console.log(this.codes);
    }

}

module.exports = Game;