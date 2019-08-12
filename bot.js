const Discord = require("discord.js");
const fs = require('fs');
const client = new Discord.Client();
const config = require("./config");
const pool = require('./database/pool');
const prefix = config.prefix;
const art = `       .___,   
    ___('v')___
    \`"-\._./-"'
        ^ ^    
`



client.on("ready", function () {
  client.user.setActivity(`Pirate Jane 2.0`);
  console.log("\nPirate Jane is ready to go!\n" + art)
  var date = new Date(); //in case of crash I get the time of the crash
  //cache all members from all guilds listed in the database
startGuildLoop()
function startGuildLoop() {
  pool.getConnection(function(err, conn) {
    var sql = `SELECT * FROM guilds`;
    conn.query(sql, function (err, results) {
        conn.release()
        GuildLoop(results)
    })
  })
}
function GuildLoop(results) {
  if(!results[0]) {
    return;
  }
  var length = results.length
  var holder = 0;
  for (var i = 0; i < length; i++) {
      var guild = client.guilds.get(results[holder].id)
      if(guild) {
        client.guilds.get(results[holder].id).fetchMembers()
        holder++
      } else {
        holder++
  }}}

  console.log('I started at ' + date)
});
client.on('guildDelete', guild => {
  console.log(`I have left ${guild.name} at ${new Date()}`);
});

client.on('guildCreate', guild => {
  console.log(`I have Joined ${guild.name} at ${new Date()}`);
});

//command handler
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
  console.log('Command ' + command.name + ' [' + command.aliases + ']' + ' loaded!')
}

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

try {
	command.execute(Discord, client, pool, config, message, args);
} catch (error) {
	console.error(error);
	message.reply('<:turd:592017668777967616> Something went wrong');
}
});

//Daily cap reset 79200000 = 22 hours for testing purposes, 10 seconds = 10000
setInterval(capReset, 79200000);

function capReset() {
  pool.getConnection(function(err, conn) {
    var sql = `UPDATE LevelSystem SET cap = '0'`;
    conn.query(sql, function (err, results) {
      conn.release()
      console.log('Cap reset. Next reset in 22 hours')
    })
})}

