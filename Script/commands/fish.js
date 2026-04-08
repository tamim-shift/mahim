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
  while (num >= 1000 && index < SUFFIXES.length - 1) { num /= 1000; index++; }
  while (num > 0 && num < 1 && index > 0) { num *= 1000; index--; }
  num = Number(num.toFixed(2));
  return { valid: true, formatted: `${num}${SUFFIX_FORMATTED[index]}` };
};

// Loot Table (Exactly 50% Trash, 50% Fish)
const LOOT_TABLE = [
  // --- 50% TRASH (0X MULTIPLIER) ---
  { name: "𝐓𝐀𝐍𝐆𝐋𝐄𝐃 𝐒𝐄𝐀𝐖𝐄𝐄𝐃", emoji: "🌿", multi: 0, chance: 15 },
  { name: "𝐎𝐋𝐃 𝐁𝐎𝐎𝐓", emoji: "🥾", multi: 0, chance: 10 },
  { name: "𝐑𝐔𝐒𝐓𝐘 𝐂𝐀𝐍", emoji: "🥫", multi: 0, chance: 10 },
  { name: "𝐏𝐋𝐀𝐒𝐓𝐈𝐂 𝐁𝐀𝐆", emoji: "🛍️", multi: 0, chance: 10 },
  { name: "𝐃𝐑𝐈𝐅𝐓𝐖𝐎𝐎𝐃", emoji: "🪵", multi: 0, chance: 5 },

  // --- 50% FISH (1X to 25X MULTIPLIER) ---
  { name: "𝐓𝐈𝐍𝐘 𝐒𝐇𝐑𝐈𝐌𝐏", emoji: "🦐", multi: 1, chance: 20 },
  { name: "𝐂𝐎𝐌𝐌𝐎𝐍 𝐂𝐀𝐑𝐏", emoji: "🐟", multi: 1.5, chance: 12 },
  { name: "𝐑𝐀𝐑𝐄 𝐏𝐔𝐅𝐅𝐄𝐑𝐅𝐈𝐒𝐇", emoji: "🐡", multi: 2, chance: 8 },
  { name: "𝐁𝐋𝐔𝐄 𝐌𝐀𝐑𝐋𝐈𝐍", emoji: "🐠", multi: 3, chance: 5 },
  { name: "𝐆𝐈𝐀𝐍𝐓 𝐒𝐐𝐔𝐈𝐃", emoji: "🦑", multi: 5, chance: 3 },
  { name: "𝐆𝐑𝐄𝐀𝐓 𝐖𝐇𝐈𝐓𝐄 𝐒𝐇𝐀𝐑𝐊", emoji: "🦈", multi: 10, chance: 1.5 },
  { name: "𝐌𝐘𝐓𝐇𝐈𝐂𝐀𝐋 𝐋𝐄𝐕𝐈𝐀𝐓𝐇𝐀𝐍", emoji: "🐉", multi: 25, chance: 0.5 }
];

module.exports.config = {
  name: "fish",
  version: "1.1.0",
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

    // Realistic RNG Algorithm
    const roll = Math.random() * 100;
    let cumulativeChance = 0;
    let catchResult = LOOT_TABLE[0]; // Fallback

    for (const item of LOOT_TABLE) {
      cumulativeChance += item.chance;
      if (roll <= cumulativeChance) {
        catchResult = item;
        break;
      }
    }

    const multiplier = catchResult.multi;

    // Payout
    if (multiplier > 0) {
      // 1X payout refunds the original deduction + profit
      // Note: Because the user inputs the bet, a 1.5x multi means 1.5 * bet added back.
      const payoutAmount = validateAndNormalize(bet, multiplier).formatted;
      const addUrl = `https://mahimcraft.alwaysdata.net/economy/?type=add&uid=${uid}&quantity=${payoutAmount}&notes=Fish+Win`;
      await new Promise(resolve => setTimeout(resolve, 2000));
      await axios.get(addUrl);
    }

    // Format output
    let msg = `🎣 𝐃𝐄𝐄𝐏 𝐒𝐄𝐀 𝐅𝐈𝐒𝐇𝐈𝐍𝐆 🎣\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
    msg += ` 🌊 𝘠𝘰𝘶 𝘤𝘢𝘴𝘵 𝘺𝘰𝘶𝘳 𝘭𝘪𝘯𝘦...\n`;
    msg += ` ${catchResult.emoji} 𝐘𝐨𝐮 𝐜𝐚𝐮𝐠𝐡𝐭: ${catchResult.name}!\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;

    if (multiplier > 1) {
      const profitStr = validateAndNormalize(bet, multiplier).formatted;
      msg += `🎉 𝐀𝐌𝐀𝐙𝐈𝐍𝐆 𝐂𝐀𝐓𝐂𝐇! (${multiplier}𝐗)\n➕ 💲${profitStr}`;
    } else if (multiplier === 1) {
      msg += `♻️ 𝐁𝐑𝐄𝐀𝐊 𝐄𝐕𝐄𝐍! (𝟏𝐗)\n➕ 💲${bet.toUpperCase()}`;
    } else {
      msg += `📛 𝐓𝐑𝐀𝐒𝐇 𝐂𝐀𝐓𝐂𝐇!\n➖ 💲${bet.toUpperCase()}`;
    }

    return api.sendMessage(msg, event.threadID, event.messageID);

  } catch (error) {
    return api.sendMessage("❌ | 𝐄𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝.", event.threadID, event.messageID);
  }
};
