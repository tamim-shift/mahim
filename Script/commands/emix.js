const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "emix",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Mix two emojis",
  commandCategory: "image",
  usages: ".emojimix 😂 🤔 | 😂🤔 | 😂+🤔 | 😂|🤔",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
  try {
    let input = args.join(" ").trim();

    if (!input) {
      return api.sendMessage(
        "⚠️ Use: .emojimix 😂 🤔 | 😂🤔 | 😂+🤔",
        event.threadID,
        event.messageID
      );
    }

    // 🔥 Normalize input
    input = input.replace(/\+/g, " ").replace(/\|/g, " ");

    let emojis = input.includes(" ")
      ? input.split(" ").filter(Boolean)
      : [...input];

    if (emojis.length < 2) {
      return api.sendMessage("❌ Need 2 emojis!", event.threadID);
    }

    const emoji1 = emojis[0];
    const emoji2 = emojis[1];

    // 🔥 Your API (kept but improved usage)
    const apiUrl = `https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json`;

    const apis = await axios.get(apiUrl);
    const base = apis.data.api;

    const url = `${base}/nayan/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`;

    // ⚡ FAST STREAM (no request lib)
    const res = await axios.get(url, {
      responseType: "stream",
      timeout: 8000
    });

    return api.sendMessage(
      {
        body: `✨ ${emoji1} + ${emoji2}`,
        attachment: res.data
      },
      event.threadID,
      event.messageID
    );

  } catch (err) {
    console.log(err);
    return api.sendMessage(
      "❌ Can't mix these emojis!",
      event.threadID,
      event.messageID
    );
  }
};