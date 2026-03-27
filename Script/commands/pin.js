module.exports.config = {  
  name: "pin",  
  version: "2.0.0",  
  hasPermssion: 0,  
  credits: "MAHIM ISLAM (Updated by ChatGPT)",  
  description: "Pinterest Image Search (No duplicate + default 2 images)",  
  commandCategory: "Search",  
  usages: "[text]-[number] (optional)",  
  cooldowns: 3,  
};  

module.exports.run = async function({ api, event, args }) {  
  const axios = require("axios");  
  const fs = require("fs-extra");  

  try {  
    if (!args[0])  
      return api.sendMessage("❌ Please enter a search keyword!", event.threadID, event.messageID);  

    const input = args.join(" ");  

    // Split keyword & number (optional)
    let keyword = input;  
    let limit = 2; // default

    if (input.includes("-")) {  
      keyword = input.substring(0, input.lastIndexOf("-")).trim();  
      limit = parseInt(input.split("-").pop());  
      if (isNaN(limit) || limit <= 0) limit = 2;  
    }  

    // Limit max images (prevent spam)
    if (limit > 50) limit = 50;  

    // Get API base
    const apis = await axios.get('https://raw.githubusercontent.com/shaonproject/Shaon/main/api.json');  
    const baseApi = apis.data.api;  

    // Fetch images
    const res = await axios.get(`${baseApi}/pinterest?search=${encodeURIComponent(keyword)}`);  
    let data = res.data.data || [];  

    if (!data.length)  
      return api.sendMessage("❌ No images found!", event.threadID, event.messageID);  

    // Remove duplicate URLs
    data = [...new Set(data)];  

    // Shuffle (to avoid same order every time)
    data.sort(() => 0.5 - Math.random());  

    // Adjust limit if not enough images
    if (data.length < limit) limit = data.length;  

    let imgData = [];  

    for (let i = 0; i < limit; i++) {  
      const path = __dirname + `/cache/pin_${i}.jpg`;  
      const img = (await axios.get(data[i], { responseType: "arraybuffer" })).data;  
      fs.writeFileSync(path, Buffer.from(img));  
      imgData.push(fs.createReadStream(path));  
    }  

    api.sendMessage({  
      body: `🔎 Found ${limit} images for: ${keyword}`,  
      attachment: imgData  
    }, event.threadID, event.messageID, () => {  
      // Clean cache after send
      for (let i = 0; i < limit; i++) {  
        const path = __dirname + `/cache/pin_${i}.jpg`;  
        if (fs.existsSync(path)) fs.unlinkSync(path);  
      }  
    });  

  } catch (err) {  
    console.error(err);  
    api.sendMessage("❌ Error fetching images!", event.threadID, event.messageID);  
  }  
};