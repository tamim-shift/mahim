const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "auto",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "MAHIM ISLAM",
  description: "Auto video downloader",
  commandCategory: "utility",
  usages: "send video link",
  cooldowns: 3
};

// 🔥 AUTO DETECT LINK
module.exports.handleEvent = async ({ api, event }) => {
  try {
    const body = event.body?.trim();
    if (!body || body.startsWith("auto")) return;

    // 🎯 Detect link
    if (!body.startsWith("http")) return;

    api.setMessageReaction("🔎", event.messageID, () => {}, true);

    // 🔹 API CALL
    const res = await axios.get(
      `https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(body)}`
    );

    const data = res.data?.data;
    if (!data || !data.high) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage("❌ Can't fetch video!", event.threadID, event.messageID);
    }

    api.setMessageReaction("✅", event.messageID, () => {}, true);

    // 🔹 DOWNLOAD VIDEO
    const videoBuffer = (
      await axios.get(data.high, { responseType: "arraybuffer" })
    ).data;

    const path = __dirname + "/cache/auto.mp4";
    fs.writeFileSync(path, Buffer.from(videoBuffer));

    // ✨ STYLISH SHORT MESSAGE
    const msg = {
      body: `🎬 𝐕𝐈𝐃𝐄𝐎 𝐑𝐄𝐀𝐃𝐘\n\n📌 ${data.title || "No title"}`,
      attachment: fs.createReadStream(path)
    };

    api.sendMessage(msg, event.threadID, () => {
      fs.unlinkSync(path); // cleanup
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    }, event.messageID);

  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    api.sendMessage("❌ Download failed!", event.threadID, event.messageID);
  }
};

// 🔹 COMMAND MESSAGE
module.exports.run = async ({ api, event }) => {
  api.sendMessage(
    "🎬 Send any video link (https://...) and I’ll download it 😎",
    event.threadID,
    event.messageID
  );
};