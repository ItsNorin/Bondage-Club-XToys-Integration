// ==UserScript==
// @name Bondage Club XToys Integration
// @namespace https://www.bondageprojects.com/
// @version 0.3
// @description Sends in game actions and toy activity to an XToys script. Based on work by Fro.
// @author ItsNorin
// @homepageURL https://github.com/ItsNorin/Bondage-Club-XToys-Integration
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match http://localhost:*/*
// @run-at document-end
// @grant none
// ==/UserScript==

const BCXToys_Version = "0.3";

var BCXToysIgnoreMsgContents = new Set(['BCXMsg', 'BCEMsg', 'Preference', 'ServerEnter', 'ServerLeave', 'Wardrobe', 'SlowLeaveAttempt',
    'ServerUpdateRoom', 'bctMsg']);
var BCXToysIgnoreMsgTypes = new Set(['Status', 'Hidden']);

function BCXToysGetXToysIDFromUser() {
    return prompt('Enter your XToys Private Webhook ID\nAvailable under your User Info, under Private Webhook.');
}

var bcModSdk = function () { "use strict"; const e = "1.1.0"; function o(e) { alert("Mod ERROR:\n" + e); const o = new Error(e); throw console.error(o), o } const t = new TextEncoder; function n(e) { return !!e && "object" == typeof e && !Array.isArray(e) } function r(e) { const o = new Set; return e.filter((e => !o.has(e) && o.add(e))) } const i = new Map, a = new Set; function d(e) { a.has(e) || (a.add(e), console.warn(e)) } function s(e) { const o = [], t = new Map, n = new Set; for (const r of p.values()) { const i = r.patching.get(e.name); if (i) { o.push(...i.hooks); for (const [o, a] of i.patches.entries()) t.has(o) && t.get(o) !== a && d(`ModSDK: Mod '${r.name}' is patching function ${e.name} with same pattern that is already applied by different mod, but with different pattern:\nPattern:\n${o}\nPatch1:\n${t.get(o) || ""}\nPatch2:\n${a}`), t.set(o, a), n.add(r.name) } } o.sort(((e, o) => o.priority - e.priority)); const r = function (e, o) { if (0 === o.size) return e; let t = e.toString().replaceAll("\r\n", "\n"); for (const [n, r] of o.entries()) t.includes(n) || d(`ModSDK: Patching ${e.name}: Patch ${n} not applied`), t = t.replaceAll(n, r); return (0, eval)(`(${t})`) }(e.original, t); let i = function (o) { var t, i; const a = null === (i = (t = m.errorReporterHooks).hookChainExit) || void 0 === i ? void 0 : i.call(t, e.name, n), d = r.apply(this, o); return null == a || a(), d }; for (let t = o.length - 1; t >= 0; t--) { const n = o[t], r = i; i = function (o) { var t, i; const a = null === (i = (t = m.errorReporterHooks).hookEnter) || void 0 === i ? void 0 : i.call(t, e.name, n.mod), d = n.hook.apply(this, [o, e => { if (1 !== arguments.length || !Array.isArray(o)) throw new Error(`Mod ${n.mod} failed to call next hook: Expected args to be array, got ${typeof e}`); return r.call(this, e) }]); return null == a || a(), d } } return { hooks: o, patches: t, patchesSources: n, enter: i, final: r } } function c(e, o = !1) { let r = i.get(e); if (r) o && (r.precomputed = s(r)); else { let o = window; const a = e.split("."); for (let t = 0; t < a.length - 1; t++)if (o = o[a[t]], !n(o)) throw new Error(`ModSDK: Function ${e} to be patched not found; ${a.slice(0, t + 1).join(".")} is not object`); const d = o[a[a.length - 1]]; if ("function" != typeof d) throw new Error(`ModSDK: Function ${e} to be patched not found`); const c = function (e) { let o = -1; for (const n of t.encode(e)) { let e = 255 & (o ^ n); for (let o = 0; o < 8; o++)e = 1 & e ? -306674912 ^ e >>> 1 : e >>> 1; o = o >>> 8 ^ e } return ((-1 ^ o) >>> 0).toString(16).padStart(8, "0").toUpperCase() }(d.toString().replaceAll("\r\n", "\n")), l = { name: e, original: d, originalHash: c }; r = Object.assign(Object.assign({}, l), { precomputed: s(l), router: () => { }, context: o, contextProperty: a[a.length - 1] }), r.router = function (e) { return function (...o) { return e.precomputed.enter.apply(this, [o]) } }(r), i.set(e, r), o[r.contextProperty] = r.router } return r } function l() { const e = new Set; for (const o of p.values()) for (const t of o.patching.keys()) e.add(t); for (const o of i.keys()) e.add(o); for (const o of e) c(o, !0) } function f() { const e = new Map; for (const [o, t] of i) e.set(o, { name: o, original: t.original, originalHash: t.originalHash, sdkEntrypoint: t.router, currentEntrypoint: t.context[t.contextProperty], hookedByMods: r(t.precomputed.hooks.map((e => e.mod))), patchedByMods: Array.from(t.precomputed.patchesSources) }); return e } const p = new Map; function u(e) { p.get(e.name) !== e && o(`Failed to unload mod '${e.name}': Not registered`), p.delete(e.name), e.loaded = !1, l() } function g(e, t, r) { "string" == typeof e && "string" == typeof t && (alert(`Mod SDK warning: Mod '${e}' is registering in a deprecated way.\nIt will work for now, but please inform author to update.`), e = { name: e, fullName: e, version: t }, t = { allowReplace: !0 === r }), e && "object" == typeof e || o("Failed to register mod: Expected info object, got " + typeof e), "string" == typeof e.name && e.name || o("Failed to register mod: Expected name to be non-empty string, got " + typeof e.name); let i = `'${e.name}'`; "string" == typeof e.fullName && e.fullName || o(`Failed to register mod ${i}: Expected fullName to be non-empty string, got ${typeof e.fullName}`), i = `'${e.fullName} (${e.name})'`, "string" != typeof e.version && o(`Failed to register mod ${i}: Expected version to be string, got ${typeof e.version}`), e.repository || (e.repository = void 0), void 0 !== e.repository && "string" != typeof e.repository && o(`Failed to register mod ${i}: Expected repository to be undefined or string, got ${typeof e.version}`), null == t && (t = {}), t && "object" == typeof t || o(`Failed to register mod ${i}: Expected options to be undefined or object, got ${typeof t}`); const a = !0 === t.allowReplace, d = p.get(e.name); d && (d.allowReplace && a || o(`Refusing to load mod ${i}: it is already loaded and doesn't allow being replaced.\nWas the mod loaded multiple times?`), u(d)); const s = e => { "string" == typeof e && e || o(`Mod ${i} failed to patch a function: Expected function name string, got ${typeof e}`); let t = g.patching.get(e); return t || (t = { hooks: [], patches: new Map }, g.patching.set(e, t)), t }, f = { unload: () => u(g), hookFunction: (e, t, n) => { g.loaded || o(`Mod ${i} attempted to call SDK function after being unloaded`); const r = s(e); "number" != typeof t && o(`Mod ${i} failed to hook function '${e}': Expected priority number, got ${typeof t}`), "function" != typeof n && o(`Mod ${i} failed to hook function '${e}': Expected hook function, got ${typeof n}`); const a = { mod: g.name, priority: t, hook: n }; return r.hooks.push(a), l(), () => { const e = r.hooks.indexOf(a); e >= 0 && (r.hooks.splice(e, 1), l()) } }, patchFunction: (e, t) => { g.loaded || o(`Mod ${i} attempted to call SDK function after being unloaded`); const r = s(e); n(t) || o(`Mod ${i} failed to patch function '${e}': Expected patches object, got ${typeof t}`); for (const [n, a] of Object.entries(t)) "string" == typeof a ? r.patches.set(n, a) : null === a ? r.patches.delete(n) : o(`Mod ${i} failed to patch function '${e}': Invalid format of patch '${n}'`); l() }, removePatches: e => { g.loaded || o(`Mod ${i} attempted to call SDK function after being unloaded`); s(e).patches.clear(), l() }, callOriginal: (e, t, n) => (g.loaded || o(`Mod ${i} attempted to call SDK function after being unloaded`), "string" == typeof e && e || o(`Mod ${i} failed to call a function: Expected function name string, got ${typeof e}`), Array.isArray(t) || o(`Mod ${i} failed to call a function: Expected args array, got ${typeof t}`), function (e, o, t = window) { return c(e).original.apply(t, o) }(e, t, n)), getOriginalHash: e => ("string" == typeof e && e || o(`Mod ${i} failed to get hash: Expected function name string, got ${typeof e}`), c(e).originalHash) }, g = { name: e.name, fullName: e.fullName, version: e.version, repository: e.repository, allowReplace: a, api: f, loaded: !0, patching: new Map }; return p.set(e.name, g), Object.freeze(f) } function h() { const e = []; for (const o of p.values()) e.push({ name: o.name, fullName: o.fullName, version: o.version, repository: o.repository }); return e } let m; const y = function () { if (void 0 === window.bcModSdk) return window.bcModSdk = function () { const o = { version: e, apiVersion: 1, registerMod: g, getModsInfo: h, getPatchingInfo: f, errorReporterHooks: Object.seal({ hookEnter: null, hookChainExit: null }) }; return m = o, Object.freeze(o) }(); if (n(window.bcModSdk) || o("Failed to init Mod SDK: Name already in use"), 1 !== window.bcModSdk.apiVersion && o(`Failed to init Mod SDK: Different version already loaded ('1.1.0' vs '${window.bcModSdk.version}')`), window.bcModSdk.version !== e && (alert(`Mod SDK warning: Loading different but compatible versions ('1.1.0' vs '${window.bcModSdk.version}')\nOne of mods you are using is using an old version of SDK. It will work for now but please inform author to update`), window.bcModSdk.version.startsWith("1.0.") && void 0 === window.bcModSdk._shim10register)) { const e = window.bcModSdk, o = Object.freeze(Object.assign(Object.assign({}, e), { registerMod: (o, t, n) => o && "object" == typeof o && "string" == typeof o.name && "string" == typeof o.version ? e.registerMod(o.name, o.version, "object" == typeof t && !!t && !0 === t.allowReplace) : e.registerMod(o, t, n), _shim10register: !0 })); window.bcModSdk = o } return window.bcModSdk }(); return "undefined" != typeof exports && (Object.defineProperty(exports, "__esModule", { value: !0 }), exports.default = y), y }();

