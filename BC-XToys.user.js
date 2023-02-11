// ==UserScript==
// @name         Bondage Club XToys Integration
// @namespace    BC-XToys
// @version      0.5.5
// @description  Sends in game actions and toy activity to XToys.
// @author       ItsNorin
// @match        https://bondageprojects.elementfx.com/*
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://bondage-europe.com/*
// @match        https://www.bondage-europe.com/*
// @match        http://localhost:*/*
// @homepage     https://github.com/ItsNorin/Bondage-Club-XToys-Integration
// @run-at       document-end
// @grant        none
// ==/UserScript==

const BC_XToys_Version = "0.5.5";
const BC_XToys_FullName = "Bondage Club XToys Integration";

// Chat message contents to always ignore
const BC_XToysIgnoreMsgContents = new Set(['BCXMsg', 'BCEMsg', 'Preference', 'Wardrobe', 'SlowLeaveAttempt', 'ServerUpdateRoom', 'bctMsg']);
const BC_XToysIgnoreMsgTypes = new Set(['Status', 'Hidden']);

var BC_XToysSendJoinMsg = true;
const BC_XToysFirstJoinMsg = BC_XToys_FullName + ' v' + BC_XToys_Version + ' loaded. Use <b>/bcxtoys</b> for help.';

// Websocket manager to handle connections and sending messages
var BC_XToys_Websockets = {
    sockets: new Map(),

    // if false, will not send anything
    sendMessages: true,

    // creates a websocket connection to given URL
    connect(url) {
        if (url == null) { return; }

        if (this.hasConnection(url)) {
            var m = 'Already connected to ' + url;
            ChatRoomSendLocal(m, 60000);
            console.log(m);
            return;
        }

        var newSocket = new WebSocket(url);

        newSocket.onopen = function (e) {
            var m = 'Connected to ' + newSocket.url;
            ChatRoomSendLocal(m, 60000);
            console.log(m);
        };
        newSocket.onmessage = e => {
            console.log(e.data);
        };
        newSocket.onclose = function (event) {
            var m = 'Disconnected from ' + url;
            ChatRoomSendLocal(m, 60000);
            console.log(m);
            BC_XToys_Websockets.close(url);
        };

        this.sockets.set(url, newSocket);
    },

    // sends to all connected sockets
    send(text) {
        if (this.sockets.size <= 0 || this.sendMessages == false) { return; }
        var logMsg = 'Sent ' + text + ' to '
        for (let s of this.sockets.values()) {
            if (s.readyState != 1) { continue; }
            logMsg += s.url + ', ';
            s.send(text);
        }
        console.log(logMsg);
    },

    // true if has connection to given url
    hasConnection(url) {
        var s = this.sockets.get(url);
        return (s == null) ? false : s.readyState == 1;
    },

    // true if any socket is connected
    hasAnyConnection() {
        if (this.sockets.size <= 0) { return false; }
        for (let url of this.sockets.keys()) {
            if (this.hasConnection(url)) {
                return true;
            }
        }
        return false;
    },

    // closes and removes connection to url
    close(url) {
        var s = this.sockets.get(url);
        if (s == null) { return; }
        if (s.readyState <= 1) {
            s.close(1000);
        }
        this.sockets.delete(url);
    },

    // closes all connections
    closeAll() {
        for (let s of this.sockets.values()) {
            this.close(s.url);
        }
    },

    getConnections() {
        var c = [];
        for (let k of this.sockets.keys()) {
            c.push(k);
        }
        return c;
    },
};

// Ongoing toy state handler, use this to avoid sending duplicate messages
var BC_XToys_ToyStates = {
    // states is a map of slot names, each containing a map of stateTypes with a level
    states: new Map(),

    setState(slotName, stateType, level) {
        if (this.states.get(slotName) == null) {
            this.states.set(slotName, new Map());
        }
        var t = this.states.get(slotName);
        t.set(stateType, level);
    },

    // returns level for given stateType of slot, ex: 'Vibration', 'Inflation'
    getState(slotName, stateType) {
        var t = this.states.get(slotName);
        return (t == null) ? null : t.get(stateType);
    },

    // true if level of stateType for given slot already exists
    hasState(slotName, stateType, level) {
        var l = this.getState(slotName, stateType);
        return (l == null) ? false : l == level;
    },

    clearSlot(slotName) {
        var t = this.states.get(slotName);
        if (t == null) { return; }

        for (let k of t.keys()) {
            t.delete(k);
        }
        this.states.delete(slotName);
    },

    log() {
        console.log(this.states);
    },
};

