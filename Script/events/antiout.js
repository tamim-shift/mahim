module.exports.config = {
 name: "antiout",
 eventType: ["log:unsubscribe"],
 version: "0.0.1",
 credits: "MAHIM ISLAM",
 description: "Listen events"
};

module.exports.run = async({ event, api, Threads, Users }) => {
 let data = (await Threads.getData(event.threadID)).data || {};
 if (data.antiout == false) return;
 if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;
 const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
 const type = (event.author == event.logMessageData.leftParticipantFbId) ? "self-separation" : "Koi Ase Pichware Mai Lath Marta Hai?";
 if (type == "self-separation") {
  api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID, (error, info) => {
   if (error) {
    api.sendMessage(`𝐎𝐨𝐩𝐬! 𝐬𝐨𝐫𝐫𝐲 𝐛𝐨𝐬𝐬 𝐈 𝐜𝐚𝐧'𝐭 𝐫𝐞-𝐚𝐝𝐝 ${name} to the group...! 🥲`, event.threadID)
   } else api.sendMessage(`𝐑𝐞-𝐚𝐝𝐝𝐞𝐝 ${name} 𝐭𝐨 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩...! 🙂`, event.threadID);
  })
 }
}
