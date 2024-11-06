class Player {
    static players = [];
    static playerIdCounter = 0;

    constructor(name, game) {
        this.id = ++Player.playerIdCounter;
        this.name = name;
        this.game = game;
        this.password = Math.random().toString(36).substring(2);
        this.connection = null; // WebSocket connection

        this.host = false;
        this.role = null;
        this.chatViewPermissions = [];
        this.chatSendPermission = 'village';
        this.alive = true;
        this.canVote = true;
        this.vote = null;

        Player.players.push(this);
    }

    static findByName(name) {
        return Player.players.find(player => player.name === name);
    }

    sendMsg(messageContent) {
        const message = {
            action: "receiveMessage",
            sender: "Moderator",
            date: new Date(),
            message: messageContent,
            permission: this.chatSendPermission,
        };
        if (this.connection && this.connection.readyState === WebSocket.OPEN) {
            console.log(`Sending to ${this.name}:`, message);
            this.connection.send(JSON.stringify(message)); // Send message to the client
        } else {
            console.log(`Connection not open for player ${this.name}`);
        }
    }
}

module.exports = Player;