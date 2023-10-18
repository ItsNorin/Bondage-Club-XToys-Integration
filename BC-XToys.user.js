// ==UserScript==
// @name         Bondage Club XToys Integration
// @namespace    BC-XToys
// @version      0.5.8
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

const BC_XToys_Version = "0.5.8";
const BC_XToys_FullName = "Bondage Club XToys Integration";

// Chat message contents to always ignore
const BC_XToysIgnoreMsgContents = new Set(['BCXMsg', 'BCEMsg', 'Preference', 'Wardrobe', 'SlowLeaveAttempt', 'ServerUpdateRoom', 'bctMsg']);
const BC_XToysIgnoreMsgTypes = new Set(['Status', 'Hidden']);

var BC_XToysSendJoinMsg = true;
const BC_XToysFirstJoinMsg = BC_XToys_FullName + ' v' + BC_XToys_Version + ' loaded. Use <b>/bcxtoys</b> for help.';

var bcModSdk = function () { "use strict"; const e = "1.1.0"; function o(e) { alert("Mod ERROR:\n" + e); const o = new Error(e); throw console.error(o), o } const t = new TextEncoder; function n(e) { return !!e && "object" == typeof e && !Array.isArray(e) } function r(e) { const o = new Set; return e.filter((e => !o.has(e) && o.add(e))) } const i = new Map, a = new Set; function d(e) { a.has(e) || (a.add(e), console.warn(e)) } function s(e) { const o = [], t = new Map, n = new Set; for (const r of p.values()) { const i = r.patching.get(e.name); if (i) { o.push(...i.hooks); for (const [o, a] of i.patches.entries()) t.has(o) && t.get(o) !== a && d(`ModSDK: Mod '${r.name}' is patching function ${e.name} with same pattern that is already applied by different mod, but with different pattern:\nPattern:\n${o}\nPatch1:\n${t.get(o) || ""}\nPatch2:\n${a}`), t.set(o, a), n.add(r.name) } } o.sort(((e, o) => o.priority - e.priority)); const r = function (e, o) { if (0 === o.size) return e; let t = e.toString().replaceAll("\r\n", "\n"); for (const [n, r] of o.entries()) t.includes(n) || d(`ModSDK: Patching ${e.name}: Patch ${n} not applied`), t = t.replaceAll(n, r); return (0, eval)(`(${t})`) }(e.original, t); let i = function (o) { var t, i; const a = null === (i = (t = m.errorReporterHooks).hookChainExit) || void 0 === i ? void 0 : i.call(t, e.name, n), d = r.apply(this, o); return null == a || a(), d }; for (let t = o.length - 1; t >= 0; t--) { const n = o[t], r = i; i = function (o) { var t, i; const a = null === (i = (t = m.errorReporterHooks).hookEnter) || void 0 === i ? void 0 : i.call(t, e.name, n.mod), d = n.hook.apply(this, [o, e => { if (1 !== arguments.length || !Array.isArray(o)) throw new Error(`Mod ${n.mod} failed to call next hook: Expected args to be array, got ${typeof e}`); return r.call(this, e) }]); return null == a || a(), d } } return { hooks: o, patches: t, patchesSources: n, enter: i, final: r } } function c(e, o = !1) { let r = i.get(e); if (r) o && (r.precomputed = s(r)); else { let o = window; const a = e.split("."); for (let t = 0; t < a.length - 1; t++)if (o = o[a[t]], !n(o)) throw new Error(`ModSDK: Function ${e} to be patched not found; ${a.slice(0, t + 1).join(".")} is not object`); const d = o[a[a.length - 1]]; if ("function" != typeof d) throw new Error(`ModSDK: Function ${e} to be patched not found`); const c = function (e) { let o = -1; for (const n of t.encode(e)) { let e = 255 & (o ^ n); for (let o = 0; o < 8; o++)e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1; o = o >>> 8 ^ e } return ((-1 ^ o) >>> 0).toString(16).padStart(8, "0").toUpperCase() }(d.toString().replaceAll("\r\n", "\n")), l = { name: e, original: d, originalHash: c }; r = Object.assign(Object.assign({}, l), { precomputed: s(l), router: () => { }, context: o, contextProperty: a[a.length - 1] }), r.router = function (e) { return function (...o) { return e.precomputed.enter.apply(this, [o]) } }(r), i.set(e, r), o[r.contextProperty] = r.router } return r } function l() { const e = new Set; for (const o of p.values()) for (const t of o.patching.keys()) e.add(t); for (const o of i.keys()) e.add(o); for (const o of e) c(o, !0) } function f() { const e = new Map; for (const [o, t] of i) e.set(o, { name: o, original: t.original, originalHash: t.originalHash, sdkEntrypoint: t.router, currentEntrypoint: t.context[t.contextProperty], hookedByMods: r(t.precomputed.hooks.map((e => e.mod))), patchedByMods: Array.from(t.precomputed.patchesSources) }); return e } const p = new Map; function u(e) { p.get(e.name) !== e && o(`Failed to unload mod '${e.name}': Not registered`), p.delete(e.name), e.loaded = !1, l() } function g(e, t, r) { "string" == typeof e && "string" == typeof t && (alert(`Mod SDK warning: Mod '${e}' is registering in a deprecated way.\nIt will work for now, but please inform author to update.`), e = { name: e, fullName: e, version: t }, t = { allowReplace: !0 === r }), e && "object" == typeof e || o("Failed to register mod: Expected info object, got " + typeof e), "string" == typeof e.name && e.name || o("Failed to register mod: Expected name to be non-empty string, got " + typeof e.name); let i = `'${e.name}'`; "string" == typeof e.fullName && e.fullName || o(`Failed to register mod ${i}: Expected fullName to be non-empty string, got ${typeof e.fullName}`), i = `'${e.fullName} (${e.name})'`, "string" != typeof e.version && o(`Failed to register mod ${i}: Expected version to be string, got ${typeof e.version}`), e.repository || (e.repository = void 0), void 0 !== e.repository && "string" != typeof e.repository && o(`Failed to register mod ${i}: Expected repository to be undefined or string, got ${typeof e.version}`), null == t && (t = {}), t && "object" == typeof t || o(`Failed to register mod ${i}: Expected options to be undefined or object, got ${typeof t}`); const a = !0 === t.allowReplace, d = p.get(e.name); d && (d.allowReplace && a || o(`Refusing to load mod ${i}: it is already loaded and doesn't allow being replaced.\nWas the mod loaded multiple times?`), u(d)); const s = e => { "string" == typeof e && e || o(`Mod ${i} failed to patch a function: Expected function name string, got ${typeof e}`); let t = g.patching.get(e); return t || (t = { hooks: [], patches: new Map }, g.patching.set(e, t)), t }, f = { unload: () => u(g), hookFunction: (e, t, n) => { g.loaded || o(`Mod ${i} attempted to call SDK function after being unloaded`); const r = s(e); "number" != typeof t && o(`Mod ${i} failed to hook function '${e}': Expected priority number, got ${typeof t}`), "function" != typeof n && o(`Mod ${i} failed to hook function '${e}': Expected hook function, got ${typeof n}`); const a = { mod: g.name, priority: t, hook: n }; return r.hooks.push(a), l(), () => { const e = r.hooks.indexOf(a); e >= 0 && (r.hooks.splice(e, 1), l()) } }, patchFunction: (e, t) => { g.loaded || o(`Mod ${i} attempted to call SDK function after being unloaded`); const r = s(e); n(t) || o(`Mod ${i} failed to patch function '${e}': Expected patches object, got ${typeof t}`); for (const [n, a] of Object.entries(t)) "string" == typeof a ? r.patches.set(n, a) : null === a ? r.patches.delete(n) : o(`Mod ${i} failed to patch function '${e}': Invalid format of patch '${n}'`); l() }, removePatches: e => { g.loaded || o(`Mod ${i} attempted to call SDK function after being unloaded`); s(e).patches.clear(), l() }, callOriginal: (e, t, n) => (g.loaded || o(`Mod ${i} attempted to call SDK function after being unloaded`), "string" == typeof e && e || o(`Mod ${i} failed to call a function: Expected function name string, got ${typeof e}`), Array.isArray(t) || o(`Mod ${i} failed to call a function: Expected args array, got ${typeof t}`), function (e, o, t = window) { return c(e).original.apply(t, o) }(e, t, n)), getOriginalHash: e => ("string" == typeof e && e || o(`Mod ${i} failed to get hash: Expected function name string, got ${typeof e}`), c(e).originalHash) }, g = { name: e.name, fullName: e.fullName, version: e.version, repository: e.repository, allowReplace: a, api: f, loaded: !0, patching: new Map }; return p.set(e.name, g), Object.freeze(f) } function h() { const e = []; for (const o of p.values()) e.push({ name: o.name, fullName: o.fullName, version: o.version, repository: o.repository }); return e } let m; const y = function () { if (void 0 === window.bcModSdk) return window.bcModSdk = function () { const o = { version: e, apiVersion: 1, registerMod: g, getModsInfo: h, getPatchingInfo: f, errorReporterHooks: Object.seal({ hookEnter: null, hookChainExit: null }) }; return m = o, Object.freeze(o) }(); if (n(window.bcModSdk) || o("Failed to init Mod SDK: Name already in use"), 1 !== window.bcModSdk.apiVersion && o(`Failed to init Mod SDK: Different version already loaded ('1.1.0' vs '${window.bcModSdk.version}')`), window.bcModSdk.version !== e && (alert(`Mod SDK warning: Loading different but compatible versions ('1.1.0' vs '${window.bcModSdk.version}')\nOne of mods you are using is using an old version of SDK. It will work for now but please inform author to update`), window.bcModSdk.version.startsWith("1.0.") && void 0 === window.bcModSdk._shim10register)) { const e = window.bcModSdk, o = Object.freeze(Object.assign(Object.assign({}, e), { registerMod: (o, t, n) => o && "object" == typeof o && "string" == typeof o.name && "string" == typeof o.version ? e.registerMod(o.name, o.version, "object" == typeof t && !!t && !0 === t.allowReplace) : e.registerMod(o, t, n), _shim10register: !0 })); window.bcModSdk = o } return window.bcModSdk }(); return "undefined" != typeof exports && (Object.defineProperty(exports, "__esModule", { value: !0 }), exports.default = y), y }();

