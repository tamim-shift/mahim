const axios = require("axios");

module.exports.config = {
  name: "deposit",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "MAHIM ISLAM",
  description: "Store money in vault",
  commandCategory: "economy",
  usages: "[amount]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const amount = args[0];
    if (!amount) return api.sendMessage("⚠️ | 𝐄𝐧𝐭𝐞𝐫 𝐚𝐦𝐨𝐮𝐧𝐭.", event.threadID, event.messageID);

    const apiUrl = `https://mahimcraft.alwaysdata.net/economy/?type=vault_deposit&uid=${event.senderID}&quantity=${amount}`;
    const response = await axios.get(apiUrl);
    
    if (response.data.status === "success") {
      return api.sendMessage(`🏦 | 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐝𝐞𝐩𝐨𝐬𝐢𝐭𝐞𝐝 💲${amount.toUpperCase()}.`, event.threadID, event.messageID);
    } else {
      return api.sendMessage(`⚠️ | ${response.data.message}`, event.threadID, event.messageID);
    }
  } catch (error) {
    return api.sendMessage("❌ | 𝐄𝐫𝐫𝐨𝐫", event.threadID, event.messageID);
  }
};
