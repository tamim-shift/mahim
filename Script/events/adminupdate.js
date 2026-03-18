module.exports.config = {
	name: "adminUpdate",
	eventType: ["log:thread-admins","log:thread-name", "log:user-nickname","log:thread-icon","log:thread-call","log:thread-color"],
	version: "1.0.1",
	credits: "MAHIM ISLAM",
	description: "Update team information quickly",
    envConfig: {
        sendNoti: true,
    }
};

module.exports.run = async function ({ event, api, Threads,Users }) {
	const fs = require("fs");
	var iconPath = __dirname + "/emoji.json";
	if (!fs.existsSync(iconPath)) fs.writeFileSync(iconPath, JSON.stringify({}));
    const { threadID, logMessageType, logMessageData } = event;
    const { setData, getData } = Threads;

    const thread = global.data.threadData.get(threadID) || {};
    if (typeof thread["adminUpdate"] != "undefined" && thread["adminUpdate"] == false) return;

    try {
        let dataThread = (await getData(threadID)).threadInfo;
        switch (logMessageType) {
            case "log:thread-admins": {
                if (logMessageData.ADMIN_EVENT == "add_admin") {
                    dataThread.adminIDs.push({ id: logMessageData.TARGET_ID })
                    if (global.configModule[this.config.name].sendNoti) api.sendMessage(`"${logMessageData.TARGET_ID}" - 𝐄𝐢𝐢 𝐧𝐞 𝐛𝐨𝐥𝐨𝐝 𝐭𝐨𝐫𝐞 𝐠𝐫𝐨𝐮𝐩 𝐞𝐫 𝐚𝐝𝐦𝐢𝐧 𝐝𝐢𝐥𝐚𝐦! ʕ•ᴥ•ʔ`, threadID, async (error, info) => {
                        if (global.configModule[this.config.name].autoUnsend) {
                            await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
                            return api.unsendMessage(info.messageID);
                        } else return;
                    });
                }
                else if (logMessageData.ADMIN_EVENT == "remove_admin") {
                    dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id != logMessageData.TARGET_ID);
                    if (global.configModule[this.config.name].sendNoti) api.sendMessage(`"${logMessageData.TARGET_ID}" - 𝐓𝐮𝐢𝐢 𝐩𝐚𝐠𝐨𝐥 𝐜𝐡𝐚𝐠𝐨𝐥, 𝐠𝐫𝐨𝐮𝐩 𝐞𝐫 𝐚𝐝𝐦𝐢𝐧 𝐭𝐡𝐚𝐤𝐚𝐫 𝐣𝐨𝐠𝐠𝐨𝐭𝐚 𝐧𝐞𝐢𝐢!\n𝐓𝐚𝐢 𝐭𝐨𝐤𝐞 𝐚𝐝𝐦𝐢𝐧 𝐭𝐡𝐞𝐤𝐞 𝐥𝐚𝐭𝐡𝐢 𝐦𝐞𝐫𝐞 𝐧𝐚𝐦𝐢𝐲𝐞 𝐝𝐞𝐮𝐲𝐚 𝐡𝐨𝐥𝐨! 😒 `, threadID, async (error, info) => {
                        if (global.configModule[this.config.name].autoUnsend) {
                            await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
                            return api.unsendMessage(info.messageID);
                        } else return;
                    });
                }
                break;
            }

            case "log:thread-icon": {
            	let preIcon = JSON.parse(fs.readFileSync(iconPath));
            	dataThread.threadIcon = event.logMessageData.thread_icon || "👍";
                if (global.configModule[this.config.name].sendNoti) api.sendMessage(`» [ GROUP UPDATE ] y.replace("emoji", "icon")}\n» Original icon: ${preIcon[threadID] || "unknown"}`, threadID, async (error, info) => {
                	preIcon[threadID] = dataThread.threadIcon;
                	fs.writeFileSync(iconPath, JSON.stringify(preIcon));
                    if (global.configModule[this.config.name].autoUnsend) {
                        await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
                        return api.unsendMessage(info.messageID);
                    } else return;
                });
                break;
            }
            case "log:thread-call": {
        if (logMessageData.event === "group_call_started") {
          const name = await Users.getNameUser(logMessageData.caller_id);
          api.sendMessage(`[ GROUP UPDATE ]\n❯ ${name} STARTED A ${(logMessageData.video) ? 'VIDEO ' : ''}CALL.`, threadID);
        } else if (logMessageData.event === "group_call_ended") {
          const callDuration = logMessageData.call_duration;
          const hours = Math.floor(callDuration / 3600);
          const minutes = Math.floor((callDuration - (hours * 3600)) / 60);
          const seconds = callDuration - (hours * 3600) - (minutes * 60);
          const timeFormat = `${hours}:${minutes}:${seconds}`;
          api.sendMessage(`[ GROUP UPDATE ]\n❯ ${(logMessageData.video) ? 'Video' : ''} call has ended.\n❯ Call duration: ${timeFormat}`, threadID);
        } else if (logMessageData.joining_user) {
          const name = await Users.getNameUser(logMessageData.joining_user);
          api.sendMessage(`❯ [ GROUP UPDATE ]\n❯ ${name} Joined the ${(logMessageData.group_call_type == '1') ? 'Video' : ''} call.`, threadID);
        }
        break;
            }
            case "log:thread-color": {
            	dataThread.threadColor = event.logMessageData.thread_color || "🌤";
                if (global.configModule[this.config.name].sendNoti) api.sendMessage(`» [ GROUP UPDATE ]\n» ${event.logMessageBody.replace("Theme", "color")}`, threadID, async (error, info) => {
                    if (global.configModule[this.config.name].autoUnsend) {
                        await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
                        return api.unsendMessage(info.messageID);
                    } else return;
                });
                break;
            }
          
            case "log:user-nickname": {
                dataThread.nicknames[logMessageData.participant_id] = logMessageData.nickname;
                if (typeof global.configModule["nickname"] != "undefined" && !global.configModule["nickname"].allowChange.includes(threadID) && !dataThread.adminIDs.some(item => item.id == event.author) || event.author == api.getCurrentUserID()) return;
                if (global.configModule[this.config.name].sendNoti) api.sendMessage(`»» NOTICE «« Update user nicknames ${logMessageData.participant_id} to: ${(logMessageData.nickname.length == 0) ? "original name": logMessageData.nickname}`, threadID, async (error, info) => {
                    if (global.configModule[this.config.name].autoUnsend) {
                        await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
                        return api.unsendMessage(info.messageID);
                    } else return;
                });
                break;
            }

            case "log:thread-name": {
                dataThread.threadName = event.logMessageData.name || "No name";
                if (global.configModule[this.config.name].sendNoti) api.sendMessage(`»» NOTICE «« Update the group name to ${dataThread.threadName}`, threadID, async (error, info) => {
                    if (global.configModule[this.config.name].autoUnsend) {
                        await new Promise(resolve => setTimeout(resolve, global.configModule[this.config.name].timeToUnsend * 1000));
                        return api.unsendMessage(info.messageID);
                    } else return;
                });
                break;
            }
        }
        await setData(threadID, { threadInfo: dataThread });
    } catch (e) { console.log(e) };
}
