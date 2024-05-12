"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gpt = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
// Define an async handler for the GPT endpoint
exports.gpt = (0, express_async_handler_1.default)(async (req, res) => {
    // Model mapping for API requests. Selecting gpt turbo
    const modelMapping = {
        gptTurbo: 'gpt-4-1106-preview',
        gpt: 'gpt-4'
    };
    try {
        // Set up SSE (Server-Sent Events) headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        });
        const { model, messages } = req.body;
        // Log the model and messages for debugging purposes
        console.log('Selected model:', model);
        console.log('Messages:', messages);
        // Fetch response from OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`
            },
            body: JSON.stringify({
                model: modelMapping[model],
                messages,
                stream: true
            })
        });
        // Check if the response status indicates an error
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error response from OpenAI:', response.status, errorBody);
            res.write(`data: {"error": "Error response from OpenAI: ${response.status}"}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
            return;
        }
        console.log('Response status:', response.status);
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let partialLine = '';
        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                let chunk = decoder.decode(value);
                if (partialLine) {
                    try {
                        const { choices } = JSON.parse(partialLine);
                        const { delta } = choices[0];
                        const { content } = delta;
                        if (content) {
                            res.write(`data: ${JSON.stringify(content)}\n\n`);
                        }
                        partialLine = '';
                    }
                    catch (err) {
                        // Ignored as partialLine might not be a complete JSON
                    }
                }
                const lines = chunk.split("data: ");
                const parsedLines = lines
                    .filter(line => line !== "" && line !== "[DONE]")
                    .filter(l => {
                    try {
                        JSON.parse(l);
                        return true;
                    }
                    catch (err) {
                        console.log('Line that’s not JSON:', l);
                        if (!l.includes('[DONE]')) {
                            partialLine = partialLine + l;
                        }
                        return false;
                    }
                })
                    .map(l => JSON.parse(l));
                for (const parsedLine of parsedLines) {
                    const { choices } = parsedLine;
                    const { delta } = choices[0];
                    const { content } = delta;
                    if (content) {
                        res.write(`data: ${JSON.stringify(delta)}\n\n`);
                    }
                }
            }
        }
        res.write('data: [DONE]\n\n');
        res.end();
    }
    catch (err) {
        console.error('Error:', err);
        res.write('data: {"error": "An internal server error occurred."}\n\n');
        res.write('data: [DONE]\n\n');
        res.end();
    }
});
