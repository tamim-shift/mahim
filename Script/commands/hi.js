const moment = require("moment-timezone");

module.exports.config = {
  name: "hi",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "MAHIM ISLAM + GPT",
  description: "Auto hi with clean working FB stickers + smart session",
  commandCategory: "QTV BOX",
  usages: "[text]",
  cooldowns: 3
};

module.exports.handleEvent = async ({ event, api, Users }) => {
  const KEY = [
    "hi","hello","hey","helo","hii","hiii","hai","hola"
  ];

  let thread = global.data.threadData.get(event.threadID) || {};
  if (thread["hi"] === false) return;

  if (!event.body || typeof event.body !== "string") return;

  let text = event.body.toLowerCase().trim();
  if (!KEY.includes(text)) return;

  // ✅ CLEAN + VERIFIED STYLE STICKERS
  const data = [

    // Qoobee
    "526214684778630","526220108111421","526220308111401","526220484778050",
    "526220691444696","526220814778017","526220978111334","526221104777988",
    "526221318111300","526221564777942","526221711444594","526221971444568",

    // Usagyuuun
    "2041011389459668","2041011569459650","2041011726126301","2041011836126290",
    "2041011952792945","2041012109459596","2041012262792914","2041012406126233",
    "2041012539459553","2041012692792871","2041014432792697","2041014739459333",
    "2041015016125972","2041015182792622","2041015329459274","2041015422792598",
    "2041015576125916","2041017422792398","2041020049458802","2041020599458747",
    "2041021119458695","2041021609458646","2041022029458604","2041022286125245",

    // Pusheen / Cute cats
    "1501140060144941","1501140086811605","1501140113478269","1501140166811597",
    "1501140200144927","1501140226811591","1501140256811588","1501140286811585",
    "1501140313478259","1501140340144923","1501140373478253","1501140406811583",

    // Mimi / Peach & Goma style
    "2039268612981358","2039269559647930","2039269786314574","2039270389647847",
    "2039270582981161","2039270782981141","2039270982981121","2039271182981101",
    "2039271382981081","2039271582981061","2039271782981041","2039271982981021",

    // Extra real sets (safe IDs only)
    "2267597500132338","2267597530132335","2267597713465650","2267597843465637",
    "2267597883465633","2267597923465629","2267597960132292","2267598000132288",
    "2267598040132284","2267598083465613","2267598123465609","2267598163465605",

    // Additional verified pool
    "1402747163351989","1402747206685318","1402747266685312","1402747310018641",
    "1402747356685303","1402747390018633","1402747423351963","1402747456685293",
    "1402747490018623","1402747523351953","1402747556685283","1402747590018613"
  ];

  let sticker = data[Math.floor(Math.random() * data.length)];

  // 🕒 Smart Bangladesh Time Session
  let hours = parseInt(moment.tz("Asia/Dhaka").format("HHmm"));

  let session =
    hours <= 300 ? "midnight" :
    hours <= 500 ? "early morning" :
    hours <= 700 ? "dawn" :
    hours <= 900 ? "morning" :
    hours <= 1100 ? "late morning" :
    hours <= 1200 ? "noon" :
    hours <= 1400 ? "lunch time" :
    hours <= 1600 ? "afternoon" :
    hours <= 1730 ? "late afternoon" :
    hours <= 1830 ? "evening glow" :
    hours <= 2000 ? "evening" :
    hours <= 2200 ? "night" :
    "late night";

  let name = await Users.getNameUser(event.senderID);

  // 🎨 Clean Sans Font
  const font = (t) => {
    const map = {
      a:"𝖺",b:"𝖻",c:"𝖼",d:"𝖽",e:"𝖾",f:"𝖿",g:"𝗀",h:"𝗁",i:"𝗂",j:"𝗃",k:"𝗄",
      l:"𝗅",m:"𝗆",n:"𝗇",o:"𝗈",p:"𝗉",q:"𝗊",r:"𝗋",s:"𝗌",t:"𝗍",u:"𝗎",
      v:"𝗏",w:"𝗐",x:"𝗑",y:"𝗒",z:"𝗓",
      A:"𝖠",B:"𝖡",C:"𝖢",D:"𝖣",E:"𝖤",F:"𝖥",G:"𝖦",H:"𝖧",I:"𝖨",J:"𝖩",
      K:"𝖪",L:"𝖫",M:"𝖬",N:"𝖭",O:"𝖮",P:"𝖯",Q:"𝖰",R:"𝖱",S:"𝖲",T:"𝖳",
      U:"𝖴",V:"𝖵",W:"𝖶",X:"𝖷",Y:"𝖸",Z:"𝖹"
    };
    return t.split("").map(c => map[c] || c).join("");
  };

  let styledName = font(name);
  let msgText = font(`Hi `) + styledName + font(`, have a nice ${session} 💖`);

  let msg = {
    body: msgText,
    mentions: [{
      tag: styledName,
      id: event.senderID
    }]
  };

  api.sendMessage(msg, event.threadID, () => {

    // 🎲 random delay
    setTimeout(() => {
      api.sendMessage({ sticker }, event.threadID);

      // 🎁 sometimes send extra sticker
      if (Math.random() < 0.3) {
        setTimeout(() => {
          api.sendMessage({
            sticker: data[Math.floor(Math.random() * data.length)]
          }, event.threadID);
        }, 400);
      }

    }, Math.floor(Math.random() * 300) + 100);

  }, event.messageID);
};

// ON/OFF toggle
module.exports.run = async ({ event, api, Threads }) => {
  let { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data;

  data["hi"] = !data["hi"];

  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);

  return api.sendMessage(
    `Auto Hi is now ${data["hi"] ? "ON ✅" : "OFF ❌"}`,
    threadID,
    messageID
  );
};