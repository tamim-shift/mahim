const axios = require("axios");

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

// Loot Table (Pure Profit values)
const LOOT_TABLE = [
  // --- TRASH (Loss, -1X Profit) ---
  { name: "𝐓𝐀𝐍𝐆𝐋𝐄𝐃 𝐒𝐄𝐀𝐖𝐄𝐄𝐃", emoji: "🌿", pureProfit: -1, chance: 15 },
  { name: "𝐎𝐋𝐃 𝐁𝐎𝐎𝐓", emoji: "🥾", pureProfit: -1, chance: 10 },
  { name: "𝐑𝐔𝐒𝐓𝐘 𝐂𝐀𝐍", emoji: "🥫", pureProfit: -1, chance: 10 },
  { name: "𝐏𝐋𝐀𝐒𝐓𝐈𝐂 𝐁𝐀𝐆", emoji: "🛍️", pureProfit: -1, chance: 10 },
  { name: "𝐃𝐑𝐈𝐅𝐓𝐖𝐎𝐎𝐃", emoji: "🪵", pureProfit: -1, chance: 5 },

  // --- FISH (Break Even or Pure Profit) ---
  { name: "𝐓𝐈𝐍𝐘 𝐒𝐇𝐑𝐈𝐌𝐏", emoji: "🦐", pureProfit: 0, chance: 20 }, // 0 = Break even
  { name: "𝐂𝐎𝐌𝐌𝐎𝐍 𝐂𝐀𝐑𝐏", emoji: "🐟", pureProfit: 1.5, chance: 12 },
  { name: "𝐑𝐀𝐑𝐄 𝐏𝐔𝐅𝐅𝐄𝐑𝐅𝐈𝐒𝐇", emoji: "🐡", pureProfit: 2, chance: 8 },
  { name: "𝐁𝐋𝐔𝐄 𝐌𝐀𝐑𝐋𝐈𝐍", emoji: "🐠", pureProfit: 3, chance: 5 },
  { name: "𝐆𝐈𝐀𝐍𝐓 𝐒𝐐𝐔𝐈𝐃", emoji: "🦑", pureProfit: 5, chance: 3 },
  { name: "𝐆𝐑𝐄𝐀𝐓 𝐖𝐇𝐈𝐓𝐄 𝐒𝐇𝐀𝐑𝐊", emoji: "🦈", pureProfit: 10, chance: 1.5 },
  { name: "𝐌𝐘𝐓𝐇𝐈𝐂𝐀𝐋 𝐋𝐄𝐕𝐈𝐀𝐓𝐇𝐀𝐍", emoji: "🐉", pureProfit: 25, chance: 0.5 }
];

module.exports.config = {
  name: "fish",
  version: "1.1.1",
  hasPermssion: 0,
  credits: "MAHIM ISLAM",
  description: "Go deep sea fishing (50% Win/Loss Chance)",
  commandCategory: "economy",
  usages: "[bet]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const rawBet = args[0];
    if (!rawBet) return api.sendMessage("⚠️ | 𝐄𝐧𝐭𝐞𝐫 𝐛𝐚𝐢𝐭 𝐜𝐨𝐬𝐭 (𝐛𝐞𝐭).", event.threadID, event.messageID);

    const betInfo = validateAndNormalize(rawBet, 1);
    if (!betInfo.valid) return api.sendMessage("⚠️ | 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭.", event.threadID, event.messageID);

    const bet = betInfo.formatted; 
    const uid = event.senderID;
    
    // Deduct bet first
    const deductUrl = `https://mahimcraft.alwaysdata.net/economy/?type=deduct&uid=${uid}&quantity=${bet}&notes=Fish+Bet`;
    const deductRes = await axios.get(deductUrl);
    if (deductRes.data.status !== "success") {
      return api.sendMessage(`⚠️ | ${deductRes.data.message}`, event.threadID, event.messageID);
    }

    const roll = Math.random() * 100;
    let cumulativeChance = 0;
    let catchResult = LOOT_TABLE[0]; 

    for (const item of LOOT_TABLE) {
      cumulativeChance += item.chance;
      if (roll <= cumulativeChance) {
        catchResult = item;
        break;
      }
    }

    const pureProfit = catchResult.pureProfit;
    let addMultiplier = 0;

    // --- PURE PROFIT LOGIC FIXED ---
    if (pureProfit === 0) {
      addMultiplier = 1; // Add 1X just to refund the deduction (Break even)
    } else if (pureProfit > 0) {
      addMultiplier = pureProfit + 1; // Add the refund (1X) + the pure profit
    }

    if (addMultiplier > 0) {
      const payoutAmount = validateAndNormalize(bet, addMultiplier).formatted;
      const addUrl = `https://mahimcraft.alwaysdata.net/economy/?type=add&uid=${uid}&quantity=${payoutAmount}&notes=Fish+Win`;
      await new Promise(resolve => setTimeout(resolve, 2000));
      await axios.get(addUrl);
    }

    let msg = `🎣 𝐃𝐄𝐄𝐏 𝐒𝐄𝐀 𝐅𝐈𝐒𝐇𝐈𝐍𝐆 🎣\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
    msg += ` 🌊 𝘠𝘰𝘶 𝘤𝘢𝘴𝘵 𝘺𝘰𝘶𝘳 𝘭𝘪𝘯𝘦...\n`;
    msg += ` ${catchResult.emoji} 𝐘𝐨𝐮 𝐜𝐚𝐮𝐠𝐡𝐭: ${catchResult.name}!\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;

    if (pureProfit > 0) {
      const profitStr = validateAndNormalize(bet, pureProfit).formatted;
      msg += `🎉 𝐀𝐌𝐀𝐙𝐈𝐍𝐆 𝐂𝐀𝐓𝐂𝐇! (${pureProfit}𝐗)\n➕ 💲${profitStr}`;
    } else if (pureProfit === 0) {
      msg += `♻️ 𝐁𝐑𝐄𝐀𝐊 𝐄𝐕𝐄𝐍! (𝟏𝐗)\n➕ 💲${bet.toUpperCase()}`;
    } else {
      msg += `📛 𝐓𝐑𝐀𝐒𝐇 𝐂𝐀𝐓𝐂𝐇!\n➖ 💲${bet.toUpperCase()}`;
    }

    return api.sendMessage(msg, event.threadID, event.messageID);

  } catch (error) {
    return api.sendMessage("❌ | 𝐄𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝.", event.threadID, event.messageID);
  }
};