(async function () {
    const modApi = bcModSdk.registerMod({
        name: 'BCXToys',
        fullName: 'Bondage Club XToys Integration',
        version: BCXToys_Version,
        repository: 'https://github.com/ItsNorin/Bondage-Club-XToys-Integration',
    });

    await waitFor(() => ServerIsConnected && ServerSocket);

    // get webhook id and create connection
    const xToysSocket = new WebSocket('wss://webhook.xtoys.app/' + BCXToysGetXToysIDFromUser());
    var xToysConnected = false;

    xToysSocket.onopen = function (e) {
        xToysConnected = true;
        console.log('Connected to XToys');
    };

    xToysSocket.onmessage = e => {
        console.log(e.data);
    };

    xToysSocket.onclose = function (event) {
        xToysConnected = false;
        console.log('Disconnected from XToys');
    };


    // sends any amount of arguements to XToys Websocket
    // actionName - string
    // args - array of [string, any type]
    // if arg data is null, will send "none"
    function xToysSendData(actionName, args = null) {
        if (!xToysConnected) {
            console.log('Failed to send to XToys, not connected.');
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

        console.log('Sending to XToys: ' + toSend);
        xToysSocket.send(toSend);
    }

    // Activities involving player
    function handleActivities(data) {
        if (data.Type != 'Activity') { return; }

        var activityGroup = searchMsgDictionary(data, 'ActivityGroup')?.Text;
        var activityName = searchMsgDictionary(data, 'ActivityName')?.Text;
        var activityAsset = searchMsgDictionary(data, 'ActivityAsset')?.Text;

        if (activityGroup == null || activityName == null) { return; }

        // activity on self
        if (searchMsgDictionary(data, 'TargetCharacter')?.MemberNumber === Player.MemberNumber) {
            xToysSendData('activityEvent', [
                ['assetGroupName', activityGroup],
                ['actionName', activityName],
                ['assetName', activityAsset]
            ]);
        }
        // activity on others by self
        else if (searchMsgDictionary(data, 'SourceCharacter')?.MemberNumber === Player.MemberNumber) {
            xToysSendData('activityOnOtherEvent', [
                ['assetGroupName', activityGroup],
                ['actionName', activityName],
                ['assetName', activityAsset]
            ]);
        }
    }

    // Toys/items equipped or removed on player
    function handleItemEquip(data) {
        if (data.Type != 'Action' || searchMsgDictionary(data, 'DestinationCharacter')?.MemberNumber != Player.MemberNumber) { return; }
        var itemUsedInSlot = searchMsgDictionary(data, 'FocusAssetGroup')?.AssetGroupName;
        if (itemUsedInSlot == null) { return; }

        // Toy equip
        if (data.Content == 'ActionUse') {
            //console.log('Added: ' + itemUsedInSlot);
            xToysSendData('itemAdded', [['assetGroupName', itemUsedInSlot]]);
        }
        // Toy removal
        else if (data.Content == 'ActionRemove') {
            //console.log('Removed: ' + itemUsedInSlot);
            xToysSendData('itemRemoved', [['assetGroupName', itemUsedInSlot]]);
        }
    }

    // Toys affecting player
    function handleToyEvents(data) {
        if (data.Type != 'Action' || searchMsgDictionary(data, 'DestinationCharacterName')?.MemberNumber != Player.MemberNumber) {
            return;
        }

        var assetName = searchMsgDictionary(data, 'AssetName')?.AssetName;
        var activityGroup = Player.Appearance.find((d) => d.Asset.Name == assetName)?.Asset?.Group?.Name;

        if (activityGroup == null || assetName == null) { return; }

        var level = getVibrationLevel(data);
        if (level >= 0) {
            xToysSendData('toyEvent', [
                ['assetGroupName', activityGroup],
                ['level', level]
            ]);
        }

        var inflationLevel = getInflationLevel(data);
        if (inflationLevel >= 0) {
            xToysSendData('inflationEvent', [
                ['assetGroupName', activityGroup],
                ['level', inflationLevel]
            ]);
        }

        var shockLevel = getShockLevel(data);
        if (shockLevel >= 0) {
            xToysSendData('shockEvent', [
                ['assetGroupName', activityGroup],
                ['level', shockLevel]
            ]);
        }
    }

    // On every chat room message, check what should be sent to xtoys
    ServerSocket.on("ChatRoomMessage", async (data) => {
        if (data == null
            || data.Content == null
            || BCXToysIgnoreMsgContents.has(data.Content)
            || data.Type == null
            || BCXToysIgnoreMsgTypes.has(data.Type)
        ) {
            return;
        }

        handleActivities(data);
        handleItemEquip(data);
        handleToyEvents(data);

        //console.log(data);
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
    function searchMsgDictionary(msg, key) {
        if (msg != null && Array.isArray(msg.Dictionary)) {
            return msg.Dictionary.find((d) => d.Tag == key);
        }
        return null;
    }

    // annoying stuff lol
    function getVibrationLevel(msgData) {
        var level = -1;
        switch (msgData.Content) {
            case 'VibeDecreaseTo-1':
            case 'ItemButtInflVibeButtPlugDecreaseToi0':
                level = 0; break;
            case 'VibeDecreaseTo0':
            case 'VibeIncreaseTo0':
            case 'ItemButtInflVibeButtPlugIncreaseToi1':
            case 'ItemButtInflVibeButtPlugDecreaseToi1':
                level = 1; break;
            case 'VibeDecreaseTo1':
            case 'VibeIncreaseTo1':
            case 'ItemButtInflVibeButtPlugIncreaseToi2':
            case 'ItemButtInflVibeButtPlugDecreaseToi2':
                level = 2; break;
            case 'VibeDecreaseTo2':
            case 'VibeIncreaseTo2':
            case 'ItemButtInflVibeButtPlugIncreaseToi3':
            case 'ItemButtInflVibeButtPlugDecreaseToi3':
                level = 3; break;
            case 'VibeDecreaseTo3':
            case 'VibeIncreaseTo3':
            case 'ItemButtInflVibeButtPlugIncreaseToi4':
                level = 4; break;
        }
        return level;
    }
    
    function getInflationLevel(msgData) {
        var inflationLevel = -1;
        switch (msgData.Content) {
            case 'ItemButtInflVibeButtPlugDecreaseTof0':
                inflationLevel = 0; break;
            case 'ItemButtInflVibeButtPlugIncreaseTof1':
            case 'ItemButtInflVibeButtPlugDecreaseTof1':
                inflationLevel = 1; break;
            case 'ItemButtInflVibeButtPlugIncreaseTof2':
            case 'ItemButtInflVibeButtPlugDecreaseTof2':
                inflationLevel = 2; break;
            case 'ItemButtInflVibeButtPlugIncreaseTof3':
            case 'ItemButtInflVibeButtPlugDecreaseTof3':
                inflationLevel = 3; break;
            case 'ItemButtInflVibeButtPlugIncreaseTof4':
                inflationLevel = 4; break;
        }
        return inflationLevel;
    }
    
    function getShockLevel(msgData) {
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