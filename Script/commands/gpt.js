const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Define Cloudflare Models (8 Top Tier Free Models)
const MODELS = [
  { id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", name: "Llama 3.3 (70B) - Strongest" },
  { id: "@cf/meta/llama-3.1-8b-instruct", name: "Llama 3.1 (8B) - Fast & Smart" },
  { id: "@cf/mistral/mistral-7b-instruct-v0.2", name: "Mistral 7B - Great Reasoning" },
  { id: "@cf/qwen/qwen1.5-14b-chat-awq", name: "Qwen 1.5 (14B) - Multilingual Master" },
  { id: "@cf/google/gemma-7b-it", name: "Google Gemma (7B) - Creative" },
  { id: "@cf/microsoft/phi-2", name: "Microsoft Phi-2 - Coding Focused" },
  { id: "@cf/meta/llama-2-7b-chat-fp16", name: "Llama 2 (7B) - Classic Stable" },
  { id: "@cf/openchat/openchat-3.5-0106", name: "OpenChat 3.5 - Conversational" }
];

const DEFAULT_MODEL = MODELS[0].id;

module.exports.config = {
  name: "gpt",
  version: "5.0",
  hasPermssion: 0,
  credits: "Mahim",
  description: "Advanced AI with memory, per-user model switching, and auto-reply",
  commandCategory: "ai",
  usage: ".gpt [text] | .gpt --reset | .gpt --model",
  countDown: 2
};

// --- FONT CONVERTER FUNCTION ---
// Converts standard English text to the requested mathematical sans-serif font
// Leaves numbers, symbols, and other languages (like Bengali) untouched.
function toSansFont(text) {
  const chars = {
    'a': '𝖺', 'b': '𝖻', 'c': '𝖼', 'd': '𝖽', 'e': '𝖾', 'f': '𝖿', 'g': '𝗀', 'h': '𝗁', 'i': '𝗂', 'j': '𝗃', 'k': '𝗄', 'l': '𝗅', 'm': '𝗆', 'n': '𝗇', 'o': '𝗈', 'p': '𝗉', 'q': '𝗊', 'r': '𝗋', 's': '𝗌', 't': '𝗍', 'u': '𝗎', 'v': '𝗏', 'w': '𝗐', 'x': '𝗑', 'y': '𝗒', 'z': '𝗓',
    'A': '𝖠', 'B': '𝖡', 'C': '𝖢', 'D': '𝖣', 'E': '𝖤', 'F': '𝖥', 'G': '𝖦', 'H': '𝖧', 'I': '𝖨', 'J': '𝖩', 'K': '𝖪', 'L': '𝖫', 'M': '𝖬', 'N': '𝖭', 'O': '𝖮', 'P': '𝖯', 'Q': '𝖰', 'R': '𝖱', 'S': '𝖲', 'T': '𝖳', 'U': '𝖴', 'V': '𝖵', 'W': '𝖶', 'X': '𝖷', 'Y': '𝖸', 'Z': '𝖹'
  };
  return text.replace(/[a-zA-Z]/g, m => chars[m] || m);
}

// --- MEMORY DATABASE SETUP ---
const dbPath = path.join(__dirname, "gpt_userdata.json");
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({}));
}

function getUserData(uid) {
  const db = JSON.parse(fs.readFileSync(dbPath));
  if (!db[uid]) {
    db[uid] = { model: DEFAULT_MODEL, history: [] };
  }
  return db[uid];
}