//Auto unmute check (add delete function for the unmute command to remove the user from the database)
setInterval(autoUnmute, 15000);
function autoUnmute() {
  pool.getConnection(function(err, conn) {
    var sql = `SELECT * FROM mutes`;
    conn.query(sql, function (err, results) {
        conn.release()
        unmuteLoop(results)
    })
  })
}
function unmuteLoop(results) {
  if(!results[0]) {
    return;
  }

  var length = results.length
  var date = new Date().getTime()
  var today = Math.round(date / 1000)
  var holder = 0;
  var userPlace;
  //console.log(length) //debugging
  for (var i = 0; i < length; i++) {
    //console.log(results[holder].id) //debugging

    if(results[holder].time <= today) {
      
      var guild = client.guilds.get(results[holder].guild)
      if(guild) {
      const muted = guild.roles.find(role => role.name === "Muted");
      var member = guild.member(results[holder].id)
      }

      userPlace = results[holder].id;
      if(member) {
        
        if(guild) {
        const autoUnmute = guild.channels.find(channel => channel.name === config.logChannel);
        const muted = guild.roles.find(role => role.name === "Muted");
        member.removeRole(muted).catch(console.error);
        const embed = new Discord.RichEmbed()
        embed.setTitle(`Auto Unmute`)
        embed.setColor(0x00CC00)
        embed.setTimestamp()
        embed.setDescription('Unmuted ' + member.user.tag + ' in ' + guild.name)
        autoUnmute.send({embed});
        //member.send({embed}).catch(console.error); disabled to prevent spam. 
        }
        holder = holder + 1;
        pool.getConnection(function(err, conn) {
          var sql = `DELETE FROM mutes WHERE id = ?`;
          conn.query(sql,[userPlace], function (err, results) {
              conn.release()
          })
        })
      } else {
        pool.getConnection(function(err, conn) {
        var sql = `DELETE FROM mutes WHERE id = ?`;
        conn.query(sql,[userPlace], function (err, results) {
            conn.release()
        })
      })
      }

    } else {
    holder = holder + 1;
    }
    
}}
//Start LeaderBoard Loop ---------------------------------- 3600000 = 1 hour
setInterval(StartLBLoop, 3600000);
function StartLBLoop() {
  pool.getConnection(function(err, conn) {
    var sql = `SELECT * FROM guilds`;
    conn.query(sql, function (err, results) {
        conn.release()
        LBLoop(results)
    })
  })
}
function LBLoop(results) {
  if(!results[0]) {
    return;
  }
  var length = results.length
  var holder = 0;
  for (var i = 0; i < length; i++) {
      var guild = client.guilds.get(results[holder].id)
      if(guild){
        if(results[holder].lbchannel) {

          var messageid = results[holder].lbid;
          var channele = client.channels.get(results[holder].lbchannel);
          pool.getConnection(function(err, conn) {
            var sql = `SELECT * FROM LevelSystem ORDER BY xp DESC LIMIT 30`;
            conn.query(sql, function (err, resultslvl) {
              updateEmbedLB(resultslvl, results);
            })
        })
        function updateEmbedLB(resultslvl, results) {
          var mapID = resultslvl.map(results2 => '<@' + results2.id + '>').join("\n")
          var mapXP = resultslvl.map(results2 => '' + results2.xp + ' (' + results2.level + ')').join("\n")
          const newEmbed = new Discord.RichEmbed()
          .setTitle("Leaderboard (Top 30)")
          .setColor(0xADD8E6)
          .setFooter("Sorted by XP | Last update =>")
          .setTimestamp()
          .addField("Users", mapID, true)
          .addField("XP (Level)", mapXP, true)
          channele.fetchMessage(messageid)
          .then(msg => {
            msg.edit(newEmbed)
          })
        }}
      }
      holder = holder + 1
    }}

