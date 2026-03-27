module.exports.config = {
  name: "usta",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Mahim Islam",
  description: "Kick your friend in funny style 😂",
  commandCategory: "fun",
  usages: "usta @user / reply / auto",
  cooldowns: 5,
};

module.exports.run = async ({ api, event }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = __dirname + "/cache/usta.gif";

  const { threadID, messageID, senderID, messageReply, mentions } = event;

  let target;
  let tagName = "";

  // 🔹 TARGET DETECTION WITH REAL NAME
  if (messageReply) {
    target = messageReply.senderID;
    const info = await api.getUserInfo(target);
    tagName = info[target].name;
  } 
  else if (Object.keys(mentions).length > 0) {
    target = Object.keys(mentions)[0];
    tagName = mentions[target].replace("@", "");
  } 
  else {
    const threadInfo = await api.getThreadInfo(threadID);
    const users = threadInfo.participantIDs.filter(id => id != senderID);

    if (users.length === 0) {
      return api.sendMessage("⚠️ No one to kick 😢", threadID, messageID);
    }

    target = users[Math.floor(Math.random() * users.length)];
    const info = await api.getUserInfo(target);
    tagName = info[target].name;
  }

  try {
    // 🔹 GET KICK GIF
    const res = await axios.get("https://api.waifu.pics/sfw/kick");
    const gifURL = res.data.url;

    // 🔹 DOWNLOAD GIF
    const buffer = (await axios.get(gifURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(path, buffer);

    // 🔹 MESSAGE WITH REAL TAG
    const body = `🦵💥 𝐔𝐒𝐓𝐀 𝐀𝐓𝐓𝐀𝐂𝐊!\n👉 ${tagName} got kicked hard 🤣🔥\n\n*Stay strong bro 😆*`;

    const msg = {
      body,
      attachment: fs.createReadStream(path),
      mentions: [{
        tag: tagName,
        id: target
      }]
    };

    api.sendMessage(msg, threadID, () => {
      fs.unlinkSync(path);
      api.setMessageReaction("😆", messageID, () => {}, true);
    }, messageID);

  } catch (e) {
    console.error(e);
    api.setMessageReaction("☹️", messageID, () => {}, true);
    api.sendMessage("❌ Failed to kick 😭", threadID, messageID);
  }
};