function saveUserData(uid, data) {
  const db = JSON.parse(fs.readFileSync(dbPath));
  db[uid] = data;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// --- CORE AI FETCHER ---
async function fetchAIResponse(api, event, uid, question) {
  // 🚨 ADD YOUR CLOUDFLARE CREDENTIALS HERE 🚨
  const ACCOUNT_ID = ""; 
  const API_TOKEN = ""; 

  if (!ACCOUNT_ID || !API_TOKEN) {
      throw new Error("Cloudflare API credentials are missing in the code!");
  }

  const userData = getUserData(uid);
  const baseURL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${userData.model}`;

  // Keep history manageable so Cloudflare doesn't reject massive payloads (last 10 messages)
  if (userData.history.length > 10) {
    userData.history = userData.history.slice(-10);
  }

  const messagesPayload = [
    { role: "system", content: "You are a helpful assistant. Provide clear, concise answers. If asked in Bengali, reply in Bengali. If asked in English, reply in English." },
    ...userData.history,
    { role: "user", content: question }
  ];

  const response = await axios.post(
    baseURL,
    { messages: messagesPayload },
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      timeout: 45000
    }
  );

  const answer = response.data?.result?.response;
  if (!answer) throw new Error("Empty response from AI");

  // Save the new interaction to memory
  userData.history.push({ role: "user", content: question });
  userData.history.push({ role: "assistant", content: answer });
  saveUserData(uid, userData);

  return answer;
}


// --- MAIN COMMAND EXECUTION ---
module.exports.run = async ({ event, args, api }) => {
  const uid = event.senderID;
  const input = args.join(" ").trim();

  // 1. Empty Command
  if (!input) {
    return api.sendMessage("✦ 𝖧𝖾𝗅𝗅𝗈 𝗍𝗁𝖾𝗋𝖾! 𝖧𝗈𝗐 𝖼𝖺𝗇 𝖨 𝖺𝗌𝗌𝗂𝗌𝗍 𝗒𝗈𝗎 𝗍𝗈𝖽𝖺𝗒? 😊", event.threadID, event.messageID);
  }

  // 2. Reset Command
  if (input.toLowerCase() === "--reset") {
    saveUserData(uid, { model: DEFAULT_MODEL, history: [] });
    api.setMessageReaction("✅", event.messageID, () => {}, true);
    return api.sendMessage("✦ 𝖲𝗎𝖼𝖼𝖾𝗌𝗌! 🍒🍓 ‧₊˚🩰🍃\n\n𝖸𝗈𝗎𝗋 𝗆𝖾𝗆𝗈𝗋𝗒 𝗁𝖺𝗌 𝖻𝖾𝖾𝗇 𝖼𝗅𝖾𝖺𝗋𝖾𝖽 𝖺𝗇𝖽 𝗆𝗈𝖽𝖾𝗅 𝗋𝖾𝗌𝖾𝗍 𝗍𝗈 𝖽𝖾𝖿𝖺𝗎𝗅𝗍.", event.threadID, event.messageID);
  }

  // 3. Model Switcher Command
  if (input.toLowerCase() === "--model") {
    let msg = "✦ 𝐒𝐞𝐥𝐞𝐜𝐭 𝐀𝐈 𝐌𝐨𝐝𝐞𝐥: 🍒🍓\n(𝖱𝖾𝗉𝗅𝗒 𝗍𝗈 𝗍𝗁𝗂𝗌 𝗆𝖾𝗌𝗌𝖺𝗀𝖾 𝗐𝗂𝗍𝗁 𝗍𝗁𝖾 𝗇𝗎𝗆𝖻𝖾𝗋)\n\n";
    MODELS.forEach((m, index) => {
      msg += `${index + 1}. ${m.name}\n`;
    });

    return api.sendMessage(toSansFont(msg), event.threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: uid,
          type: "model_selection"
        });
      }
    }, event.messageID);
  }

  // 4. Normal AI Question
  const waitMessage = await api.sendMessage(`🤖 𝐓𝐡𝐢𝐧𝐤𝐢𝐧𝐠... 🍒🍓 ‧₊˚🩰🍃`, event.threadID);
  api.setMessageReaction("⌛", event.messageID, () => {}, true);

  try {
    const aiText = await fetchAIResponse(api, event, uid, input);
    api.setMessageReaction("✅", event.messageID, () => {}, true);
    if (waitMessage?.messageID) api.unsendMessage(waitMessage.messageID);

    // Format output with the fancy sans font and ✦ symbol
    const finalMessage = "✦ " + toSansFont(aiText);

    return api.sendMessage(finalMessage, event.threadID, (err, info) => {
      // Attach handleReply so the user can just reply to the bot's message to continue the chat
      if (!err) {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: uid,
          type: "chat_reply"
        });
      }
    }, event.messageID);

  } catch (error) {
    console.error("AI Error:", error);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    if (waitMessage?.messageID) api.unsendMessage(waitMessage.messageID);
    return api.sendMessage("✦ 𝖮𝗈𝗉𝗌! 𝖳𝗁𝖾 𝖠𝖨 𝖾𝗇𝖼𝗈𝗎𝗇𝗍𝖾𝗋𝖾𝖽 𝖺𝗇 𝖾𝗋𝗋𝗈𝗋. 𝖯𝗅𝖾𝖺𝗌𝖾 𝗍𝗋𝗒 𝖺𝗀𝖺𝗂𝗇.", event.threadID, event.messageID);
  }
};


// --- AUTO-REPLY HANDLER ---
// This runs whenever a user directly replies to a message the bot sent via this command
module.exports.handleReply = async ({ api, event, handleReply }) => {
  const uid = event.senderID;

  // Make sure the person replying is the same person who started the command
  if (handleReply.author !== uid) return;

  const input = event.body.trim();

  // Handle choosing a model from the list
  if (handleReply.type === "model_selection") {
    const choice = parseInt(input) - 1;
    if (isNaN(choice) || choice < 0 || choice >= MODELS.length) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage("✦ 𝖨𝗇𝗏𝖺𝗅𝗂𝖽 𝗇𝗎𝗆𝖻𝖾𝗋. 𝖯𝗅𝖾𝖺𝗌𝖾 𝗍𝗋𝗒 𝖺𝗀𝖺𝗂𝗇.", event.threadID, event.messageID);
    }

    const selectedModel = MODELS[choice];
    const userData = getUserData(uid);
    userData.model = selectedModel.id;
    saveUserData(uid, userData);

    api.setMessageReaction("✅", event.messageID, () => {}, true);
    return api.sendMessage(`✦ 𝖲𝗎𝖼𝖼𝖾𝗌𝗌! 🍒🍓 ‧₊˚🩰🍃\n\n𝖸𝗈𝗎𝗋 𝗆𝗈𝖽𝖾𝗅 𝗁𝖺𝗌 𝖻𝖾𝖾𝗇 𝗌𝗐𝗂𝗍𝖼𝗁𝖾𝖽 𝗍𝗈:\n${toSansFont(selectedModel.name)}`, event.threadID, event.messageID);
  }

  // Handle continuing the conversation
  if (handleReply.type === "chat_reply") {
    api.setMessageReaction("🔎", event.messageID, () => {}, true);
    
    try {
      const aiText = await fetchAIResponse(api, event, uid, input);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      
      const finalMessage = "✦ " + toSansFont(aiText);

      return api.sendMessage(finalMessage, event.threadID, (err, info) => {
        // Attach handleReply again so they can keep replying in an infinite loop
        if (!err) {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: uid,
            type: "chat_reply"
          });
        }
      }, event.messageID);

    } catch (error) {
      console.error("AI Auto-Reply Error:", error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage("✦ 𝖮𝗈𝗉𝗌! 𝖳𝗁𝖾 𝖠𝖨 𝖾𝗇𝖼𝗈𝗎𝗇𝗍𝖾𝗋𝖾𝖽 𝖺𝗇 𝖾𝗋𝗋𝗈𝗋. 𝖯𝗅𝖾𝖺𝗌𝖾 𝗍𝗋𝗒 𝖺𝗀𝖺𝗂𝗇.", event.threadID, event.messageID);
    }
  }
};