//levels and discord invite remover and bad word filter (future)
client.on("message", message => {

  //check for discord invites. If it's for the unturned official, leave it
  if(message.content.includes('discord.gg/')) {
    if(message.content.includes('discord.gg/unturned')) return;
      message.channel.bulkDelete(1)
      message.reply('Invite links are not allowed here. Please stop sending them.')
      return;
  }

  if(message.content.startsWith(prefix)) return; //ignore commands
  if(message.author.bot) return; //ignore bots

  if(!message.member) return; //incase something goes south

  var userid = message.member.id;
  //var userid = '236546342585892864'; //debugging
  //get users current xp and other things used later

  //if user doesn't have one of those roles, ignore them
  if(!message.member.roles.some(r=>["Survivor", "Adept Survivor", "Seasoned Survivor", "Hardened Survivor", "Veteran Survivor"].includes(r.name)) ) {
      return;
  }

  //ignored channels
  if(message.channel.name == 'appeals' || message.channel.name == 'lobby' || message.channel.name == 'role-request') {
  return;
}

  pool.getConnection(function(err, conn) {
    var sql = `select * from LevelSystem where id =?`;
    conn.query(sql, [userid], function (err, results) {
      conn.release()
        if(results.length == 0) {//if user doesn't exist, add them. It won't count for any of the boosts or xp.
          addNewUser(userid);
        } else {
          xpFound(results)
        }

      
    })
})

function xpFound(results) {
var msgChannel = message.channel.name; //channel name
var max = results[0].cap; //cap check
var booster = results[0].boosttype; //boostType
var boostToken = results[0].boosttoken; //boost token
var user_xp = results[0].xp; //user xp
var lvl = results[0].level; //user level (string)

//boosters go here
if(msgChannel == "unturned2-general") {
    //unturned2 general
    var cool = 1 * 1.5;
    

    //may remove this one since it can be abused
} else if(msgChannel == "suggestions") {
    //suggestions
    var cool = 1 * 3;

    //booster tokens
} else if(booster == 't1') {
    var cool = 1 * 1.5;
    boostCheck(boostToken)

} else if(booster == 't2'){
    var cool = 1 * 2;
    boostCheck(boostToken)

} else if(booster == 't3') {
    var cool = 1 * 3;
    boostCheck(boostToken)

    //ignore this :eyes:
} else if(booster == 'SDG') {
    var cool = 1 * 5;
    boostCheck(boostToken)

} else {
    //default (no booster)
var xp = Number(user_xp);
var multi = 0.5; //mutliplier fox xp
var cool = 1 * multi;
}

var xp = Number(user_xp);
var newEXP = +(cool + xp).toFixed(12)
var newXP = newEXP.toString();

var cap = Number(max);//turn cap string into number

if(cap >= 100) {
    return; //if cap is at 100, stop.
}
//add xp here
pool.getConnection(function(err, conn) {
  var sql = `UPDATE LevelSystem SET xp =? WHERE id =?`;
  conn.query(sql, [newXP, userid], function (err, results) {
    conn.release()
  })
})

//increase the users cap by 1
pool.getConnection(function(err, conn) {
  var sql = `UPDATE LevelSystem SET cap = cap+1 WHERE id =?`;
  conn.query(sql, [userid], function (err, results) {
    conn.release()
  })
})

//increasing xp per certain amount of levels
var level = Number(lvl);

if(level >= 50) {

  var LevelUpExtra = level * 100;
  var LevelUp = (level * 100) + (LevelUpExtra + LevelUpExtra);
  }
  if(level <= 49 && level >= 31) {

    var LevelUpExtra = level * 50;
    var LevelUp = (level * 100) + (LevelUpExtra + LevelUpExtra);
    }
  if(level <= 40 && level >= 30) {

    var LevelUpExtra = level * 35;
    var LevelUp = (level * 100) + (LevelUpExtra + LevelUpExtra);
  }
  if(level <= 29) {
    
    var LevelUpExtra = level * 20;
    var LevelUp = (level * 100) + (LevelUpExtra + LevelUpExtra);
  }

  //find roles that will be used later
  const lvl0 = message.guild.roles.find(role => role.name === "Survivor");
  const lvl1 = message.guild.roles.find(role => role.name === "Adept Survivor");
  const lvl2 = message.guild.roles.find(role => role.name === "Seasoned Survivor");
  const lvl3 = message.guild.roles.find(role => role.name === "Hardened Survivor");
  const lvl4 = message.guild.roles.find(role => role.name === "Veteran Survivor");


//on level up, check if user has reached certain level, if they have, take away previous role and give the new one
if(xp >= LevelUp) { 
  //increase users level by 1
  pool.getConnection(function(err, conn) {
    var sql = `UPDATE LevelSystem SET level = level+1 WHERE id =?`;
    conn.query(sql, [userid], function (err, results) {
      conn.release()
    })
})

  if(level == 4 || lvl == 4){
  message.reply('Congratulations! You reached level 5 and recieved a special role!')
  if(message.member.roles.some(r=>["Survivor"].includes(r.name))) {
    // give lvl1 role, take away lvl0 role
    message.member.addRole(lvl1).catch(console.error);
    message.member.removeRole(lvl0).catch(console.error);
  } else {
    message.member.addRole(lvl1).catch(console.error);
  }
}
if(level == 14 || lvl == 14){
  message.reply('Congratulations! You reached level 15 and recieved a special role!')
  if(message.member.roles.some(r=>["Survivor", "Adept Survivor"].includes(r.name)) ) {
    // give lvl2 role, take away lvl1 role
    message.member.addRole(lvl2).catch(console.error);
    message.member.removeRole(lvl1).catch(console.error);
  } else {
    message.member.addRole(lvl2).catch(console.error);
  }
}
if(level == 29 || lvl == 29){
  message.reply('Congratulations! You reached level 30 and recieved a special role!')
  if(message.member.roles.some(r=>["Survivor", "Adept Survivor", "Seasoned Survivor"].includes(r.name)) ) {
    // give lvl3 role, take away lvl2 role
    message.member.addRole(lvl3).catch(console.error);
    message.member.removeRole(lvl2).catch(console.error);
  } else {
    message.member.addRole(lvl3).catch(console.error);
  }
}
if(level == 49 || lvl == 49){
  message.reply('Congratulations! You\'ve reached level 50 and recieved the top role!')
  if(message.member.roles.some(r=>["Survivor", "Adept Survivor", "Seasoned Survivor", "Hardened Survivor"].includes(r.name)) ) {
    // give lvl4 role, take away lvl3 role
    message.member.addRole(lvl4).catch(console.error);
    message.member.removeRole(lvl3).catch(console.error);
  } else {
    message.member.addRole(lvl4).catch(console.error);
  }
}}



function boostCheck(boostToken) {
    pool.getConnection(function(err, conn) {
        var sql = `SELECT * FROM boosterTokens where token=?`;
        conn.query(sql, [boostToken], function (err, results) {
            if (err) throw err;
            if(results[0].isExpired == 'false'){
                var ts = Math.round((new Date()).getTime() / 1000);
                if(ts >= results[0].expire) { //check if token expired, if it is, remove it from user and update it
                    var sql2 = `UPDATE boosterTokens SET isExpired ='true' WHERE token =?`;

                    console.log('Expired token ' + boostToken)
                    conn.query(sql2, [boostToken], function (err, results) {
                        removeBooster(boostToken)
                    })
                }
                
            }
          });
        conn.release()
      })}

function removeBooster(boostToken) {
    pool.getConnection(function(err, conn) {
        var sql = `UPDATE LevelSystem SET boosttype ='None' , boosttoken ='0' WHERE boosttoken =?`;
        conn.query(sql, [boostToken], function (err, results) {
            console.log('Removed booster ' + boostToken)
            message.reply('Your booster ended.')
        })
    })
}}});

