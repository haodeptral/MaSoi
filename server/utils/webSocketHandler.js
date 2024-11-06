const WebSocketServer = require('websocket').server;
const Player = require('../models/Player');
const GameService = require('../services/gameService');
const Game = require('../models/Game');
function initWebSocket(server) {
    const wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: false
    });

    wsServer.on('request', function (request) {
        const connection = request.accept(null, request.origin);

        connection.on('message', function (message) {
            if (message.type === 'utf8') {
                const data = JSON.parse(message.utf8Data);
                handleGameActions(data, connection, wsServer);
            }
        });

        connection.on('close', function () {
            console.log('Connection closed');
        });
    });
}

function handleGameActions(data, connection, wsServer) {
    const { action, code, name, message, sender } = data;

    switch (action) {
        case 'linkConnection':
            // Link the WebSocket connection to the player
            const player = Player.findByName(name);
            if (player) {
                player.connection = connection;
                console.log(`Linked connection to player ${player.name}`);
            }else {
                console.log(`Player ${name} not found`);
            }
            break;
        case 'joinGame':
            const joinResponse = GameService.joinGame(code, name);
            if (joinResponse.failed) {
                connection.sendUTF(JSON.stringify({ action: 'error', message: joinResponse.reason }));
            } else {
                connection.sendUTF(JSON.stringify({ action: 'joinGame', message: 'Joined game successfully' }));
            }
            break;
        case 'sendMessage':
            handleSendMessage(data, wsServer);
            break;
        default:
            console.error('Invalid action:', action);
            connection.sendUTF(JSON.stringify({ action: 'error', message: 'Invalid action' }));
    }
}

function handleSendMessage(data, wsServer) {
    const { message, sender, date } = data;
    // Broadcast the message to all connected clients
    wsServer.connections.forEach(function each(client) {
        if (client.connected) {
            client.sendUTF(JSON.stringify({
                action: 'receiveMessage',
                message: message,
                sender: sender,
                date: date
            }));
        }
    });
}

module.exports = { initWebSocket };