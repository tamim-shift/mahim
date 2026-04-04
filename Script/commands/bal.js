const axios = require("axios");

module.exports.config = {
  name: "bal",
  version: "1.0.6",
  hasPermssion: 0,
  credits: "MAHIM ISLAM",
  description: "Check user balance",
  commandCategory: "economy",
  usages: "[blank | reply | mention | UID]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Users }) {
  try {
    let targetID = event.senderID;
    const isOwn = args.length === 0 && event.type !== "message_reply" && Object.keys(event.mentions).length === 0;

    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else if (args.length > 0 && !isNaN(args[0])) {
      targetID = args[0];
    }

    let name = await Users.getNameUser(targetID) || "User";
    const encodedName = encodeURIComponent(name);
    
    const apiUrl = `https://mahimcraft.alwaysdata.net/economy/?type=bal_check&uid=${targetID}&name=${encodedName}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data.status === "success") {
      let msg = "";
      if (isOwn || targetID === event.senderID) {
        msg = `🎀 ${data.name}\n\n𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮𝐫 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: ${data.balance}`;
      } else {
        msg = `🎀 ${data.name} 𝐡𝐚𝐬 ${data.balance}`;
      }

      return api.sendMessage(msg, event.threadID, event.messageID);
    } else {
      return api.sendMessage(`⚠️ | ${data.message || "Error"}`, event.threadID, event.messageID);
    }
  } catch (error) {
    return api.sendMessage("❌ | 𝐄𝐫𝐫𝐨𝐫", event.threadID, event.messageID);
  }
};