const modApi = bcModSdk.registerMod({
    name: "Bondage Club XToys Integration",
    fullName: "BC-XToys",
    version: BC_XToys_Version,
    repository: "https://github.com/ItsNorin/Bondage-Club-XToys-Integration",
});

console.log("Starting " + BC_XToys_FullName + " version " + BC_XToys_Version + ".");

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
        var urls = JSON.parse(localStorage.getItem("BC-XToys Websockets"));
        return Array.isArray(urls) ? urls : [];
    },
    saveSockets() {
        var urls = JSON.stringify(Array.from(this.sockets.keys()));
        if (urls != localStorage.getItem("BC-XToys Websockets")) {
            console.log("BC-XToys: Saving urls to local storage: " + urls);
            localStorage.setItem("BC-XToys Websockets", urls);
        }
    },

    // whether to try to connect to locally saved websockets on startup
    setAutoConnectState(e) {
        if (e === true || e === false) {
            localStorage.setItem("BC-XToys AutoConnect", JSON.stringify(e));
        }
    },
    getAutoConnectState() {
        var s = JSON.parse(localStorage.getItem("BC-XToys AutoConnect"));
        return (s === true) ? true : false;
    },

    // whether to attempt to reconnect when a socket comes offline
    setAutoReconnectState(e) {
        if (e === true || e === false) {
            localStorage.setItem("BC-XToys AutoReconnect", JSON.stringify(e));
        }
    },
    getAutoReconnectState() {
        var s = JSON.parse(localStorage.getItem("BC-XToys AutoReconnect"));
        return (s === true) ? true : false;
    },

    // creates a websocket connection to given URL
    connect(url) {
        if (url == null) { return; }

        if (this.hasConnection(url)) {
            var m = 'Already connected to ' + url;
            ChatRoomSendLocal(m, 60000);
            console.log("BC-XToys: " + m);
            return;
        }

        var newSocket = new WebSocket(url);
        this.sockets.set(url, newSocket);

        newSocket.onopen = function (e) {
            var m = 'Connected to ' + newSocket.url;
            ChatRoomSendLocal(m, 60000);
            console.log("BC-XToys: " + m);

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
            console.log("BC-XToys: " + m);
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
        console.log("BC-XToys: Connecting to urls from local storage: ");

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
        console.log("BC-XToys: " + logMsg);
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
            if (slot == undefined || level == undefined || itemName == undefined) { return; }

            level += levelOffset;

            //console.log('states have ' + slot + ' ' + stateType + ' ' + level + ': ' + this.hasState(slot, stateType, level));
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
    await waitFor(() => ServerIsConnected && ServerSocket);
    await waitFor(() => !!Commands);

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