function addNewUser(id) {
  pool.getConnection(function(err, conn) {
    var sql = `INSERT INTO LevelSystem (id, xp, level, cap) VALUES (?, 0.5, 1, 1)`;
    conn.query(sql, [id], function (err, results) {
    })
    conn.release()
})}

//logging\\
//message delete
client.on('messageDelete', async (message) => { 
  if(message.author.bot) return;
  const logs = message.guild.channels.find(channel => channel.name === config.logChannel);
  const embed = new Discord.RichEmbed()
  embed.setTitle(`Message Deleted in ${message.channel.name}`)
  embed.setColor(0xEE7600)
  embed.setTimestamp()
  if(message.content.length > 1024) {
    embed.addField("Message", "Too long to display.", false)
  } else {
    if(!message.content) return;
  embed.addField("Message", message.content, false)
  }
  embed.setFooter('Author: ' + message.author.tag + '(' + message.author.id + ')')
  logs.send({embed});
})
//Role added/removed
client.on("guildMemberUpdate", function(oldMember, newMember){
  const guild = oldMember.guild
  var old = oldMember._roles
  var next = newMember._roles
  if(old.length < next.length) { //recevied role
    var check = 'give';
    findDiffence(old, next, check)
  } else if(old.length > next.length) { //lost role
    var check = 'take';
    findDiffence(old, next, check)
    
  } else {
    return;
  }
    function addedRole(diff) {
    guild.channels.find(channel => channel.name === config.logChannel).send(
    new Discord.RichEmbed()
    .setTitle('Role Added')
    .setColor(0x40e0d0)
    .setFooter(oldMember.id)
    .setTimestamp()
    .setDescription(oldMember.user.tag + ' was given the ' + '<@&' + diff + '> role.')
    )
  }
  function removeRole(diff) {
    guild.channels.find(channel => channel.name === config.logChannel).send(
    new Discord.RichEmbed()
    .setTitle('Role Remove')
    .setColor(0x40e0d0)
    .setFooter(oldMember.id)
    .setTimestamp()
    .setDescription(oldMember.user.tag + ' lost the ' + '<@&' + diff + '> role.')
    )
  }
  //did not make this lul. Someone else did online.
  function findDiffence (a1, a2, check) {

  var a = [], diff = [];

  for (var i = 0; i < a1.length; i++) {
      a[a1[i]] = true;
  }

  for (var i = 0; i < a2.length; i++) {
      if (a[a2[i]]) {
          delete a[a2[i]];
      } else {
          a[a2[i]] = true;
      }
  }

  for (var k in a) {
      diff.push(k);
  }
  if(check == 'give') {
    addedRole(diff)
  } else if (check == 'take') {
    removeRole(diff)
  } else {
    return;
  }
}
});

