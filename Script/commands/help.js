module.exports.config = {
    name: "help",
    version: "6.0.0",
    hasPermssion: 0,
    credits: "MAHIM ISLAM",
    description: "Bold aesthetic help menu with typing",
    commandCategory: "system",
    usages: "[command]",
    cooldowns: 5,
    envConfig: {
        autoUnsend: true,
        delayUnsend: 30
    }
};

// 🔥 smart send with typing
function sendWithTyping(api, threadID, message, messageID) {
    const delay = Math.min(Math.max(message.length * 15, 800), 2500); // 0.8s → 2.5s

    api.sendTypingIndicator(threadID, true);

    setTimeout(() => {
        api.sendTypingIndicator(threadID, false);

        api.sendMessage(message, threadID, (err, info) => {
            setTimeout(() => api.unsendMessage(info.messageID), 30000);
        }, messageID);

    }, delay);
}

module.exports.handleEvent = function ({ api, event }) {
    const { commands } = global.client;
    const { threadID, messageID, body } = event;

    if (!body || !body.startsWith("help")) return;

    const args = body.trim().split(/\s+/);
    if (args.length < 2) return;

    const cmd = commands.get(args[1].toLowerCase());
    if (!cmd) return;

    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    const prefix = threadSetting.PREFIX || global.config.PREFIX;

    const msg =
`🍒 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 🍓

✦ ${cmd.config.name}
│ ${cmd.config.description}
│ 𝗨𝘀𝗲: ${prefix}${cmd.config.name} ${cmd.config.usages || ""}
│ 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${cmd.config.commandCategory}
│ 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: ${cmd.config.cooldowns}s

‧₊˚🩰🍃`;

    return sendWithTyping(api, threadID, msg, messageID);
};

module.exports.run = function ({ api, event, args }) {
    const { commands } = global.client;
    const { threadID, messageID } = event;

    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    const prefix = threadSetting.PREFIX || global.config.PREFIX;

    const cmd = commands.get((args[0] || "").toLowerCase());

    // ✨ ALL COMMANDS
    if (args[0] === "all") {
        const group = {};

        for (const c of commands.values()) {
            const cat = c.config.commandCategory || "other";
            if (!group[cat]) group[cat] = [];
            group[cat].push(`✦ ${c.config.name}`);
        }

        let msg = `🍒 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 🍓\n\n`;

        for (const g in group) {
            msg += `‧₊˚🩰 ${g}\n${group[g].join("  ")}\n\n`;
        }

        msg += `🍃 𝗨𝘀𝗲: ${prefix}help [name]`;

        return sendWithTyping(api, threadID, msg, messageID);
    }

    // ✨ PAGINATION
    if (!cmd) {
        const list = [...commands.keys()].sort();
        const page = parseInt(args[0]) || 1;
        const perPage = 15;

        const total = Math.ceil(list.length / perPage);
        const slice = list.slice((page - 1) * perPage, page * perPage);

        let msg = `🍒 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 🍓\n\n`;

        slice.forEach(c => msg += `✦ ${c}\n`);

        msg += `\n‧₊˚🩰 𝗣𝗮𝗴𝗲: ${page}/${total}\n🍃 ${prefix}help [name]`;

        return sendWithTyping(api, threadID, msg, messageID);
    }

    // ✨ COMMAND INFO
    const msg =
`🍒 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 🍓

✦ ${cmd.config.name}
│ ${cmd.config.description}
│ 𝗨𝘀𝗲: ${prefix}${cmd.config.name} ${cmd.config.usages || ""}
│ 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${cmd.config.commandCategory}
│ 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: ${cmd.config.cooldowns}s

‧₊˚🩰🍃`;

    return sendWithTyping(api, threadID, msg, messageID);
};