(async function () {
    await waitFor(() => ServerIsConnected && ServerSocket);
    await waitFor(() => !!Commands);

    console.log("Starting " + BC_XToys_FullName + " version " + BC_XToys_Version + ".");

    // sends any amount of arguements to XToys Websocket
    // actionName - string
    // args - array of [string, any type]
    // if arg data is null, will send "none"
    function xToysSendData(actionName, args = null) {
        if (!BC_XToys_Websockets.hasAnyConnection()) {
            console.log('Failed to send message, not connected.');
            return;
        }

        var toSend = '{"action": "' + actionName + '"';

        if (args != null && Array.isArray(args)) {
            for (var i = 0; i < args.length; i++) {
                if (!Array.isArray(args[i]) || args[i].length != 2 || typeof args[i][0] != 'string') {
                    continue;
                }

                toSend += ', "' + args[i][0] + '": ';
                if (args[i][1] == null) {
                    toSend += '"none"';
                }
                else if (typeof args[i][1] == 'string') {
                    toSend += '"' + args[i][1] + '"';
                } else {
                    toSend += args[i][1];
                }
            }
        }
        toSend += '}';

        BC_XToys_Websockets.send(toSend);
    }

    // Activities involving player
    function handleActivities(data) {
        if (data.Type != 'Activity') { return; }

        var activityGroup = searchMsgDictionary(data, 'FocusGroupName');
        var activityName = searchMsgDictionary(data, 'ActivityName');
        var activityAsset = searchMsgDictionary(data, 'ActivityAsset', 'AssetName');
        var targetChar = searchMsgDictionary(data, 'TargetCharacter', 'MemberNumber');
        var sourceChar = searchMsgDictionary(data, 'SourceCharacter', 'MemberNumber');

        //console.log(activityGroup + ' ' + activityName + ' ' + activityAsset + ' on ' + targetChar + ' by ' + sourceChar);

        if (activityGroup == null || activityName == null) { return; }

        // activity on self
        if (targetChar == Player.MemberNumber) {
            xToysSendData('activityEvent', [
                ['assetGroupName', activityGroup],
                ['actionName', activityName],
                ['assetName', activityAsset]
            ]);
        }
        // activity on others by self
        else if (sourceChar == Player.MemberNumber) {
            xToysSendData('activityOnOtherEvent', [
                ['assetGroupName', activityGroup],
                ['actionName', activityName],
                ['assetName', activityAsset]
            ]);
        }
    }

    // Toys/items equipped or removed on player
    function handleItemEquip(data) {
        if (data.Type != 'Action' || searchMsgDictionary(data, 'DestinationCharacter', 'MemberNumber') != Player.MemberNumber) { return; }
        var itemSlotName = searchMsgDictionary(data, 'FocusAssetGroup', 'AssetGroupName');
        if (itemSlotName == null) { return; }

        // Toy equip
        if (data.Content == 'ActionUse') {
            //console.log('Added: ' + itemSlotName);
            var itemName = searchMsgDictionary(data, 'NextAsset', 'AssetName');
            if (itemName == null) { return; };

            xToysSendData('itemAdded', [
                ['assetName', itemName],
                ['assetGroupName', itemSlotName]
            ]);
            updateAllOngoingItemDetails(getPlayerAssetByName(itemName));
        }
        // Toy removal
        else if (data.Content == 'ActionRemove') {
            //console.log('Removed: ' + itemSlotName);
            var itemName = searchMsgDictionary(data, 'PrevAsset', 'AssetName');
            if (itemName == null) { return; };

            xToysSendData('itemRemoved', [
                ['assetName', itemName],
                ['assetGroupName', itemSlotName]
            ]);
            clearAllOngoingItemDetails(itemSlotName);
        }
        // Toy swaps
        else if (data.Content == 'ActionSwap') {
            //console.log('Swapped: ' + itemSlotName);
            var itemName = searchMsgDictionary(data, 'NextAsset', 'AssetName');
            var prevItemName = searchMsgDictionary(data, 'PrevAsset', 'AssetName');
            if (itemName == null || prevItemName == null) { return; };

            xToysSendData('itemSwapped', [
                ['assetName', itemName],
                ['prevAssetName', prevItemName],
                ['assetGroupName', itemSlotName]
            ]);
            updateAllOngoingItemDetails(getPlayerAssetByName(itemName));
        }
    }

    function sendItemInfoIfDifferent(slot, stateType, level, xToysDataTag) {
        //console.log('states have ' + slot + ' ' + stateType + ' ' + level + ': ' + BC_XToys_ToyStates.hasState(slot, stateType, level));
        if (BC_XToys_ToyStates.hasState(slot, stateType, level)) { return; }

        BC_XToys_ToyStates.setState(slot, stateType, level);

        xToysSendData(xToysDataTag, [
            ['assetGroupName', slot],
            ['level', level]
        ]);
    }

    function updateItemIntensity(appearanceItem) {
        var intensity = appearanceItem?.Property?.Intensity;
        var activityGroup = appearanceItem?.Asset?.DynamicGroupName;

        if (intensity == null || activityGroup == null) { return; }

        intensity++;

        sendItemInfoIfDifferent(activityGroup, 'Vibration', intensity, 'toyEvent');
    }

    function updateItemInflation(appearanceItem) {
        var inflationLevel = appearanceItem?.Property?.InflateLevel;
        var activityGroup = appearanceItem?.Asset?.DynamicGroupName;

        if (inflationLevel == null || activityGroup == null) { return; }

        sendItemInfoIfDifferent(activityGroup, 'Inflation', inflationLevel, 'inflationEvent');
    }

    function updateAllOngoingItemDetails(appearanceItem) {
        updateItemIntensity(appearanceItem);
        updateItemInflation(appearanceItem);
    }

    function clearAllOngoingItemDetails(slot) {
        if (BC_XToys_ToyStates.getState(slot, 'Vibration') != null) {
            sendItemInfoIfDifferent(slot, 'Vibration', 0, 'toyEvent');
        }
        if (BC_XToys_ToyStates.getState(slot, 'Inflation') != null) {
            sendItemInfoIfDifferent(slot, 'Inflation', 0, 'inflationEvent');
        }
        BC_XToys_ToyStates.clearSlot(slot);
    }

    // Toys affecting player
    function handleToyEvents(data) {
        if (data.Type != 'Action' || searchMsgDictionary(data, 'DestinationCharacterName', 'MemberNumber') != Player.MemberNumber) {
            return;
        }

        var assetName = searchMsgDictionary(data, 'AssetName', 'AssetName');
        var currentAsset = getPlayerAssetByName(assetName);
        var activityGroup = currentAsset?.Asset?.Group?.Name;

        if (activityGroup == null || currentAsset == null || assetName == null) { return; }

        updateAllOngoingItemDetails(currentAsset);

        var shockLevel = getShockLevelFromMsg(data);
        if (shockLevel >= 0) {
            xToysSendData('shockEvent', [
                ['assetGroupName', activityGroup],
                ['level', shockLevel]
            ]);
        }
    }

    // Sends help message on first join to a chat room
    function sendFirstChatroomMsg(data) {
        if (BC_XToysSendJoinMsg == false
            || data.Content != 'ServerEnter'
            || searchMsgDictionary(data, 'SourceCharacter', 'MemberNumber') != Player.MemberNumber
        ) {
            return;
        }

        ChatRoomSendLocal(BC_XToysFirstJoinMsg, 60000);

        BC_XToysSendJoinMsg = false;
    }


    

    // Chatroom command injection 

    let FullWssURLRegex = /wss:\/\/([0-9A-Za-z]+(\.[0-9A-Za-z]+)+)\/[0-9A-Za-z]+/i;
    let FullWsURLRegex = /ws:\/\/([0-9A-Za-z]+(\.[0-9A-Za-z]+)+)\/[0-9A-Za-z]+/i;
    let CharactersRegex = /^[0-9A-Za-z]*$/i;

    const BC_XToys_Command = {
        Tag: "bcxtoys",
        Description: "Shows all info about " + BC_XToys_FullName,
        Action: (_, command, args) => {
            const FullHelpMsg = '<b>' + BC_XToys_FullName + '</b> v' + BC_XToys_Version + '\n'
                + 'Github: <a href="https://github.com/ItsNorin/Bondage-Club-XToys-Integration" target="_blank" rel="noopener noreferrer">github.com/ItsNorin/Bondage-Club-XToys-Integration</a>\n\n'

                + '<b>Commands</b>\n'

                + '<b>/bcxtoys list</b>\n'
                + 'Shows all websocket connections. Can also use "connections", "sockets" \n'

                + '<b>/bcxtoys connect [webhook]</b>\n'
                + 'Connect to the given private XToys webhook. Available under your User Info, under Private Webhook. Will also connect to any valid websocket URL. Can use "c" instead of "connect"\n'

                + '<b>/bcxtoys disconnect [webhook]</b>\n'
                + 'Disconnect all connections. If webhook is given, will just disconnect from that. Can use "d" instead of "disconnect"\n'

                + '<b>/bcxtoys pause</b>\n'
                + 'Pauses sending messages to connected sockets until /bcxtoys resume is used. Can use "p" instead\n'

                + '<b>/bcxtoys resume</b>\n'
                + 'Resumes sending messages to connected sockets if /bcxtoys pause was used. Can use "r" instead\n';

            if (args.length == 0) {
                ChatRoomSendLocal(FullHelpMsg);
            }
            else if (args.length > 0) {
                var cmdName = args[0];

                switch (cmdName) {
                    case 'help':
                        ChatRoomSendLocal(FullHelpMsg);
                        break;
                    
                    case 'list':
                    case 'connections':
                    case 'sockets':
                        var msg = 'Connections: '
                        if (BC_XToys_Websockets.hasAnyConnection() == false) {
                            msg += 'None';
                        }
                        else {
                            var cs = BC_XToys_Websockets.getConnections();
                            for (let c of cs) {
                                msg += '\n' + c;
                            }
                        }
                        ChatRoomSendLocal(msg, 60000);
                        break;

                    case 'c':
                    case 'connect':
                        if (args.length < 2) {
                            ChatRoomSendLocal('Couldn\'t connect. Enter a websocket', 60000);
                            return;
                        }

                        // args always lowercase
                        var u = command.substring((cmdName == 'c') ? 11 : 17);

                        if (FullWssURLRegex.test(u) || FullWsURLRegex.test(u)) {
                            BC_XToys_Websockets.connect(u);
                        }
                        else if (CharactersRegex.test(u)) {
                            BC_XToys_Websockets.connect('wss://webhook.xtoys.app/' + u);
                        }
                        break;
                    
                    case 'd':
                    case 'disconnect':
                        if (args.length < 2) {
                            BC_XToys_Websockets.closeAll();
                            return;
                        }

                        var u = command.substring((cmdName == 'd') ? 11 : 20);

                        if (FullWssURLRegex.test(u) || FullWsURLRegex.test(u)) {
                            BC_XToys_Websockets.close(u);
                        }
                        else if (CharactersRegex.test(u)) {
                            BC_XToys_Websockets.close('wss://webhook.xtoys.app/' + u);
                        }
                        break;

                    case 'p':
                    case 'pause':
                        BC_XToys_Websockets.sendMessages = false;
                        ChatRoomSendLocal('Paused sending messages to websockets. Use <b>/bcxtoys resume</b> to continue');
                        break;

                    case 'r':
                    case 'resume':
                        BC_XToys_Websockets.sendMessages = true;
                        ChatRoomSendLocal('Resumed sending messages to websockets. Use <b>/bcxtoys pause</b> to pause');
                        break;

                    default:
                        break;
                }
            }

        }
    };


    if (Commands.some((a) => a.Tag === BC_XToys_Command.Tag)) {
        console.log('Unable to register /bcxtoys ');
    }
    else {
        Commands.push(BC_XToys_Command);
    }

    // On every chat room message, check what should be sent
    ServerSocket.on("ChatRoomMessage", async (data) => {
        if (data == null
            || data.Content == null
            || BC_XToysIgnoreMsgContents.has(data.Content)
            || data.Type == null
            || BC_XToysIgnoreMsgTypes.has(data.Type)
        ) {
            return;
        }

        sendFirstChatroomMsg(data);

        //console.log(data);

        handleActivities(data);
        handleItemEquip(data);
        handleToyEvents(data);
    });



    async function waitFor(func, cancelFunc = () => false) {
        while (!func()) {
            if (cancelFunc()) return false;
            await sleep(10);
        }
        return true;
    }

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // searches a message for the given key, returns its value
    function searchMsgDictionary(msg, tag, subKey = null) {
        //var attempt1 =  msg.Dictionary.find((d) => d.Tag == key);
        if (msg == null || !Array.isArray(msg.Dictionary)) {
            return null;
        }

        for (var i = 0; i < msg.Dictionary.length; i++) {
            var dictKeys = Object.keys(msg.Dictionary[i]);
            var dictValues = Object.values(msg.Dictionary[i]);

            // new style
            // {FocusGroupName: 'ItemArms'}
            if (dictKeys[0] == tag) {
                return dictValues[0];
            }

            // old style
            // {Tag: 'ActivityAsset', AssetName: 'Feather', GroupName: 'ItemHandheld'}
            // {Tag: 'SourceCharacter', Text: '', MemberNumber: }
            var subKeyIndex = dictKeys.indexOf(subKey);
            if (dictKeys[0] == 'Tag' && dictValues[0] == tag && subKeyIndex >= 0) {
                return dictValues[subKeyIndex];
            }
        }
        return null;
    }

    function getPlayerAssetByName(assetName) {
        return Player.Appearance.find((d) => d.Asset.Name == assetName);
    }

    function getPlayerAssetBySlot(slotName) {
        return Player.Appearance.find((d) => d.Asset.DynamicGroupName == slotName);
    }

    // remnants of annoying stuff lol
    function getShockLevelFromMsg(msgData) {
        var level = -1;
        switch (msgData.Content) {
            case 'TriggerShock0':
                level = 0; break;
            case 'TriggerShock1':
                level = 1; break;
            case 'TriggerShock2':
                level = 2; break;
        }
        return level;
    }
})();

