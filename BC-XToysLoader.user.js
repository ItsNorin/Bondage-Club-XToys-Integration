// ==UserScript==
// @name         Bondage Club XToys Integration Loader
// @namespace    BC-XToys
// @description  Sends in game actions and toy activity to XToys.
// @author       ItsNorin
// @version      1.1
// @match        https://bondageprojects.elementfx.com/*
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://bondage-europe.com/*
// @match        https://www.bondage-europe.com/*
// @match        http://localhost:*/*
// @homepage     https://github.com/ItsNorin/Bondage-Club-XToys-Integration
// @downloadURL  https://itsnorin.github.io/Bondage-Club-XToys-Integration/BC-XToysLoader.user.js
// @run-at       document-end
// @grant        none
// ==/UserScript==

// eslint-disable-next-line no-restricted-globals
setTimeout(
    () => {
        const n = document.createElement("script");
        n.language = "JavaScript";
        n.crossorigin = "anonymous";
        n.src = "https://itsnorin.github.io/Bondage-Club-XToys-Integration/BC-XToys.user.js";
        document.head.appendChild(n);
    },
    2000,
);