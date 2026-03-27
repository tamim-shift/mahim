const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// 🔗 BASE API CACHE
let BASE_API = null;
const getBaseApi = async () => {
  try {
    if (BASE_API) return BASE_API;
    const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    BASE_API = res.data.mahmud;
    return BASE_API;
  } catch {
    return null;
  }
};

module.exports.config = {
  name: "hack",
  version: "7.0.0",
  hasPermssion: 0,
  credits: "Mahim Islam",
  description: "Hack prank with reaction animation 😈",
  commandCategory: "fun",
  usages: "@tag / reply / uid",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID, messageReply, mentions } = event;

  const cachePath = path.join(__dirname, "cache");
  await fs.ensureDir(cachePath);
  const filePath = path.join(cachePath, `hack_${Date.now()}.png`);

  try {
    // 🎯 TARGET
    let targetID = senderID;

    if (messageReply?.senderID) {
      targetID = messageReply.senderID;
    } else if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args[0] && !isNaN(args[0])) {
      targetID = args[0];
    }

    // 👤 NAME
    let name = "User";
    try {
      const info = await api.getUserInfo(targetID);
      name = info[targetID]?.name || "User";
    } catch {}

    // ⏳ LOADING REACTION
    api.setMessageReaction("⏳", messageID, () => {}, true);

    await new Promise(r => setTimeout(r, 1500));

    // ⚙️ PROCESSING REACTION
    api.setMessageReaction("⚙️", messageID, () => {}, true);

    // 🌐 API CALL
    const baseApi = await getBaseApi();
    if (!baseApi) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ API server not available!", threadID, messageID);
    }

    const apiUrl = `${baseApi}/api/hack?id=${encodeURIComponent(targetID)}&name=${encodeURIComponent(name)}`;

    const res = await axios.get(apiUrl, {
      responseType: "arraybuffer",
      timeout: 20000
    });

    await fs.writeFile(filePath, Buffer.from(res.data));

    // ✅ DONE REACTION
    api.setMessageReaction("✅", messageID, () => {}, true);

    // 🖼️ SEND RESULT
    return api.sendMessage(
      {
        body: `💻 Hacking Successful 😈\n👤 Target: ${name}`,
        attachment: fs.createReadStream(filePath)
      },
      threadID,
      () => fs.unlinkSync(filePath),
      messageID
    );

  } catch (err) {
    console.error(err);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // ❌ ERROR REACTION
    api.setMessageReaction("❌", messageID, () => {}, true);

    return api.sendMessage(
      "❌ Hack failed!",
      threadID,
      messageID
    );
  }
};