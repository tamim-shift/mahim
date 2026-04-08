const axios = require("axios");

// Allowed suffixes mapped in order (Up to GG / Googol)
const SUFFIXES = [
  "", "K", "M", "B", "T", "QA", "QI", "SX", "SP", "OC", "NO", "D", 
  "UD", "DD", "TD", "QAD", "QID", "SXD", "SPD", "OCD", "NOD", "VG", 
  "UVG", "DVG", "TVG", "QAVG", "QIVG", "SXVG", "SPVG", "OCVG", "NOVG", 
  "TG", "UTG", "DTG", "GG"
];

const SUFFIX_FORMATTED = [
  "", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "D", 
  "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Ocd", "Nod", "Vg", 
  "Uvg", "Dvg", "Tvg", "Qavg", "Qivg", "Sxvg", "Spvg", "Ocvg", "Novg", 
  "Tg", "Utg", "Dtg", "GG"
];

// Smart Math & Validation Engine
const validateAndNormalize = (amountStr, multiplier = 1) => {
  const cleanStr = String(amountStr).replace(/,/g, '').trim();
  const match = cleanStr.match(/^([0-9.]+)([a-zA-Z]*)$/);
  
  if (!match) return { valid: false };
  
  let num = parseFloat(match[1]);
  let suffix = match[2].toUpperCase();
  
  let index = SUFFIXES.indexOf(suffix);
  if (index === -1) return { valid: false }; 
  
  num *= multiplier;
  
  while (num >= 1000 && index < SUFFIXES.length - 1) {
    num /= 1000;
    index++;
  }
  
  while (num > 0 && num < 1 && index > 0) {
    num *= 1000;
    index--;
  }
  
  num = Number(num.toFixed(2));
  
  return { 
    valid: true, 
    formatted: `${num}${SUFFIX_FORMATTED[index]}` 
  };
};

// Helper to convert numbers to bold unicode (supports decimals)
const toBoldNum = (num) => {
  const map = {'0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗', '.':'.'};
  return String(num).replace(/[0-9]/g, m => map[m] || m);
};

module.exports.config = {
  name: "crash",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "MAHIM ISLAM",
  description: "Play the Rocket Crash game",
  commandCategory: "economy",
  usages: "[amount] [target_multiplier]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const rawBet = args[0];
    const rawTarget = parseFloat(args[1]);

    if (!rawBet || isNaN(rawTarget) || rawTarget <= 1.0) {
      const usageMsg = `⚠️ | 𝐔𝐬𝐚𝐠𝐞: .𝐜𝐫𝐚𝐬𝐡 [𝐚𝐦𝐨𝐮𝐧𝐭] [𝐭𝐚𝐫𝐠𝐞𝐭]\n💡 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: .𝐜𝐫𝐚𝐬𝐡 𝟓𝟎𝟎𝐊 𝟐.𝟓`;
      return api.sendMessage(usageMsg, event.threadID, event.messageID);
    }

    // Validate and format the user's bet
    const betInfo = validateAndNormalize(rawBet, 1);
    if (!betInfo.valid) {
      return api.sendMessage("⚠️ | 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐭𝐲𝐩𝐞! 𝐏𝐥𝐞𝐚𝐬𝐞 𝐮𝐬𝐞 𝐯𝐚𝐥𝐢𝐝 𝐬𝐮𝐟𝐟𝐢𝐱𝐞𝐬 (𝐞.𝐠., 𝐊, 𝐌, 𝐁).", event.threadID, event.messageID);
    }

    const bet = betInfo.formatted; 
    const uid = event.senderID;
    
    // Step 1: Deduct the bet FIRST
    const deductUrl = `https://mahimcraft.alwaysdata.net/economy/?type=deduct&uid=${uid}&quantity=${bet}&notes=Crash+Bet`;
    const deductRes = await axios.get(deductUrl);
    
    if (deductRes.data.status !== "success") {
      return api.sendMessage(`⚠️ | ${deductRes.data.message}`, event.threadID, event.messageID);
    }

    // Step 2: Realistic Crash Algorithm
    // This creates a realistic curve: many 1.1x - 2.0x crashes, rare 10x+ crashes.
    const r = Math.random();
    let crashPoint = 0.95 / r; 
    
    if (crashPoint < 1.0) crashPoint = 1.0; // Instant crash mechanic
    if (crashPoint > 100.0) crashPoint = 100.0; // Hard cap at 100x so economy doesn't break
    
    crashPoint = Number(crashPoint.toFixed(2));
    const targetPoint = Number(rawTarget.toFixed(2));

    const isWin = targetPoint <= crashPoint;

    // Step 3: Smart Winnings Payout
    if (isWin) {
      // The payout is exactly their bet * their chosen target
      const payoutAmount = validateAndNormalize(bet, targetPoint).formatted;
      
      const addUrl = `https://mahimcraft.alwaysdata.net/economy/?type=add&uid=${uid}&quantity=${payoutAmount}&notes=Crash+Win`;
      
      // DELAY 2 seconds to ensure database writes safely
      await new Promise(resolve => setTimeout(resolve, 2000));
      const addRes = await axios.get(addUrl);
      
      if (addRes.data.status !== "success") {
        return api.sendMessage(`⚠️ | 𝐄𝐫𝐫𝐨𝐫 𝐚𝐝𝐝𝐢𝐧𝐠 𝐰𝐢𝐧𝐧𝐢𝐧𝐠𝐬: ${addRes.data.message}`, event.threadID, event.messageID);
      }
    }

    // Step 4: Formatting the NARROW mobile-friendly output
    const targetBold = toBoldNum(targetPoint.toFixed(2));
    const crashBold = toBoldNum(crashPoint.toFixed(2));
    const profitAmountStr = validateAndNormalize(bet, targetPoint).formatted;

    let msg = `🚀 𝐂𝐑𝐀𝐒𝐇 𝐆𝐀𝐌𝐄 🚀\n`;
    msg += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
    msg += ` 🎯 𝐓𝐚𝐫𝐠𝐞𝐭: [ ${targetBold}𝐱 ]\n`;
    msg += ` 💥 𝐂𝐫𝐚𝐬𝐡𝐞𝐝: [ ${crashBold}𝐱 ]\n`;
    msg += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
    
    if (isWin) {
      msg += `✅ 𝐂𝐀𝐒𝐇𝐄𝐃 𝐎𝐔𝐓!\n➕ 💲${profitAmountStr}`;
    } else {
      msg += `📛 𝐑𝐎𝐂𝐊𝐄𝐓 𝐁𝐋𝐄𝐖 𝐔𝐏!\n➖ 💲${bet.toUpperCase()}`;
    }

    return api.sendMessage(msg, event.threadID, event.messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ | 𝐄𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝.", event.threadID, event.messageID);
  }
};
