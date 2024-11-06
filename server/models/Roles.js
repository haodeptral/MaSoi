const roles = {
    villager: {
        description: "You are an ordinary <a href=\"roles/villager.html\">villager</a>. You lack any special power, so you must use your wits to identify and kill off the werewolves plaguing your town.",
        value: 0,

        role: {
            name: "villager",
            seenByOthers: "villager",
            seenBySelf: "villager"
        },

        faction: {
            name: "village",
            seenByOthers: "village",
            seenBySelf: "village"
        },
    },

    werewolf: {
        description: "You are a <a href=\"roles/werewolf.html\">werewolf</a>. During the day, you are like everyone else, but at night, you transform into a bloodthirsty monster and slaughter villagers.",
        value: -1,

        role: {
            name: "werewolf",
            seenByOthers: "werewolf",
            seenBySelf: "werewolf"
        },

        faction: {
            name: "wolfpack",
            seenByOthers: "wolfpack",
            seenBySelf: "wolfpack"
        },

        chatViewPermissions: ["wolfpack"],
        chatSendPermission: "wolfpack",

        onMessageEvent: function (message, player) {
            if (player.game.dayPhase.phase == "night" && player.dead == false) {
                // !kill command
                if (message.action == "sendMessage" && message.message.substring(0, 6) == "!kill ") {
                    wolfpackKill(message, player);
                }
            }
        },

        onDayEndEvent: function (player) {
            if (player.dead == false) {
                player.game.sendMessage({
                    action: "recieveMessage",
                    messages: [{
                        sender: "Moderator",
                        message: `You are a <a href=\"roles/werewolf.html\">werewolf</a>, amember of the wolfpack. You, and all other wolves, can use the command <c>!kill username</c> to kill a player. The wolfpack can kill ${player.game.data.wolfpack.killsAllowed} players tonight.`,
                        date: new Date(),
                        permission: `user:${player.name}`
                    }]
                });
            }
        },

        onNightEndEvent: function (player) {
            // checks if target was chosen
            if (!!player.game.data && !!player.game.data.wolfpack && player.game.data.wolfpack.targets && player.game.data.wolfpack.targets.length > 0) {
                // loops through every target
                for (let i = 0; i < player.game.data.wolfpack.targets.length; i++) {
                    // checks if current player is killer
                    if (player.game.data.wolfpack.targets[i].killer == player && player.game.data.wolfpack.targets[i].target.dead == false) {

                        // removes targets
                        if (!player.game.data.wolfpack.targetsKilled) player.game.data.wolfpack.targetsKilled = 0;
                        player.game.data.wolfpack.targetsKilled++;

                        // kills target
                        player.game.data.wolfpack.targets[i].target.die(player);
                    }
                }

                // resets target data
                if (player.game.data.wolfpack.targetsKilled >= player.game.data.wolfpack.targets.length) {
                    player.game.data.wolfpack.targetsKilled = 0;
                    player.game.data.wolfpack.targets = [];
                }
            }
        }
    },

    avenger: {
        description: "You are an <a href=\"roles/avenger.html\">avenger</a>. If you die, you will kill the player who wronged you in your final breath. If you are killed by vote, you will kill a random player who voted for you. This kill will ignore any protection.",
        value: 0,

        role: {
            name: "avenger",
            seenByOthers: "avenger",
            seenBySelf: "avenger"
        },

        faction: {
            name: "village",
            seenByOthers: "village",
            seenBySelf: "village"
        },

        onDeathEvent: function (player, killer) {
            // checks if player was killed by vote
            if (killer.lynched) {
                // chooses random voter as victom
                let victim = killer.voters[Math.floor(Math.random() * killer.voters.length)];

                victim.die(player, true, `As ${player.name} hung from a noose, they reached out and strangled ${victim.name} for revenge in their final breath.`);
            } else {
                console.log(`killer (${killer.name}) being killed`);
                killer.die(player, true);
            }
        }
    },

    protector: {
        description: "You are a <a href=\"roles/protector.html\">protector</a>. You can protect yourself and others from being killed during the night.",
        value: 3,

        role: {
            name: "protector",
            seenByOthers: "protector",
            seenBySelf: "protector"
        },

        faction: {
            name: "village",
            seenByOthers: "village",
            seenBySelf: "village"
        },

        onMessageEvent: function (message, player) {
            // checks if alive and night time
            if (player.game.dayPhase.phase == "night" && player.dead == false) {
                // checks if using !protect command
                if (message.action == "sendMessage" && message.message.substring(0, 9) == "!protect ") {
                    let target = null;

                    // !protect Moderator easter egg
                    if (message.message == "!protect Moderator") {
                        player.game.sendMessage({
                            action: "recieveMessage",
                            messages: [{
                                sender: "Moderator",
                                message: "I'm flattered, really, but I'm the all-knowing, all-powerful moderator. I can protect myself.",
                                date: new Date(),
                                permission: `user:${player.name}`
                            }]
                        });

                        // exits function
                        return;
                    }

                    // loops through players in game
                    for (let i = 0; i < player.game.players.length; i++) {
                        // checks if current player name matches target name
                        if (player.game.players[i].name == message.message.substring(9)) {
                            target = player.game.players[i];
                            break;
                        }
                    }

                    // target not found
                    if (target == null) {
                        player.game.sendMessage({
                            action: "recieveMessage",
                            messages: [{
                                sender: "Moderator",
                                message: `There is no player in the game called "${message.message.substring(9)}". Check your spelling or try copy-pasting their name.`,
                                date: new Date(),
                                permission: `user:${player.name}`
                            }]
                        });

                        // exits function
                        return;
                    }

                    // protecting a dead player
                    if (target.dead) {
                        player.game.sendMessage({
                            action: "recieveMessage",
                            messages: [{
                                sender: "Moderator",
                                message: `${message.message.substring(9)} is... beyond protecting. In case you haven't noticed, they're dead.`,
                                date: new Date(),
                                permission: `user:${player.name}`
                            }]
                        });

                        // exits function
                        return;
                    }

                    // protecting same player twice
                    if (!!player.data.protector && !!player.data.protector.lastTarget && player.data.protector.lastTarget == target) {
                        player.game.sendMessage({
                            action: "recieveMessage",
                            messages: [{
                                sender: "Moderator",
                                message: `You already protected ${message.message.substring(9)} yesterday. Pick someone else.`,
                                date: new Date(),
                                permission: `user:${player.name}`
                            }]
                        });

                        // exits function
                        return;
                    }

                    // valid target
                    player.ready = true;

                    // sets target in data
                    if (!player.data.protector) player.data.protector = {
                        lastTarget: null
                    };

                    // un-protects target
                    if (!!player.data.protector.target && player.data.protector.target.protection == player) {
                        // removes player from protection list
                        target.protection.splice(target.protection.indexOf(player), 1);
                    }

                    player.data.protector.target = target;
                    target.protection.push(player);

                    player.game.sendMessage({
                        action: "recieveMessage",
                        messages: [{
                            sender: "Moderator",
                            message: `Tonight you will protect ${target.name}. If anyone tries to kill them, they will fail.`,
                            date: new Date(),
                            permission: `user:${player.name}`
                        }]
                    });
                }
            }
        },

        onNightEndEvent: function (player) {
            if (!!player.data.protector && !!player.data.protector.target) {
                player.data.protector.lastTarget = player.data.protector.target;
                player.data.protector.target = null;
            }
        },

        onDayEndEvent: function (player) {
            if (player.dead == false) {
                player.ready = false;

                player.game.sendMessage({
                    action: "recieveMessage",
                    messages: [{
                        sender: "Moderator",
                        message: 'You are a <a href=\"roles/protector.html\">protector</a>. You protect yourself and others using the command <c>!protect username</c>. You cannot protect the same player two nights in a row.',
                        date: new Date(),
                        permission: `user:${player.name}`
                    }]
                });
            } else {
                player.ready = true;
            }
        }
    },

    seer: {
        description: "You are a <a href=\"roles/seer.html\">seer</a>, a powerful magician. You can peer into the minds of other players and see their true nature. Be aware, however, that some roles are seen unreliably.",
        value: 2,

        role: {
            name: "seer",
            seenByOthers: "seer",
            seenBySelf: "seer"
        },

        faction: {
            name: "village",
            seenByOthers: "village",
            seenBySelf: "village",
        },

        chatViewPermissions: null,
        chatSendPermission: null,

        onMessageEvent: function (message, player) {
            if (player.game.dayPhase.phase == "night" && player.dead == false) {
                // !check command
                if (message.action == "sendMessage" && message.message.substring(0, 7) == "!check ") {
                    let target = null;

                    // loops through players in game
                    for (let i = 0; i < player.game.players.length; i++) {
                        // checks if current player name matches target name
                        if (player.game.players[i].name == message.message.substring(7)) {
                            target = player.game.players[i];
                            break;
                        }
                    }

                    // target not found
                    if (target == null) {
                        player.game.sendMessage({
                            action: "recieveMessage",
                            messages: [{
                                sender: "Moderator",
                                message: `There is no player in the game called "${message.message.substring(7)}". Check your spelling or try copy-pasting their name.`,
                                date: new Date(),
                                permission: `user:${player.name}`
                            }]
                        });

                        // exits function
                        return;
                    }

                    // checking a dead player
                    if (target.dead) {
                        player.game.sendMessage({
                            action: "recieveMessage",
                            messages: [{
                                sender: "Moderator",
                                message: `${player.name} is dead. You cannot peer into the mind of a dead man.`,
                                date: new Date(),
                                permission: `user:${player.name}`
                            }]
                        });

                        // exits function
                        return;
                    }

                    // valid target
                    player.ready = true;

                    // sets target in data to target
                    if (!player.data.seer) player.data.seer = {};
                    player.data.seer.target = target;

                    player.game.sendMessage({
                        action: "recieveMessage",
                        messages: [{
                            sender: "Moderator",
                            message: `You will check ${message.message.substring(7)}'s faction tonight.`,
                            date: new Date(),
                            permission: `user:${player.name}`
                        }]
                    });
                }
            }
        },

        onDayEndEvent: function (player) {
            if (player.dead == false) {
                player.ready = false;

                player.game.sendMessage({
                    action: "recieveMessage",
                    messages: [{
                        sender: "Moderator",
                        message: `You are a <a href=\"roles/seer.html\">seer</a>. You can use the command <c>!check username</c> to check a player's faction.`,
                        date: new Date(),
                        permission: `user:${player.name}`
                    }]
                });
            } else {
                player.ready = true;
            }
        },

        onNightEndEvent: function (player) {
            // checks if target was chosen
            if (!!player.data.seer && !!player.data.seer.target) {
                player.game.sendMessage({
                    action: "recieveMessage",
                    messages: [{
                        sender: "Moderator",
                        message: `You checked ${player.data.seer.target.name}'s faction. Their faction is "${player.data.seer.target.role.faction.seenByOthers}".`,
                        date: new Date(),
                        permission: `user:${player.name}`
                    }]
                });

                player.data.seer.target = null;
            }

        }
    },

}
function wolfpackKill(message, player) {
    let target = null;

    // loops through players in game
    for (let i = 0; i < player.game.players.length; i++) {
        // checks if current player name matches target name
        if (player.game.players[i].name == message.message.substring(6)) {
            target = player.game.players[i];
            break;
        }
    }

    // target not found
    if (target == null) {
        player.game.sendMessage({
            action: "recieveMessage",
            messages: [{
                sender: "Moderator",
                message: `There is no player in the game called "${message.message.substring(6)}".`,
                date: new Date(),
                permission: player.chatSendPermission
            }]
        });

        return;
    }

    // killing a dead player
    if (target.dead) {
        player.game.sendMessage({
            action: "recieveMessage",
            messages: [{
                sender: "Moderator",
                message: `${message.message.substring(6)} is already dead. Are you planning on mauling a corpse?`,
                date: new Date(),
                permission: "wolfpack"
            }]
        });

        // exits function
        return;
    }

    if (!!player.game.data.wolfpack.targets) {

        // checks if target is already a target of wolfpack
        let includesTarget = false;
        for (let i = 0; i < player.game.data.wolfpack.targets.length; i++) {
            if (player.game.data.wolfpack.targets[i].target == target) {
                includesTarget = true;
                break;
            }
        }

        // killing the same target twice
        if (includesTarget) {
            player.game.sendMessage({
                action: "recieveMessage",
                messages: [{
                    sender: "Moderator",
                    message: `${player.name} is already one of your targets. Are you expecting to kill the same guy twice in one night?`,
                    date: new Date(),
                    permission: "wolfpack"
                }]
            });

            // exits function
            return;
        }
    }

    // this means it is a valid player

    // sets target in data to target
    if (!player.game.data.wolfpack) player.game.data.wolfpack = {};
    if (!player.game.data.wolfpack.targets) player.game.data.wolfpack.targets = [];

    player.game.data.wolfpack.targets.push({
        target: target,
        killer: player
    });

    // checks if allowed kills is exceeded
    if (player.game.data.wolfpack.targets.length > player.game.data.wolfpack.killsAllowed) {
        player.game.data.wolfpack.targets.shift();
    }

    let outputMessage = "";

    if (player.game.data.wolfpack.targets.length == 1) {
        outputMessage = `${player.name} will kill ${message.message.substring(6)} tonight.`
    } else {
        outputMessage = `${player.game.data.wolfpack.targets[0].killer.name} will kill ${player.game.data.wolfpack.targets[0].target.name}`;

        for (let i = 1; i < player.game.data.wolfpack.targets.length - 1; i++) {
            outputMessage += `, ${player.game.data.wolfpack.targets[i].killer.name} will kill ${player.game.data.wolfpack.targets[i].target.name}`;
        }

        outputMessage += `, and ${player.game.data.wolfpack.targets[player.game.data.wolfpack.targets.length - 1].killer.name} will kill ${player.game.data.wolfpack.targets[player.game.data.wolfpack.targets.length - 1].target.name} tonight.`;
    }

    player.game.sendMessage({
        action: "recieveMessage",
        messages: [{
            sender: "Moderator",
            message: outputMessage,
            date: new Date(),
            permission: "wolfpack"
        }]
    });
}

