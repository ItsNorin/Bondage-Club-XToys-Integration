// ==UserScript==
// @name         Bondage Club XToys Integration
// @namespace    BC-XToys
// @version      0.5.9
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

const BC_XToys_Version = "0.5.9";
const BC_XToys_FullName = "Bondage Club XToys Integration";
const BC_XToys_ShortName = "BC-XToys";

// Chat message contents to always ignore
const BC_XToysIgnoreMsgContents = new Set(['BCXMsg', 'BCEMsg', 'Preference', 'Wardrobe', 'SlowLeaveAttempt', 'ServerUpdateRoom', 'bctMsg']);
const BC_XToysIgnoreMsgTypes = new Set(['Status', 'Hidden']);

var BC_XToysSendJoinMsg = true;
const BC_XToysFirstJoinMsg = BC_XToys_FullName + ' v' + BC_XToys_Version + ' loaded. Use <b>/bcxtoys</b> for help.';


var BC_XToys_defaultPunishShockLevel = 1;
var BC_XToys_minTimeBetweenShocks = 500;

// Websocket manager to handle connections and sending messages
const BC_XToys_Websockets = {
    sockets: new Map(),

    // if false, will not send anything
    sendMessages: true,

    // whether to attempt to reconnect when a socket comes offline
    autoReconnectMap: new Map(),

    getSavedSockets() {
        var urls = JSON.parse(localStorage.getItem(BC_XToys_ShortName + " Websockets"));
        return Array.isArray(urls) ? urls : [];
    },
    saveSockets() {
        var urls = JSON.stringify(Array.from(this.sockets.keys()));
        if (urls != localStorage.getItem(BC_XToys_ShortName + " Websockets")) {
            console.log(BC_XToys_ShortName + ": Saving urls to local storage: " + urls);
            localStorage.setItem(BC_XToys_ShortName + " Websockets", urls);
        }
    },

    // whether to try to connect to locally saved websockets on startup
    setAutoConnectState(e) {
        if (e === true || e === false) {
            localStorage.setItem(BC_XToys_ShortName + " AutoConnect", JSON.stringify(e));
        }
    },
    getAutoConnectState() {
        var s = JSON.parse(localStorage.getItem(BC_XToys_ShortName + " AutoConnect"));
        return (s === true) ? true : false;
    },

    // whether to attempt to reconnect when a socket comes offline
    setAutoReconnectState(e) {
        if (e === true || e === false) {
            localStorage.setItem(BC_XToys_ShortName + " AutoReconnect", JSON.stringify(e));
        }
    },
    getAutoReconnectState() {
        var s = JSON.parse(localStorage.getItem(BC_XToys_ShortName + " AutoReconnect"));
        return (s === true) ? true : false;
    },

    // creates a websocket connection to given URL
    connect(url) {
        if (url == null) { return; }

        if (this.hasConnection(url)) {
            var m = 'Already connected to ' + url;
            ChatRoomSendLocal(m, 60000);
            console.log(BC_XToys_ShortName + ": " + m);
            return;
        }

        var newSocket = new WebSocket(url);
        this.sockets.set(url, newSocket);

        newSocket.onopen = function (e) {
            var m = 'Connected to ' + newSocket.url;
            ChatRoomSendLocal(m, 60000);
            console.log(BC_XToys_ShortName + ": " + m);

            if (BC_XToys_Websockets.getAutoConnectState() == true) {
                BC_XToys_Websockets.saveSockets();
            }

            if (BC_XToys_Websockets.getAutoReconnectState() == true) {
                BC_XToys_Websockets.autoReconnectMap.set(url, 3);
            }
        };
        newSocket.onmessage = e => {
            console.log(e.data);
        };
        newSocket.onclose = function (event) {
            var m = 'Disconnected from ' + url;
            ChatRoomSendLocal(m, 60000);
            console.log(BC_XToys_ShortName + ": " + m);
            BC_XToys_Websockets.close(url);

            // attempt reconnections if desired
            if (BC_XToys_Websockets.getAutoReconnectState() == true) {
                var attempts = BC_XToys_Websockets.autoReconnectMap.get(url);
                if (attempts > 0) {
                    setTimeout(function () {
                        BC_XToys_Websockets.autoReconnectMap.set(url, attempts - 1);
                        BC_XToys_Websockets.connect(url);
                    }, 100);
                } else {
                    BC_XToys_Websockets.autoReconnectMap.delete(url);
                }
            }
        };
    },

    connectToSavedSocketsIfAllowed() {
        if (this.getAutoConnectState() != true) { return; }
        console.log(BC_XToys_ShortName + ": Connecting to urls from local storage: ");

        for (let u of this.getSavedSockets()) {
            this.connect(u);
        }
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
        console.log(BC_XToys_ShortName + ": " + logMsg);
    },

    // sends formatted arguements to all connected websockets
    // actionName - string
    // args - array of [string, any type]
    // if arg data is null, will send "none"
    sendFormattedArgs(actionName, args = null) {
        if (!this.hasAnyConnection()) {
            console.log('BC-XToys: Failed to send message, not connected.');
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

        this.send(toSend);
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
        this.autoReconnectMap.delete(url);

        var s = this.sockets.get(url);
        if (s == null) { return; }
        if (s.readyState <= 1) {
            s.close(1000);
        }
        this.sockets.delete(url);

        this.saveSockets();
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

// Ongoing slot state handler, use this to avoid sending duplicate messages for restraint and toy related events
const Item_State_Handler = (function () {
    // states is a map of slot names, each containing:
    // - the current a worn item name
    // - a map of stateTypes with a level
    const _states = new Map();

    // creates map entry for given slot name if needed
    function _initSlot(slotName) {
        if (_states.get(slotName) == null) {
            _states.set(slotName, { itemName: null, effects: new Map() });
        }
    }

    function _deleteSlot(slotName) {
        var t = _states.get(slotName);
        if (t == null) { return; }

        for (let k of t.effects.keys()) {
            t.effects.delete(k);
        }
        _states.delete(slotName);
    }


    // prevents duplicate shock events
    // [ [time, slot, level, assetName], [...], ... ]
    // oldest events are first in history
    var _shockHistory = new Array();

    const _shockLevelNameMap = ['ShockLow', 'ShockMed', 'ShockHigh'];

    function _addShockToHistory(slot, level, assetName) {
        _shockHistory.push([new Date().getTime(), slot, level, assetName]);
    }

    function _clearOldShocks() {
        var _r = true;
        while (_r == true && _shockHistory.length > 0) {
            //console.log(new Date().getTime() - _shockHistory[0][0]);
            if (new Date().getTime() - _shockHistory[0][0] > BC_XToys_minTimeBetweenShocks) {
                var old = _shockHistory.shift();
                //console.log("Expired: " + old);
            } else {
                _r = false;
            }
        }
    }

    // true if shock with given slot and level is in history
    function _hasShockInHistory(slot, level) {
        for (let i in _shockHistory) {
            if (_shockHistory[i][1] == slot && _shockHistory[i][2] == level) {
                return true;
            }
        }
        return false;
    }

    return { // public interface
        log() {
            console.log(_states);
        },

        logShockHistory() {
            console.log(_shockHistory);
        },

        // sets state for given slot, needs slot's item name, and an effect and its level
        setState: function (slotName, itemName, effectType, level = 0) {
            _initSlot(slotName);
            var s = _states.get(slotName);
            s.itemName = itemName;
            s.effects.set(effectType, level);
        },

        // returns all saved states for slot
        getState: function (slotName) {
            return _states.get(slotName);
        },

        // sets an effect for given slot and effect type, can have multiple effects with seprate levels
        setEffect: function (slotName, effectType, level) {
            _initSlot(slotName);
            s.effects.set(effectType, level);
        },

        // returns level for given stateType of slot, ex: 'Vibration', 'Inflation'
        getEffect: function (slotName, stateType) {
            var s = this.getState(slotName);
            return (s == null) ? null : s.effects.get(stateType);
        },

        // returns item name for given slot
        getItemName: function (slotName) {
            var s = this.getState(slotName);
            return (s == null) ? null : s.itemName;
        },

        // true if level of stateType for given slot already exists
        hasEffectInSlot: function (slotName, stateType, level) {
            var l = this.getEffect(slotName, stateType);
            return (l == null) ? false : l == level;
        },

        // deletes all information for given slot
        clearSlot: function (slotName) {
            _deleteSlot(slotName);
        },

        updateItemProperties: function (effect, xToysDataTag, slot, itemName, level, levelOffset = 0) {
            //console.log("effect:" + effect + "  xToysDataTag:" + xToysDataTag + "  slot:" + slot + "  itemName:" + itemName + "  level:" + level);
            if (slot == undefined || level == undefined || itemName == undefined) { return; }

            level += levelOffset;

            if (this.hasEffectInSlot(slot, effect, level)) { return; }

            this.setState(slot, itemName, effect, level);

            BC_XToys_Websockets.sendFormattedArgs(xToysDataTag, [
                ['assetGroupName', slot],
                ['level', level],
                ['itemName', itemName]
            ]);
        },

        updateAllOngoingItemDetails: function (appearanceItem) {
            this.updateItemProperties(
                'Vibration', 'toyEvent',
                appearanceItem?.Asset?.DynamicGroupName,
                appearanceItem?.Asset?.Name,
                appearanceItem?.Property?.Intensity,
                1
            );
            this.updateItemProperties(
                'Inflation', 'inflationEvent',
                appearanceItem?.Asset?.DynamicGroupName,
                appearanceItem?.Asset?.Name,
                appearanceItem?.Property?.InflateLevel
            )
        },

        clearAllOngoingSlotDetails: function (slot) {
            if (this.getState(slot, 'Vibration') != null) {
                this.updateItemProperties('Vibration', 'toyEvent', slot, this.getItemName(slot), 0);
            }
            if (this.getState(slot, 'Inflation') != null) {
                this.updateItemProperties('Inflation', 'inflationEvent', slot, this.getItemName(slot), 0);
            }
            this.clearSlot(slot);
        },

        // sends shock only if one hasn't been sent for that slot very recently
        sendShockEvent(slot, level, assetName = null) {
            if (level >= 0 && level <= 2 && slot != null) {
                _clearOldShocks();

                if (!_hasShockInHistory(slot, level)) {
                    BC_XToys_Websockets.sendFormattedArgs('activityEvent', [
                        ['assetGroupName', slot],
                        ['actionName', _shockLevelNameMap[level]],
                        ['assetName', assetName]
                    ]);

                    _addShockToHistory(slot, level, assetName);
                }
            }
        }
    };
})();


(async function () {
    console.log(BC_XToys_ShortName + ' waiting for bcModSdk. If it never loads, please use FUSAM: https://sidiousious.gitlab.io/bc-addon-loader/');

    while (!window.hasOwnProperty('bcModSdk')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await waitFor(() => ServerIsConnected && ServerSocket);
    await waitFor(() => !!Commands);

    const modApi = bcModSdk.registerMod({
        name: "Bondage Club XToys Integration",
        fullName: BC_XToys_ShortName,
        version: BC_XToys_Version,
        repository: "https://github.com/ItsNorin/Bondage-Club-XToys-Integration",
    });

    // connecting to websockets every time server gains connection
    modApi.hookFunction(
        'ServerSetConnected',
        2,
        (args, next) => {
            //console.log("ServerSetConnected");
            next(args);
            if (args[0] == true) {
                BC_XToys_Websockets.connectToSavedSocketsIfAllowed();
            }
        }
    );

    console.log("Loading " + BC_XToys_FullName + " version " + BC_XToys_Version + " with bcModSdk v" + bcModSdk.version);





    // Activities involving player
    function handleActivities(data) {
        if (data.Type != 'Activity') { return; }

        var activityGroup = searchMsgDictionary(data, 'FocusAssetGroup', 'FocusGroupName');
        var activityName = searchMsgDictionary(data, 'ActivityName');
        var activityAsset = searchMsgDictionary(data, 'ActivityAsset', 'AssetName');
        var targetChar = searchMsgDictionary(data, 'TargetCharacter', 'MemberNumber');
        var sourceChar = searchMsgDictionary(data, 'SourceCharacter', 'MemberNumber');

        //console.log(activityGroup + ' ' + activityName + ' ' + activityAsset + ' on ' + targetChar + ' by ' + sourceChar);

        if (activityGroup == null || activityName == null) { return; }

        // activity on self
        if (targetChar == Player.MemberNumber) {
            BC_XToys_Websockets.sendFormattedArgs('activityEvent', [
                ['assetGroupName', activityGroup],
                ['actionName', activityName],
                ['assetName', activityAsset]
            ]);
        }
        // activity on others by self
        else if (sourceChar == Player.MemberNumber) {
            BC_XToys_Websockets.sendFormattedArgs('activityOnOtherEvent', [
                ['assetGroupName', activityGroup],
                ['actionName', activityName],
                ['assetName', activityAsset]
            ]);
        }
    }

    // for portal link panties tablet activities
    function handlePortalLink(data) {
        if (data.Type != 'Action') { return; }

        var activityGroup = searchMsgDictionary(data, 'FocusAssetGroup', 'FocusGroupName');
        var activityAsset = searchMsgDictionary(data, 'AssetName', 'AssetName');
        var targetChar = searchMsgDictionary(data, 'TargetCharacter');
        var sourceChar = searchMsgDictionary(data, 'SourceCharacter');

        // lazy, it works shush
        var activityName = null;
        switch (data.Content) {
            case 'PortalLinkFunctionActivityCaress': activityName = 'Caress'; break;
            case 'PortalLinkFunctionActivityKiss': activityName = 'Kiss'; break;
            case 'PortalLinkFunctionActivityMasturbateHand': activityName = 'MasturbateHand'; break;
            case 'PortalLinkFunctionActivitySlap': activityName = 'Slap'; break;
            case 'PortalLinkFunctionActivityMasturbateTongue': activityName = 'MasturbateTongue'; break;
        }

        //console.log(activityGroup + ' ' + activityName + ' ' + activityAsset + ' on ' + targetChar + ' by ' + sourceChar);

        if (activityGroup == null || activityName == null || activityAsset != 'PortalPanties') { return; };

        // activity on self
        if (targetChar == Player.MemberNumber) {
            BC_XToys_Websockets.sendFormattedArgs('activityEvent', [
                ['assetGroupName', activityGroup],
                ['actionName', activityName],
                ['assetName', activityAsset]
            ]);
        }
        // activity on others by self
        else if (sourceChar == Player.MemberNumber) {
            BC_XToys_Websockets.sendFormattedArgs('activityOnOtherEvent', [
                ['assetGroupName', activityGroup],
                ['actionName', activityName],
                ['assetName', activityAsset]
            ]);
        }
    }

    // for items that don't have states, only readable value is data.Content 
    function handleCustomItemTextAsVibe(
        slotName, itemName, Content,
        itemNameRegex,
        offRegex, lowRegex, medRegex, highRegex, maxRegex
    ) {
        if (!itemNameRegex.test(Content)) { return; }

        var intensity = -1;

        if (offRegex.test(Content)) {
            intensity = 0;
        } else if (lowRegex.test(Content)) {
            intensity = 1;
        } else if (medRegex.test(Content)) {
            intensity = 2;
        } else if (highRegex.test(Content)) {
            intensity = 3;
        } else if (maxRegex.test(Content)) {
            intensity = 4;
        }

        if (intensity == -1) { return; }

        Item_State_Handler.updateItemProperties('Vibration', 'toyEvent', slotName, itemName, intensity);
    }

    function handleCustomTextItems(data) {
        if (data.Type != 'Action'
            || !(searchMsgDictionary(data, 'DestinationCharacter', 'MemberNumber') == Player.MemberNumber)
        ) { return; }

        handleCustomItemTextAsVibe(
            'ItemNipples', 'LactationPump', data.Content,
            /LactationPumpPower/i,
            /ToOff/i, /LowSuction/i, /MediumSuction/i, /HighSuction/i, /MaximumSuction/i
        );
        handleCustomItemTextAsVibe(
            'ItemNipples', 'NippleSuctionCups', data.Content,
            /NipSuc/i,
            /ToLoose/i, /ToLight/i, /ToMedium/i, /ToHeavy/i, /ToMaximum/i
        );
        handleCustomItemTextAsVibe(
            'ItemNipples', 'PlateClamps', data.Content,
            /ItemNipplesPlate/i,
            /ClampsLoose/i, /ClampsLoose/i, /ClampsLoose/i, /ClampsLoose/i, /ClampsTight/i
        );
        handleCustomItemTextAsVibe(
            'ItemButt', 'ButtPump', data.Content,
            /BPumps/i,
            /ToEmpty/i, /ToLight/i, /ToInflated/i, /ToBloated/i, /ToMaximum/i
        );


    }

    function equipToy(itemName, itemSlotName) {
        BC_XToys_Websockets.sendFormattedArgs('itemAdded', [
            ['assetName', itemName],
            ['assetGroupName', itemSlotName]
        ]);
        Item_State_Handler.updateAllOngoingItemDetails(getPlayerAssetByName(itemName));
    }
    function removeToy(itemName, itemSlotName) {
        BC_XToys_Websockets.sendFormattedArgs('itemRemoved', [
            ['assetName', itemName],
            ['assetGroupName', itemSlotName]
        ]);
        Item_State_Handler.clearAllOngoingSlotDetails(itemSlotName);
    }
    function swapToys(itemName, prevItemName, itemSlotName) {
        BC_XToys_Websockets.sendFormattedArgs('itemSwapped', [
            ['assetName', itemName],
            ['prevAssetName', prevItemName],
            ['assetGroupName', itemSlotName]
        ]);
        Item_State_Handler.updateAllOngoingItemDetails(getPlayerAssetByName(itemName));
    }

    // Toys/items equipped or removed on player. Will ignore if done by player themselves, that is caught by function hooks
    function handleItemEquip(data) {
        if (data.Type != 'Action'
            || searchMsgDictionary(data, 'DestinationCharacter', 'MemberNumber') != Player.MemberNumber
            || searchMsgDictionary(data, 'SourceCharacter', 'MemberNumber') == Player.MemberNumber
        ) {
            return;
        }
        var itemSlotName = searchMsgDictionary(data, 'FocusAssetGroup', 'FocusGroupName');
        if (itemSlotName == null) { return; }

        // Toy equip
        if (data.Content == 'ActionUse') {
            //console.log('Added: ' + itemSlotName);
            var itemName = searchMsgDictionary(data, 'NextAsset', 'AssetName');
            if (itemName == null) { return; };

            equipToy(itemName, itemSlotName);
        }
        // Toy removal
        else if (data.Content == 'ActionRemove') {
            //console.log('Removed: ' + itemSlotName);
            var itemName = searchMsgDictionary(data, 'PrevAsset', 'AssetName');
            if (itemName == null) { return; };
            removeToy(itemName, itemSlotName);
        }
        // Toy swaps
        else if (data.Content == 'ActionSwap') {
            //console.log('Swapped: ' + itemSlotName);
            var itemName = searchMsgDictionary(data, 'NextAsset', 'AssetName');
            var prevItemName = searchMsgDictionary(data, 'PrevAsset', 'AssetName');
            if (itemName == null || prevItemName == null) { return; };

            removeToy(prevItemName, itemSlotName);
            equipToy(itemName, itemSlotName);
        }
    }

    // Toys affecting player
    function handleToyEvents(data) {
        if (data.Type != 'Action'
            || !(
                searchMsgDictionary(data, 'DestinationCharacter', 'MemberNumber') == Player.MemberNumber
                || searchMsgDictionary(data, 'DestinationCharacterName', 'MemberNumber') == Player.MemberNumber
                || searchMsgDictionary(data, 'TargetCharacterName', 'MemberNumber') == Player.MemberNumber
            )
        ) {
            return;
        }

        var assetName = searchMsgDictionary(data, 'AssetName', 'AssetName');
        var currentAsset = getPlayerAssetByName(assetName);
        var activityGroup = currentAsset?.Asset?.Group?.Name;

        if (activityGroup == null || currentAsset == null || assetName == null) { return; }

        Item_State_Handler.updateAllOngoingItemDetails(currentAsset);
        Item_State_Handler.sendShockEvent(activityGroup, getShockLevelFromMsg(data), assetName);
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
    let FullWsURLRegex = /ws:\/\/([0-9A-Za-z.:]+)/i;
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
                + 'Resumes sending messages to connected sockets if /bcxtoys pause was used. Can use "r" instead\n'

                + '<b>/bcxtoys auto_connect</b>\n'
                + 'On startup, will attempt to connect to any websocket connected to after being turned on. Currently <b>'
                + (BC_XToys_Websockets.getAutoConnectState() == true ? 'enabled' : 'disabled')
                + '</b>\n'

                + '<b>/bcxtoys auto_reconnect</b>\n'
                + 'Will attempt to reconnect 3 times any time a websocket disconnects unintentionally. Currently <b>'
                + (BC_XToys_Websockets.getAutoReconnectState() == true ? 'enabled' : 'disabled')
                + '</b>\n'

                + '<b>/bcxtoys punish_shock_level [0-2]</b>\n'
                + 'Sets intensity of shock to send for items that do not have explicit shock intensities, 0 being weakest, 2 strongest\n'
                ;

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

                    case 'auto_connect':
                        BC_XToys_Websockets.setAutoConnectState(!BC_XToys_Websockets.getAutoConnectState())
                        ChatRoomSendLocal('Auto connect is now <b>'
                            + (BC_XToys_Websockets.getAutoConnectState() == true ? 'enabled' : 'disabled')
                            + '</b>')
                        break;

                    case 'auto_reconnect':
                        BC_XToys_Websockets.setAutoReconnectState(!BC_XToys_Websockets.getAutoReconnectState());
                        ChatRoomSendLocal('Auto reconnect is now <b>'
                            + (BC_XToys_Websockets.getAutoReconnectState() == true ? 'enabled' : 'disabled')
                            + '</b>')
                        break;

                    case 'punish_shock_level':
                        if (args.length < 2 || args[1] < 0 || args[1] > 2) {
                            ChatRoomSendLocal('Enter a valid level, [0-2]', 30000);
                            return;
                        }
                        ChatRoomSendLocal('Set default shock intensity to ' + args[1] + ".", 30000);
                        BC_XToys_defaultPunishShockLevel = args[1];
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

        handlePortalLink(data);
        handleActivities(data);
        handleItemEquip(data);
        handleToyEvents(data);
        handleCustomTextItems(data);
    });

    /*
    modApi.hookFunction(
        'ChatRoomMessage',
        1,
        (args, next) => {
            next(args);
            console.log('ChatRoomMessage');
            console.log(args);
        }
    ); */
    // handle toys not properly described in chat

    // future belt
    modApi.hookFunction(
        'InventoryItemPelvisFuturisticTrainingBeltUpdateVibeMode',
        4,
        (args, next) => {
            //console.log(args);
            next(args);
            if (
                Array.isArray(args) && args.length == 4
                && args[3]?.Asset?.Name == 'FuturisticTrainingBelt'
                && args[3]?.Property?.Intensity != null
            ) {
                Item_State_Handler.updateItemProperties('Vibration', 'toyEvent', 'ItemPelvis', 'FuturisticTrainingBelt', args[3]?.Property?.Intensity, 1);
            }
        }
    );

    modApi.hookFunction(
        'AssetsItemPelvisFuturisticChastityBeltScriptTrigger',
        3,
        (args, next) => {
            next(args);
            if (
                Array.isArray(args) && args.length >= 3
                && typeof args[2] == 'string'
                && ['Struggle', 'StruggleOther', 'Orgasm', 'Standup', 'Speech', 'RequiredSpeech', 'ProhibitedSpeech'].includes(args[2])
            ) {
                Item_State_Handler.sendShockEvent('ItemPelvis', BC_XToys_defaultPunishShockLevel, 'FuturisticTrainingBelt')
            };
        }
    );

    /////////////////////////////
    // outside chat room hooks //
    /////////////////////////////

    // Shocks
    modApi.hookFunction(
        'PropertyShockPublishAction',
        3,
        (args, next) => {
            var shockItem = null;
            if (Array.isArray(args) && args[1]?.Property != null) {
                shockItem = args[1];
            } else if (DialogFocusItem?.Property != null) {
                shockItem = DialogFocusItem;
            }

            //console.log("PropertyShockPublishAction");
            //console.log(shockItem);

            if (shockItem != null) {
                var shockLevel = shockItem?.Property?.ShockLevel;
                if (shockLevel == null) {
                    shockLevel = BC_XToys_defaultPunishShockLevel;
                }
                Item_State_Handler.sendShockEvent(shockItem?.Asset?.DynamicGroupName, shockLevel, shockItem?.Asset?.Name);
            }

            next(args);
        }
    );

    // Manually clicking own worn item state
    modApi.hookFunction(
        'ExtendedItemSetOption',
        7,
        (args, next) => {
            next(args);
            //console.log("ExtendedItemSetOption");
            //console.log(args);

            // vibrate or inflation event
            if (args.length >= 6 && args[1]?.MemberNumber == Player.MemberNumber) {
                const item = args[2];
                var slotName = item?.Asset?.DynamicGroupName;
                if (slotName == null) { return; }

                Item_State_Handler.updateAllOngoingItemDetails(item);
            }
        }
    );

    // item removal
    modApi.hookFunction(
        'InventoryRemove',
        3,
        (args, next) => {
            if (args[0]?.MemberNumber == Player.MemberNumber) {
                const itemA = getPlayerAssetBySlot(args[1]);
                var name = itemA?.Asset?.Name;
                var slot = itemA?.Asset?.DynamicGroupName;
                if (name != undefined || slot != undefined) {
                    removeToy(name, slot);
                }
            }
            next(args);
        }
    );

    // item equip
    modApi.hookFunction(
        'InventoryWear',
        8,
        (args, next) => {
            next(args);
            if (args[0]?.MemberNumber == Player.MemberNumber) {
                const itemA = getPlayerAssetByName(args[1]);
                var name = itemA?.Asset?.Name;
                var slot = itemA?.Asset?.DynamicGroupName;
                if (name != undefined || slot != undefined) {
                    equipToy(name, slot);
                }
            }
        }
    );

    // Toy self updates for advanced modes
    modApi.hookFunction(
        'VibratorModePublish',
        3,
        (args, next) => {
            next(args);

            //console.log("VibratorModePublish");
            //console.log(args);

            if (args[1]?.MemberNumber == Player.MemberNumber) {
                var slotName = args[2]?.Asset?.DynamicGroupName;
                if (slotName == null) { return; }

                var currentAsset = getPlayerAssetBySlot(slotName);
                if (currentAsset == null) { return; }

                Item_State_Handler.updateAllOngoingItemDetails(currentAsset);
            }
        }
    );
})();

//
// MISC Helper Functions
//

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