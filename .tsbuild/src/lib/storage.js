"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadLastInput = exports.saveLastInput = exports.loadProfiles = exports.saveProfiles = void 0;
const PROFILES_KEY = "genastral_profiles";
const LAST_INPUT_KEY = "genastral_last_input";
const saveProfiles = (profiles) => {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};
exports.saveProfiles = saveProfiles;
const loadProfiles = () => {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw)
        return [];
    try {
        return JSON.parse(raw);
    }
    catch {
        return [];
    }
};
exports.loadProfiles = loadProfiles;
const saveLastInput = (input) => {
    localStorage.setItem(LAST_INPUT_KEY, JSON.stringify(input));
};
exports.saveLastInput = saveLastInput;
const loadLastInput = () => {
    const raw = localStorage.getItem(LAST_INPUT_KEY);
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
};
exports.loadLastInput = loadLastInput;