function generateRoles(game) {
    const powerRoles = [roles.avenger, roles.protector, roles.seer];
    const wolfRoles = [roles.werewolf];

    let outputRoles = [];
    let outputRoleNames = [];

    // one power role for about every 3 players
    let powerRolesAmount = Math.round(game.players.length / 3);

    // one wolf for about every 5 players
    let wolvesAmount = Math.round(game.players.length / 5);

    // villagers amount is left unset since it can change
    let villagersAmount;

    // adds power roles
    for (let i = 0; i < powerRolesAmount; i++) {
        // gets random role
        let randomRole = powerRoles[Math.floor(Math.random() * powerRoles.length)];

        // adds randomRole to list of roles
        outputRoles.push(randomRole);
        outputRoleNames.push(randomRole.role.name);
    }

    // adds wolf roles
    for (let i = 0; i < wolvesAmount; i++) {
        // gets random role
        let randomRole = wolfRoles[Math.floor(Math.random() * wolfRoles.length)];

        // adds randomRole to list of roles
        outputRoles.push(randomRole);
        outputRoleNames.push(randomRole.role.name);
    }

    // adds regular villagers
    villagersAmount = game.players.length - wolvesAmount - powerRolesAmount;

    for (let i = 0; i < villagersAmount; i++) {
        // adds villager to roles list
        outputRoles.push(roles.villager);
        outputRoleNames.push("villager");
    }

    // shuffles roles
    let newOutputRoles = [];
    let outputRolesLength = outputRoles.length;
    for (let i = 0; i < outputRolesLength; i++) {
        // gets random index in roles
        let randomIndex = Math.floor(Math.random() * outputRoles.length);
        newOutputRoles.push(outputRoles[randomIndex]);
        outputRoles.splice(randomIndex, 1);
    }

    // returns output roles
    return newOutputRoles;
}

// exports roles
module.exports = {
    roles,
    generateRoles
}