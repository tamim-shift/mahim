module.exports = function ({ api, models, Users, Threads, Currencies }) {
    return function ({ event }) {
        // Fast exit: if it's not a reply, stop immediately
        if (!event.messageReply) return;

        const { handleReply, commands } = global.client;
        const { messageID, threadID, messageReply } = event;

        // Check if there is an active command waiting for this specific reply
        let indexOfMessage = null;
        if (handleReply && handleReply.length > 0) {
            indexOfMessage = handleReply.find(e => e.messageID === messageReply.messageID);
        }

        // 🚀 THE MAGIC FALLBACK: Route stray replies straight to Baby!
        // If no active command claims this reply, check if they are talking to the bot.
        if (!indexOfMessage) {
            if (messageReply.senderID == api.getCurrentUserID()) {
                const babyCmd = commands.get("baby");
                if (babyCmd && typeof babyCmd.handleEvent === "function") {
                    // Force the event to go to baby.js
                    babyCmd.handleEvent({ api, event, Users, Threads, Currencies, models });
                }
            }
            return; // Stop here so it doesn't crash trying to run an undefined handleNeedExec
        }

        // --- STANDARD COMMAND EXECUTION CONTINUES BELOW ---
        
        const handleNeedExec = commands.get(indexOfMessage.name);
        
        if (!handleNeedExec) {
            return api.sendMessage(global.getText('handleReply', 'missingValue'), threadID, messageID);
        }

        try {
            let getText2 = () => {};

            // Language processing setup
            if (handleNeedExec.languages && typeof handleNeedExec.languages === 'object') {
                getText2 = (...value) => {
                    const reply = handleNeedExec.languages || {};
                    const langConfig = global.config.language;

                    if (!reply.hasOwnProperty(langConfig)) {
                        return api.sendMessage(global.getText('handleCommand', 'notFoundLanguage', handleNeedExec.config.name), threadID, messageID);
                    }

                    let lang = reply[langConfig][value[0]] || '';
                    
                    for (let i = value.length; i > 0; i--) {
                        const expReg = RegExp('%' + i, 'g');
                        lang = lang.replace(expReg, value[i]);
                    }
                    return lang;
                };
            }

            const contextObj = {
                api,
                event,
                models,
                Users,
                Threads,
                Currencies,
                handleReply: indexOfMessage,
                getText: getText2
            };

            // Execute the specific command's reply handler
            handleNeedExec.handleReply(contextObj);
            
        } catch (error) {
            return api.sendMessage(global.getText('handleReply', 'executeError', error.message || error), threadID, messageID);
        }
    };
};
