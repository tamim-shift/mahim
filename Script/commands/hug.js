module.exports.config = {
  name: "hug",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Mahim Islam",
  description: "Give a virtual hug to your friend 🤗",
  commandCategory: "fun",
  usages: "hug @user / reply / auto",
  cooldowns: 5,
};

module.exports.run = async ({ api, event }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = __dirname + "/cache/hug.gif";

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
      return api.sendMessage("⚠️ No one to hug 😢", threadID, messageID);
    }

    target = users[Math.floor(Math.random() * users.length)];
    const info = await api.getUserInfo(target);
    tagName = info[target].name;
  }

  try {
    // 🔹 GET HUG GIF
    const res = await axios.get("https://api.waifu.pics/sfw/hug");
    const gifURL = res.data.url;

    // 🔹 DOWNLOAD GIF
    const buffer = (await axios.get(gifURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(path, buffer);

    // 🔹 MESSAGE WITH REAL TAG
    const body = `🤗💖 𝐇𝐔𝐆 𝐓𝐈𝐌𝐄!\n👉 ${tagName}, you got a warm hug from your friend!\n\n*Feeling cozy already 😆*`;

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
      api.setMessageReaction("🥰", messageID, () => {}, true);
    }, messageID);

  } catch (e) {
    console.error(e);
    api.setMessageReaction("☹️", messageID, () => {}, true);
    api.sendMessage("❌ Failed to hug 😭", threadID, messageID);
  }
};