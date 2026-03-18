module.exports.config = {
  name: "antibd",
  eventType: ["log:user-nickname"],
  version: "0.0.1",
  credits: "MAHIM ISLAM",
  description: "Against changing Bot's nickname"
};

module.exports.run = async function({ api, event, Users, Threads }) {
    var { logMessageData, threadID, author } = event;
    var botID = api.getCurrentUserID();
    var { BOTNAME, ADMINBOT } = global.config;
    var { nickname } = await Threads.getData(threadID, botID);
    var nickname = nickname ? nickname : BOTNAME;
    if (logMessageData.participant_id == botID && author != botID && !ADMINBOT.includes(author) && logMessageData.nickname != nickname) {
        api.changeNickname(nickname, threadID, botID)
        var info = await Users.getData(author);
       return api.sendMessage({ body: `${info.name} - 𝐏𝐚𝐠𝐨𝐥 𝐜𝐡𝐚𝐠𝐨𝐥 𝐭𝐮𝐢 𝐧𝐢𝐜𝐤𝐧𝐚𝐦𝐞 𝐜𝐡𝐚𝐧𝐠𝐞 𝐤𝐨𝐫𝐭𝐞 𝐩𝐚𝐫𝐛𝐢 𝐧𝐚! 😹`}, threadID);
    }  
        }
