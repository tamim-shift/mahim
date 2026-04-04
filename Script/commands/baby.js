const axios = require("axios");
const simsim = "https://simsimi.cyberbot.top";

const singleTriggers = [
  "baby", "bby", "pakhi", "jan", "xan", "babu", "bb", "sona", "janu", "jaan",
  "bebu", "babe", "babyy", "botu", "বেবি", "বেবী", "বট", "জান", "জানু",
  "সোনা", "বাবু", "বেবু", "বাবাই", "জানুু"
];

const prefixTriggers = [
  "baby", "bby", "jan", "xan", "babu", "bb", "sona", "janu", "jaan",
  "bebu", "babe", "babyy", "botu", "বেবি", "বেবী", "বট", "জান", "জানু",
  "সোনা", "বাবু", "বেবু", "বাবাই", "জানুু"
];

const greetings = [
  "বলো বেবি 💬", "হুম? বলো 😺", "হ্যাঁ জানু 😚", "শুনছি বেবি 😘", "এত ডাকাডাকি করো না, লজ্জা পাই তো 🙈",     
  "বেশি bot Bot করলে leave নিবো কিন্তু😒😒 " , "শুনবো না😼তুমি আমাকে প্রেম করাই দাও নাই🥺পচা তুমি🥺", 
  "আমি আবাল দের সাথে কথা বলি না,ok😒" , "এতো ডেকো না,প্রেম এ পরে যাবো তো🙈", 
  "Bolo Babu, তুমি কি আমাকে ভালোবাসো? 🙈💋 ", "বার বার ডাকলে মাথা গরম হয়ে যায় কিন্তু😑", 
  "হ্যা বলো😒, তোমার জন্য কি করতে পারি😐😑?", "এতো ডাকছিস কেন?গালি শুনবি নাকি? 🤬"
];

module.exports.config = {
  name: "baby",
  version: "1.0.8",
  hasPermssion: 0,
  credits: "Modified by ChatGPT",
  description: "Cute AI Baby Chatbot with funny Bangla replies",
  commandCategory: "simsim",
  usages: "[message/query]",
  cooldowns: 0,
  prefix: false
};

// 🛠️ FAILSAFE API SENDER
async function fetchAndSendSimSimi(api, event, text, senderName) {
  try {
    const res = await axios.get(
      `${simsim}/simsimi?text=${encodeURIComponent(text)}&senderName=${encodeURIComponent(senderName)}`
    );

    if (!res || !res.data || !res.data.response) {
       return api.sendMessage("🍒 [API Error]: No response received from server.", event.threadID, event.messageID);
    }

    const responses = Array.isArray(res.data.response)
      ? res.data.response
      : [res.data.response];

    for (const reply of responses) {
      if (!reply) continue; 
      // 🚀 Removed the Promise wrapper to prevent FCA hanging bugs
      api.sendMessage(reply, event.threadID, event.messageID);
    }
  } catch (error) {
    console.error("SimSimi API Error:", error.message);
    api.sendMessage(`🍒 [API Error]: ${error.message}`, event.threadID, event.messageID);
  }
}

module.exports.run = async function ({ api, event, args, Users }) {
  try {
    const uid = event.senderID;
    const senderName = (Users && typeof Users.getNameUser === "function") ? await Users.getNameUser(uid) : "User";
    const rawQuery = args.join(" ");
    const query = rawQuery.toLowerCase().trim();

    if (!query) {
      const r = greetings[Math.floor(Math.random() * greetings.length)];
      return api.sendMessage(r, event.threadID, event.messageID);
    }

    const command = (args[0] || "").toLowerCase();

    if (["remove", "rm"].includes(command)) {
      const parts = rawQuery.replace(/^(remove|rm)\s*/i, "").split(" - ");
      if (parts.length < 2) return api.sendMessage("🍓 Use: remove [Question] - [Reply]", event.threadID, event.messageID);
      const res = await axios.get(`${simsim}/delete?ask=${encodeURIComponent(parts[0].trim())}&ans=${encodeURIComponent(parts[1].trim())}`);
      return api.sendMessage(res.data.message, event.threadID, event.messageID);
    }

    if (command === "list") {
      const res = await axios.get(`${simsim}/list`);
      return api.sendMessage(`🍒 Total Questions: ${res.data.totalQuestions}\n🍓 Total Replies: ${res.data.totalReplies}`, event.threadID, event.messageID);
    }

    if (command === "teach") {
      const parts = rawQuery.replace(/^teach\s*/i, "").split(" - ");
      if (parts.length < 2) return api.sendMessage("🍓 Use: teach [Question] - [Reply]", event.threadID, event.messageID);
      const teachUrl = `${simsim}/teach?ask=${encodeURIComponent(parts[0].trim())}&ans=${encodeURIComponent(parts[1].trim())}&senderID=${uid}&senderName=${encodeURIComponent(senderName)}&groupID=${event.threadID}`;
      const res = await axios.get(teachUrl);
      return api.sendMessage(`${res.data.message || "Reply added!"}`, event.threadID, event.messageID);
    }

    await fetchAndSendSimSimi(api, event, query, senderName);

  } catch (err) {
    console.error(err);
  }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  try {
    if (!event.body) return;
    const msg = event.body.toLowerCase().trim();
    if (!msg) return;

    const botID = api.getCurrentUserID();
    if (event.senderID == botID) return; // Ignore self

    const senderName = (Users && typeof Users.getNameUser === "function") ? await Users.getNameUser(event.senderID) : "User";

    // 1. EXACT Match ("baby")
    if (singleTriggers.includes(msg)) {
      const randomReply = greetings[Math.floor(Math.random() * greetings.length)];
      return api.sendMessage({
        body: `${randomReply} @${senderName}`,
        mentions: [{ tag: `@${senderName}`, id: event.senderID }]
      }, event.threadID, event.messageID);
    }

    let shouldReply = false;
    let query = msg;

    // 2. REPLY TO BOT Detection (More aggressive check)
    if (event.messageReply && event.messageReply.senderID == botID) {
      if (global.client && global.client.handleReply && Array.isArray(global.client.handleReply)) {
        const isPending = global.client.handleReply.some(item => item.messageID == event.messageReply.messageID);
        if (isPending) return; // Let active commands handle it
      }
      shouldReply = true;
    } 
    // 3. TRIGGER WORD ANYWHERE Detection
    else {
      let matchedTrigger = null;
      for (const trigger of prefixTriggers) {
        const regex = new RegExp(`(^|[\\s,.?!])${trigger}([\\s,.?!]|$)`, 'i');
        if (regex.test(msg)) {
          matchedTrigger = trigger;
          break;
        }
      }

      if (matchedTrigger) {
        shouldReply = true;
        const removeRegex = new RegExp(`(^|[\\s,.?!])${matchedTrigger}([\\s,.?!]|$)`, 'gi');
        query = query.replace(removeRegex, ' ').trim();
        if (!query) query = matchedTrigger; 
      }
    }

    if (shouldReply) {
      await fetchAndSendSimSimi(api, event, query, senderName);
    }

  } catch (err) {
    console.error("🍃 handleEvent Error:", err.message);
  }
};
