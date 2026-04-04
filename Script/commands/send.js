const axios = require("axios");

module.exports.config = {
  name: "send",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "MAHIM ISLAM",
  description: "Transfer money to another user",
  commandCategory: "economy",
  usages: "[reply/mention/UID] [amount]",
  cooldowns: 10
};

module.exports.run = async function ({ api, event, args, Users }) {
  try {
    let receiverID = null;
    let amountIndex = 0;

    if (event.type === "message_reply") {
      receiverID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      receiverID = Object.keys(event.mentions)[0];
      amountIndex = Object.values(event.mentions)[0].split(" ").length;
    } else if (args.length > 0 && !isNaN(args[0])) {
      receiverID = args[0];
      amountIndex = 1;
    }

    if (!receiverID || receiverID === event.senderID) {
      return api.sendMessage("⚠️ | 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐮𝐬𝐞𝐫.", event.threadID, event.messageID);
    }

    const amount = args[amountIndex];
    if (!amount) return api.sendMessage("⚠️ | 𝐄𝐧𝐭𝐞𝐫 𝐚𝐦𝐨𝐮𝐧𝐭.", event.threadID, event.messageID);

    let receiverName = await Users.getNameUser(receiverID) || "User";

    const apiUrl = `https://mahimcraft.alwaysdata.net/economy/?type=transfer&sender_uid=${event.senderID}&receiver_id=${receiverID}&quantity=${amount}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data.status === "success") {
      // Assuming amount inputted is like 13M, we prepend 💲 manually
      return api.sendMessage(`✅ | 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐬𝐞𝐧𝐭 💲${amount.toUpperCase()} 𝐭𝐨 ${receiverName}.`, event.threadID, event.messageID);
    } else {
      return api.sendMessage(`⚠️ | ${data.message}`, event.threadID, event.messageID);
    }
  } catch (error) {
    return api.sendMessage("❌ | 𝐄𝐫𝐫𝐨𝐫", event.threadID, event.messageID);
  }
};
