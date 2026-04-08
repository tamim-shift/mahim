const axios = require("axios");

const SUFFIXES = ["", "K", "M", "B", "T", "QA", "QI", "SX", "SP", "OC", "NO", "D", "UD", "DD", "TD", "QAD", "QID", "SXD", "SPD", "OCD", "NOD", "VG", "UVG", "DVG", "TVG", "QAVG", "QIVG", "SXVG", "SPVG", "OCVG", "NOVG", "TG", "UTG", "DTG", "GG"];
const SUFFIX_FORMATTED = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "D", "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Ocd", "Nod", "Vg", "Uvg", "Dvg", "Tvg", "Qavg", "Qivg", "Sxvg", "Spvg", "Ocvg", "Novg", "Tg", "Utg", "Dtg", "GG"];

const validateAndNormalize = (amountStr, multiplier = 1) => {
  const cleanStr = String(amountStr).replace(/,/g, '').trim();
  const match = cleanStr.match(/^([0-9.]+)([a-zA-Z]*)$/);
  if (!match) return { valid: false };
  let num = parseFloat(match[1]);
  let suffix = match[2].toUpperCase();
  let index = SUFFIXES.indexOf(suffix);
  if (index === -1) return { valid: false }; 
  num *= multiplier;
  while (num >= 1000 && index < SUFFIXES.length - 1) { num /= 1000; index++; }
  while (num > 0 && num < 1 && index > 0) { num *= 1000; index--; }
  num = Number(num.toFixed(2));
  return { valid: true, formatted: `${num}${SUFFIX_FORMATTED[index]}` };
};

// Required Bold Serif Font for HiLo
const toBoldNum = (num) => {
  const map = {'0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗'};
  return String(num).replace(/[0-9]/g, m => map[m] || m);
};

module.exports.config = {
  name: "hilo",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "MAHIM ISLAM",
  description: "Guess if the next number is Higher or Lower",
  commandCategory: "economy",
  usages: "[bet]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const rawBet = args[0];
    if (!rawBet) return api.sendMessage("⚠️ | 𝐄𝐧𝐭𝐞𝐫 𝐛𝐞𝐭 𝐚𝐦𝐨𝐮𝐧𝐭.", event.threadID, event.messageID);

    const betInfo = validateAndNormalize(rawBet, 1);
    if (!betInfo.valid) return api.sendMessage("⚠️ | 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭.", event.threadID, event.messageID);

    const bet = betInfo.formatted; 
    const uid = event.senderID;
    
    // Deduct bet FIRST so they can't ignore the message and keep their money
    const deductUrl = `https://mahimcraft.alwaysdata.net/economy/?type=deduct&uid=${uid}&quantity=${bet}&notes=HiLo+Bet`;
    const deductRes = await axios.get(deductUrl);
    if (deductRes.data.status !== "success") {
      return api.sendMessage(`⚠️ | ${deductRes.data.message}`, event.threadID, event.messageID);
    }

    const num1 = Math.floor(Math.random() * 100) + 1; // 1 to 100
    
    let msg = `🃏 𝐇𝐈𝐆𝐇 𝐎𝐑 𝐋𝐎𝐖 🃏\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
    msg += ` 🔢 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐍𝐮𝐦𝐛𝐞𝐫: [ ${toBoldNum(num1)} ]\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
    msg += `👉 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐰𝐢𝐭𝐡 𝐇 (𝐇𝐢𝐠𝐡𝐞𝐫) 𝐨𝐫 𝐋 (𝐋𝐨𝐰𝐞𝐫)!`;

    api.sendMessage(msg, event.threadID, (error, info) => {
      if (!error) {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          betAmount: bet,
          firstNumber: num1
        });
      }
    }, event.messageID);

  } catch (error) {
    return api.sendMessage("❌ | 𝐄𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝.", event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  try {
    if (event.senderID !== handleReply.author) return;

    const choice = event.body.trim().toUpperCase();
    if (choice !== "H" && choice !== "L") {
      return api.sendMessage("⚠️ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐨𝐧𝐥𝐲 𝐰𝐢𝐭𝐡 '𝐇' 𝐨𝐫 '𝐋'.", event.threadID, event.messageID);
    }

    const num1 = handleReply.firstNumber;
    const bet = handleReply.betAmount;
    const num2 = Math.floor(Math.random() * 100) + 1;
    const uid = event.senderID;

    let isWin = false;
    let isTie = false;

    if (num2 === num1) {
      isTie = true;
    } else if (choice === "H" && num2 > num1) {
      isWin = true;
    } else if (choice === "L" && num2 < num1) {
      isWin = true;
    }

    // Remove the listener so they can't reply twice
    const indexOfHandle = global.client.handleReply.findIndex(e => e.messageID === handleReply.messageID);
    if (indexOfHandle !== -1) global.client.handleReply.splice(indexOfHandle, 1);

    // Payout Logic
    let multiplier = 0;
    if (isWin) multiplier = 2; // 2X Profit
    if (isTie) multiplier = 1; // Refund bet

    if (multiplier > 0) {
      const payoutAmount = validateAndNormalize(bet, multiplier).formatted;
      const addUrl = `https://mahimcraft.alwaysdata.net/economy/?type=add&uid=${uid}&quantity=${payoutAmount}&notes=HiLo+Win`;
      await new Promise(resolve => setTimeout(resolve, 2000));
      await axios.get(addUrl);
    }

    // Format output
    let msg = `🃏 𝐇𝐈𝐆𝐇 𝐎𝐑 𝐋𝐎𝐖 🃏\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
    msg += ` 🔢 𝐎𝐥𝐝 𝐍𝐮𝐦𝐛𝐞𝐫: [ ${toBoldNum(num1)} ]\n`;
    msg += ` 🆕 𝐍𝐞𝐰 𝐍𝐮𝐦𝐛𝐞𝐫: [ ${toBoldNum(num2)} ]\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;

    if (isWin) {
      const profitStr = validateAndNormalize(bet, 2).formatted;
      msg += `✅ 𝐘𝐎𝐔 𝐖𝐎𝐍! (𝟐𝐗)\n➕ 💲${profitStr}`;
    } else if (isTie) {
      msg += `♻️ 𝐈𝐓'𝐒 𝐀 𝐓𝐈𝐄! (𝟏𝐗)\n➕ 💲${bet.toUpperCase()}`;
    } else {
      msg += `📛 𝐘𝐎𝐔 𝐋𝐎𝐒𝐓!\n➖ 💲${bet.toUpperCase()}`;
    }

    return api.sendMessage(msg, event.threadID, event.messageID);

  } catch (error) {
    return api.sendMessage("❌ | 𝐄𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝.", event.threadID, event.messageID);
  }
};
