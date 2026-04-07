module.exports.config = {
  name: "hi",
  version: "1.0.7",
  hasPermssion: 0,
  credits: "MAHIM ISLAM",
  description: "hi sticker with dynamic sessions, custom font, and working FB stickers",
  commandCategory: "QTV BOX",
  usages: "[text]",
  cooldowns: 5
};

module.exports.handleEvent = async ({ event, api, Users }) => {
  let KEY = [ 
    "hello", "hi", "hai", "hola", "nî hâo", "hí", "híí", "hì", "hìì", "hiii", "hii", "helo", "hey"
  ];
  
  let thread = global.data.threadData.get(event.threadID) || {};
  // If the group has explicitly turned it off, do nothing. Fixes comma bug.
  if (thread["hi"] === false) return;
  
  // Safety check to ensure event.body exists and is a string
  if (event.body && typeof event.body === "string") {
    let text = event.body.toLowerCase().trim();
    
    if (KEY.includes(text)) {
      
      let data = [
        // Your original working IDs
        "526214684778630", "526220108111421", "526220308111401", "526220484778050",
        "526220691444696", "526220814778017", "526220978111334", "526221104777988",
        "526221318111300", "526221564777942", "526221711444594", "526221971444568",
        "2041011389459668", "2041011569459650", "2041011726126301", "2041011836126290", 
        "2041011952792945", "2041012109459596", "2041012262792914", "2041012406126233", 
        "2041012539459553", "2041012692792871", "2041014432792697", "2041014739459333", 
        "2041015016125972", "2041015182792622", "2041015329459274", "2041015422792598", 
        "2041015576125916", "2041017422792398", "2041020049458802", "2041020599458747", 
        "2041021119458695", "2041021609458646", "2041022029458604", "2041022286125245",
        
        // Added pure FB cute stickers (Qoobee, Pusheen, Usagyuuun, Mimi)
        "1501140060144941", "1501140086811605", "1501140113478269", "1501140166811597",
        "1402747163351989", "1402747206685318", "1402747266685312", "1402747310018641",
        "2267597500132338", "2267597530132335", "2267597713465650", "2267597843465637",
        "2039268612981358", "2039269559647930", "2039269786314574", "2039270389647847"
      ];
      
      let sticker = data[Math.floor(Math.random() * data.length)];
      
      let moment = require("moment-timezone");
      // Use Asia/Dhaka for Bangladesh time
      let hours = parseInt(moment.tz('Asia/Dhaka').format('HHmm'));
      
      // Expanded Bangladesh Time Sessions
      let session = (
        hours >= 0 && hours <= 300 ? "midnight" :
        hours > 300 && hours <= 500 ? "early morning" :
        hours > 500 && hours <= 700 ? "dawn" :
        hours > 700 && hours <= 900 ? "morning" :
        hours > 900 && hours <= 1100 ? "late morning" :
        hours > 1100 && hours <= 1200 ? "noon" :
        hours > 1200 && hours <= 1400 ? "lunch" :
        hours > 1400 && hours <= 1600 ? "afternoon" :
        hours > 1600 && hours <= 1730 ? "late afternoon" :
        hours > 1730 && hours <= 1830 ? "gloaming" :
        hours > 1830 && hours <= 2000 ? "evening" :
        hours > 2000 && hours <= 2200 ? "night" :
        hours > 2200 && hours <= 2359 ? "late night" :
        "time"
      );
      
      let name = await Users.getNameUser(event.senderID);

      // Exact Regular Sans-Serif font mapper
      const toSansSerif = (text) => {
        const map = {
          'a': '𝖺', 'b': '𝖻', 'c': '𝖼', 'd': '𝖽', 'e': '𝖾', 'f': '𝖿', 'g': '𝗀', 'h': '𝗁', 'i': '𝗂', 'j': '𝗃', 'k': '𝗄', 'l': '𝗅', 'm': '𝗆', 'n': '𝗇', 'o': '𝗈', 'p': '𝗉', 'q': '𝗊', 'r': '𝗋', 's': '𝗌', 't': '𝗍', 'u': '𝗎', 'v': '𝗏', 'w': '𝗐', 'x': '𝗑', 'y': '𝗒', 'z': '𝗓',
          'A': '𝖠', 'B': '𝖡', 'C': '𝖢', 'D': '𝖣', 'E': '𝖤', 'F': '𝖥', 'G': '𝖦', 'H': '𝖧', 'I': '𝖨', 'J': '𝖩', 'K': '𝖪', 'L': '𝖫', 'M': '𝖬', 'N': '𝖭', 'O': '𝖮', 'P': '𝖯', 'Q': '𝖰', 'R': '𝖱', 'S': '𝖲', 'T': '𝖳', 'U': '𝖴', 'V': '𝖵', 'W': '𝖶', 'X': '𝖷', 'Y': '𝖸', 'Z': '𝖹',
          '0': '𝟢', '1': '𝟣', '2': '𝟤', '3': '𝟥', '4': '𝟦', '5': '𝟧', '6': '𝟨', '7': '𝟩', '8': '𝟪', '9': '𝟫'
        };
        return text.split('').map(char => map[char] || char).join('');
      };

      let taggedName = toSansSerif(name);
      let msgText = toSansSerif(`Hi `) + taggedName + toSansSerif(`, have a good ${session}`);
      
      let mentions = [];
      mentions.push({
        tag: taggedName, 
        id: event.senderID
      });
      
      let msg = {
        body: msgText,
        mentions
      };
      
      api.sendMessage(msg, event.threadID, (e, info) => {
        setTimeout(() => {
          api.sendMessage({sticker: sticker}, event.threadID);
        }, 100);
      }, event.messageID);
    }
  }
};

// Removed Vietnamese language, keeping English
module.exports.languages = {
  "en": {
    "on": "Auto-Hi is now ON",
    "off": "Auto-Hi is now OFF",
    "successText": "successfully!",
  }
};

module.exports.run = async ({ event, api, Threads, getText }) => {
  let { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data;
  if (typeof data["hi"] == "undefined" || data["hi"] == true) data["hi"] = false;
  else data["hi"] = true;
  await Threads.setData(threadID, {
    data
  });
  global.data.threadData.set(threadID, data);
  return api.sendMessage(`${(data["hi"] == false) ? getText("off") : getText("on")} ${getText("successText")}`, threadID, messageID);
};