//join message
client.on("guildMemberAdd", (member) => {
  const guild = member.guild;
    guild.channels.find(channel => channel.name === config.logChannel).send(
      new Discord.RichEmbed()
      .setTitle('Member Joined')
      .setColor(0x3CB371)
      .setFooter('Member ID: ' + member.id)
      .setTimestamp()
      .setDescription('Member ' + member.user.tag + ' has joined the server!')
    )
});
//leave message
client.on("guildMemberRemove", (member) => {
  const guild = member.guild;
    guild.channels.find(channel => channel.name === config.logChannel).send(
      new Discord.RichEmbed()
      .setTitle('Member Left')
      .setColor(0xDC143C)
      .setFooter('Member ID: ' + member.id)
      .setTimestamp()
      .setDescription('Member ' + member.user.tag + ' has left the server.')
    )
});
//message edited
  client.on("messageUpdate", function(oldMessage, newMessage){
    if(oldMessage.author.bot) return;
  const guild = oldMessage.guild;
    //console.log(oldMessage.content + ' ' + newMessage.content)
  if(oldMessage.content == newMessage.content) {
    return;
  }

  if(oldMessage === null || newMessage === null) {
    return;
  }
  var old = oldMessage
  var newm = newMessage
  if(oldMessage.content.length > 1020 || newMessage.content.length > 1020) {
    old = 'Too long. Could not display.'
    newm = 'Too long. Could not display.'
  } 

  guild.channels.find(channel => channel.name === config.logChannel).send(
    new Discord.RichEmbed()
    .setTitle('Message Edited - ' + oldMessage.member.user.tag)
    .setDescription(oldMessage.channel + `  [Jump to message](https://discordapp.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${oldMessage.id})`)
    .setColor(0x5f9ea0)
    .setFooter('ID: ' + oldMessage.id)
    .setTimestamp()
    .addField('Before', ' ' + old, false)
    .addField('After', ' ' + newm, false)
  )
})

client.on("error", function(error){
  console.error(`client's WebSocket encountered a connection error: ${error}`);
});

//check for flagged posts
/*references
reaction.message.id = id of message
client.user.tag = bot tag
reaction._emoji.name

*/
//will work on it later
//prevent spam by creating a check to check if the user has already flagged that, if they have, ignore it
/*client.on("messageReactionAdd", function(reaction, user){
      if(reaction._emoji.name == '🚩') {
        if(user.tag == client.user.tag) {
          return;
        }
        if(reaction.message.channel.name !== 'command-spam') {
          return;
        }
        pool.getConnection(function(err, conn) {
          var sql = `SELECT * FROM flags WHERE message=?`;
          conn.query(sql, [reaction.message.id], function (err, results) {
            if(!results[0]){
              pool.getConnection(function(err, conn) {
                var sql = `INSERT INTO flags (flagger, message) VALUES (?, ?)`;
                conn.query(sql, [user.id, reaction.message.id], function (err, results) {                 
                })
            })
            } else {
              console.log(results.length)
              pool.getConnection(function(err, conn) {
                var sql = `INSERT INTO flags (flagger, message) VALUES (?, ?)`;
                conn.query(sql, [user.id, reaction.message.id], function (err, results) {          
                })
            })
            }
          })
      })
      }
}); */

client.login(config.token);