const ytdl = require("youtube-dl");
const Discord = require("discord.js");
const m3u8stream = require("m3u8stream");
const config = JSON.parse(require("fs").readFileSync("./config.json").toString());

if( process.argv.length < 2 || process.argv[2] !== "shard" ){
  console.log("[info] Starting shard manager");
  let shardmgr = new Discord.ShardingManager("index.js", { token: config.discord.token, totalShards: config.discord.shards, shardArgs: [ "shard" ] });
  shardmgr.spawn();
} else {
  const channels = {};
  
  const client = new Discord.Client();
  
  client.on("ready", () => {
    console.log("[info] Shard ready!");
    client.user.setPresence({game: { name: "twisten help - Listen to Twitch streams! d([].[])b" } });
  });
  
  client.on("message", async (message) => {
    
    if( message.content.split(" ")[0].toLowerCase() != "twisten" ) return;
    
    let mreply = async (m) => {
      try {
        await message.reply(m);
      } catch(e){
        console.log("[warn] " + e.message + " // " + message.channel);
      }
    }
    
    let args = message.content.toLowerCase().split(" ");
    
    if( args[1] == "stop" ){
      if( ! channels[message.member.voiceChannel] ) return mreply("nothing is currently playing in that voice channel.");
      else {
        if( message.member != channels[message.member.voiceChannel].user && ! message.member.hasPermission(Discord.Permissions.FLAGS.MUTE_MEMBERS) ) return mreply("you have not started that stream, and you do not have the `Mute Members` permission.");
        
        channels[message.member.voiceChannel].stream.end();
        
        let i = channels[message.member.voiceChannel].info;
        
        try {
          await message.channel.send("⏹️ Stopped " + i.uploader + " - " + i.description);
        } catch(e){
          console.log("[warn] " + e.message + " // " + message.channel);
        }
        
        message.member.voiceChannel.leave();
        delete channels[message.member.voiceChannel];
      }
    } else if( args[1] == "help" ){
      try {
        message.member.send("**Twisten Help**\n\n`twisten [twitch channel]` - Listen to a Twitch channel.\n`twisten stop` - Stop the stream. Note that you can only stop the stream if you've started it, or you have the `Mute Members` permission in the target guild.\n`twisten help` - Show this help message.\n`twisten info` - Show information about the current stream.");
        message.reply("sent you a DM!");
      } catch(e){
        console.log("[warn] " + e.message + " // " + message.channel);
      }
    } else if( args[1] == "info" ) {
      if( ! channels[message.member.voiceChannel] ) return mreply("nothing is currently playing in that voice channel.");
      
      let i = channels[message.member.voiceChannel].info;
      mreply("you're listening to " + i.uploader + " - " + i.description);
    } else {
      if( ! message.member.voiceChannel ) await mreply("you are not in a voice channel. Join a voice channel and try again.");
      if( ! message.member.voiceChannel.joinable ) await mreply("I can't join that");
      if( channels[message.member.voiceChannel] ) return mreply("I am already streaming something in this channel. Try `twisten stop` first.");
      if( message.guild.voiceConnection ) return mreply("I am already playing something in this guild. Try `twisten stop` first.");
      if( config.blacklist.indexOf(args[1]) > -1 ) return mreply("that channel has been blacklisted.");
      
      channels[message.member.voiceChannel] = {};
      
      var yt = ytdl("https://twitch.tv/" + args[1], [ "-x" ]);
      
      yt.on("info", async (i) => {
        let cx;
        
        try {
          cx = await message.member.voiceChannel.join();
        } catch(e){
          mreply("I could not join that channel!");
          delete channels[message.member.voiceChannel];
          return;
        }
        
        channels[message.member.voiceChannel].user = message.member;
        channels[message.member.voiceChannel].info = i;
        channels[message.member.voiceChannel].stream = m3u8stream(i.url);
        var l = await cx.playStream(channels[message.member.voiceChannel].stream);
        l.on("end", () => {
          channels[message.member.voiceChannel].stream.end();
          message.member.voiceChannel.leave();
          delete channels[message.member.voiceChannel];
        });
        
        try {
          await message.channel.send("▶ Now playing " + i.uploader + ": " + i.description);
        } catch(e){
          console.log("[warn] " + e.message + " // " + message.channel);
        }
        
        console.log("[info] " + message.guild.name + " (" + message.author.tag + ") is listening to " + i.uploader);
      });
      
      yt.on("error", async (e) => {
        mreply(e.toString().split("\n")[1].replace("ERROR: ", ""));
        delete channels[message.member.voiceChannel];
        message.member.voiceChannel.leave();
      });
    }
  });
  
  client.login(config.discord.token);
}