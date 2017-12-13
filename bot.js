const Discord = require("discord.js");
const config = require("./config.json")

const {Pool, Client } = require("pg");

// Creates a new instance module
const bot = new Discord.Client();

//states that teh bot is ready and running
bot.on('ready', function() {
  console.log(`Logged in as ${bot.user.tag}!`);
});

// Adds the server to the database that the bot was just added to
bot.on("guildCreate", function(server){
  console.log("Trying to insert server " + server.name + " into database");
  
  var info = [server.name , server.id, server.ownerID, "&"];

  client.query("INSERT INTO botserver.server (servername, serverid, ownerid, prefix) VALUES ?", info , function(error, result) {
    if (error){
      console.log(error);
    }
  });
});

// Removes the sever from the list when the bot is kicked from the server
bot.on("guildDelete", function(server) {
  console.log("Attempting to remove " + server.name + " from the database.");
  client.query("DELETE * FROM botserver.server WHERE serverid = '" + server.id + "'", function(error) {
    if(error){
      console.log(error);
      return;
    }
    console.log("Server removed.")
  })
});

bot.on("presenceUpdate", (oldMember, newMember) => {
    let guild = newMember.guild;
    let playRole = guild.roles.find("name", "Playing Overwatch");
    if(!playRole) return;

    if(newMember.user.presence.game && newMember.user.presence.game.name === "Overwatch") {
      newMember.addRole(playRole);
    }
    else if (!newMember.user.presence.game && newMember.roles.has(playRole.id)) {
      newMember.removeRole(playRole);
    }
});


/************************ User Interactions ***********************/
bot.on('message', function(msg) {
  
  // Will ignore messages from itself or any other bot
  if (msg.author.bot) return;

  // Bot only replys if it starts with the prefix
  if (!msg.content.startsWith(prefix)) return;

  // Command controls the command with the prefix
  let command = msg.content.split(" ")[0];
  command = command.slice(prefix.length);

  // Args controls any additonal arguments
  let args = msg.content.split(" ").slice(1);

  // Makes sure the message is on the server and not in a private message to the bot
  if (!msg.channel.isPrivate) {
    if (command === 'hello') {
      msg.reply("Hello you are on server **" + msg.guild.name + "**. If you need help with the bot type '==help'");
    }

    if (command === "help") {
      msg.reply("Thanks for installing the bot on your server. The following commands can be useful: \n\t==hello bot (displays the hello message)\n\t==say <text> (sends a message stating what you said)\n\t==members (returns the members in the group)");
    }

    if (command === "say") {
      msg.channel.send(args.join(" "));
    }

    if (command === "members") {
      if (guild.available){
        msg.reply("There are " + guild.memberCount + " members in this guild and they are: " + guild.members.user.username);
      }
    }
  }

  // If there's a private message
  if (msg.channel.isPrivate){
    if (msg.content === 'ping') {
      msg.reply("Hello you have sent me a **PM**");
    }
  }
});

// Greets new people as they join the server
bot.on("guildMember", function(member){
    const channel = member.guild.channels.find('name', 'member-log');
    if(!channel)
        return;
    channel.send("Welcome to the guild, ${user.username}");
});

bot.login(process.env.BOT_TOKEN);
