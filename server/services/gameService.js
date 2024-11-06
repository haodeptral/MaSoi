const Player = require('../models/Player'); // Ensure this import is correct
const Roles = require('../models/Roles');
const Game = require('../models/Game'); // Ensure this import is correct
const deepClone = require('lodash.clonedeep');


class GameService {
    static newGame(name) {
        try {
            const newGame = new Game();
            const player = new Player(name, newGame); 
            newGame.addPlayer(player);
            player.host = true;

            newGame.sendMessage({
                action: "createGame",
                messages: [{
                    sender: "Moderator",
                    date: new Date(),
                    message: `${player.name} has opened the game room. When you have at least five players, which you can invite by giving them the code "${newGame.code}", use <c>!start</c> to start the game.`,
                    permission: "village"
                }]
            });

            return { code: newGame.code, password: player.password };
        } catch (error) {
            throw new Error('Error creating new game: ' + error.message);
        }
    }

    static joinGame(code, name) {
        const game = Game.findByCode(code);
        if (!game) {
            return { failed: true, reason: 'Game not found' };
        }
        const player = new Player(name, game);
        game.addPlayer(player);
        game.sendMessage({
            action: "joinGame",
            sender: "Moderator",
            message: `${player.name} has joined the game.`,
            date: new Date(),
            permission: "village"
        });
        return { code: game.code, playerId: player.id, playerPassword: player.password };
    }
    static startGame(game, player) {

        game.inGame = true;
        game.dayPhase = { phase: "day", timeStarted: new Date() };

        game.chat = [];
        game.sendMessage({
            action: "startGame",
            messages: [{
                sender: "Moderator",
                date: new Date(),
                message: "The game has started!",
                permission: "village"
            }]
        });
        console.log(game);
        //worked
    }
    static assignRoles(game) {
        const roles = Roles.generateRoles(game);

        game.players.forEach((player, index) => {
            const currentRole = deepClone(roles[index]);
            player.role = currentRole;

            // Check if player have permissions to view chat
            if (currentRole.chatViewPermissions) {
                currentRole.chatViewPermissions.forEach(permission => {
                    player.chatViewPermissions.push({
                        name: permission,
                        start: new Date(),
                        end: null,
                    });
                });
            }

            // Check if player have permissions to send chat
            if (currentRole.chatSendPermission) {
                player.nightChatSendPermission = currentRole.chatSendPermission;
            }

            // Add events to player
            if (currentRole.onMessageEvent) player.onMessageEvents.push(currentRole.onMessageEvent);

            if (currentRole.onDayEndEvent) player.onDayEndEvents.push(currentRole.onDayEndEvent);
            if (currentRole.onNightEndEvent) player.onNightEndEvents.push(currentRole.onNightEndEvent);
            if (currentRole.onDeathEvent) player.onDeathEvents.push(currentRole.onDeathEvent);

            // Message player their role
            game.sendMessage({
                action: 'recieveMessage',
                messages: [{
                    sender: 'Moderator',
                    message: currentRole.description,
                    date: new Date(),
                    permission: `user:${player.name}`,
                }],
            });
        });

        // Message all players about all the roles in the game
        if (game.settings.revealRolesInGame) {
            const roleNames = roles.map(role => `<a href="roles/${role.role.name.replace(' ', '%20')}.html">${role.role.name}</a>`);
            roleNames.sort();

            game.sendMessage({
                action: 'recieveMessage',
                messages: [{
                    sender: 'Moderator',
                    date: new Date().toString(),
                    message: `This game has the following roles:<br> &nbsp; - ${roleNames.join('<br> &nbsp; - ')}`,
                    permission: 'village',
                }],
            });
        }
    }

    static scheduleDayPhaseChange(game) {
        // Warning changing phase in 30 seconds
        setTimeout(() => {
            game.sendMessage({
                action: 'recieveMessage',
                messages: [{
                    sender: 'Moderator',
                    date: new Date().toString(),
                    message: `It will soon be ${game.dayPhase.phase === 'day' ? 'night' : 'day'}...`,
                    permission: 'village',
                }],
            });

            // Change phase in 10 seconds
            setTimeout(() => {
                GameService.changeDayPhase(game);
            }, 10000);
        }, 30000);
    }

    static changeDayPhase(game) {
        if (game.dayPhase.phase === 'day') {
            game.dayPhase.phase = 'night';
            game.sendMessage({
                action: 'recieveMessage',
                messages: [{
                    sender: 'Moderator',
                    date: new Date().toString(),
                    message: 'The sun sets and night begins...',
                    permission: 'village',
                }],
            });
            game.players.forEach(player => {
                if (player.role.onNightStartEvent) player.role.onNightStartEvent(player);
            });
            GameService.scheduleDayPhaseChange(game);
        } else {
            game.dayPhase.phase = 'day';
            game.sendMessage({
                action: 'recieveMessage',
                messages: [{
                    sender: 'Moderator',
                    date: new Date().toString(),
                    message: 'The sun rises and day begins...',
                    permission: 'village',
                }],
            });
            game.players.forEach(player => {
                if (player.role.onDayStartEvent) player.role.onDayStartEvent(player);
            });
            GameService.scheduleDayPhaseChange(game);
        }
    }

}

module.exports = GameService;