"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const gpt_1 = require("./gpt");
const gemini_1 = require("./gemini");
const claude_1 = require("./claude");
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.post('/gpt', gpt_1.gpt);
router.post('/claude', claude_1.claude);
router.post('/gemini', gemini_1.gemini);
exports.default = router;
