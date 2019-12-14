const Discord = require("discord.js");
const fs = require('fs');
const client = new Discord.Client();
const config = require("./config");
const pool = require('./database/pool');
const prefix = config.prefix;
const func = require('./functions');
const art = `       .___,   
    ___('v')___
    \`"-\._./-"'
        ^ ^    
`

//shitself is for when the bot is unable to connect to the db. If it cannot, then it will skip some functions that require a db (ie lvls)
let shitself;

pool.getConnection(function(err, conn) {
  if(err) {
    shitself = true;
    console.log('true')
  } else {
    shitself = false;
    console.log('false')
  }

  if(shitself == true) {
    setInterval(shitSelfChecker, 3600000); //3600000 = 1 hour

    function shitSelfChecker() {

      process.exit()
    }
  let deathIf = setInterval(ifDeath, 5000); //3600000 = 1 hour
  function ifDeath () {
    let guild = client.guilds.get(`324229387295653889`);
    guild.channels.find(channel => channel.name === config.logChannel).send(`>>> Could not connect to the database. Will restart in an hour to check if I can connect again.\nWhile I am not connected to the database, my commands will be limited. Commands such as warn, warns, mute, and the level system will not work.`)
    clearInterval(deathIf);
  }
  }
  
  


client.on("ready", function () {
  client.user.setActivity(`Pirate Jane 2.0`);
  console.log("\nPirate Jane is ready to go!\n" + art)
  var date = new Date(); //in case of crash I get the approximate time it happened
  //cache all members from all guilds listed in the database
   console.log('I started at ' + date)
});


let boomer = setInterval(GuildLoop, 6000);


/*function startGuildLoop() {
  pool.getConnection(function(err, conn) {
    var sql = `SELECT * FROM guilds`;
    
    conn.query(sql, function (err, results) {
        conn.release()
          GuildLoop(results)
    })
    
  })
}*/
function GuildLoop() {
  let sql = 'SELECT * FROM guilds'
  let values = []
  func.runQuery(sql, values, here)
  function here (results) {
  var length = results.length
  var holder = 0;
  for (var i = 0; i < length; i++) {
      var guild = client.guilds.get(results[holder].id)
      if(guild) {
        client.guilds.get(results[holder].id).fetchMembers()
        holder++
        console.log(guild.id)
      } else {
        holder++
  }
  clearInterval(boomer)
}
}
}



client.on('guildDelete', guild => {
  console.log(`I have left ${guild.name} at ${new Date()}`); 
});

client.on('guildCreate', guild => {
  console.log(`I have Joined ${guild.name} at ${new Date()}`); //incase Jane somehow get's in a server..
});

//command handler
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
  console.log('Command ' + command.name + ' [' + command.aliases + ']' + ' loaded!') //make sure commands load in correctly
}

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;
  let sql = 'SELECT * FROM LevelSystem WHERE id =?'
  let values = [message.member.id]
  if(shitself == false) {
  func.runQuery(sql, values, getEverythingOnUser)
  } else {
    let userInfo = null;
    getEverythingOnUser(userInfo)
  }
    //yes mysql db

    function getEverythingOnUser(userInfo) {

      try {
        command.execute(Discord, client, pool, config, message, args, userInfo, func, shitself);
      } catch (error) {
        console.error(error);
        if(message.attachments) {
          return;
        }
        message.reply('<:turd:592017668777967616> Something went wrong'); //if something goes not the way it's supposed to
      }
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
    if(shitself == false) {
    conn.query(sql, function (err, results) {
        conn.release()
        unmuteLoop(results)
    })
  }
  })
}
function unmuteLoop(results) {
  if(!results) {
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
    if(shitself == false) {
    conn.query(sql, function (err, results) {
        conn.release()
        LBLoop(results)
    })
  }
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

//everything done when a message is sent
client.on("message", message => {

  //check for discord invites. If it's for the unturned official, leave it
  if(message.content.includes('discord.gg/')) {
    if(message.content.includes('discord.gg/unturned')) return;
      message.channel.bulkDelete(1)
      message.reply('Invite links are not allowed here. Please stop sending them.')
      return;
  }

  //Blacklisted words
  if(shitself == false) {
    if(message.author.bot) {
      return;
    }
  pool.getConnection(function(err, conn) {
    var sql = `SELECT * FROM blacklist`;
    conn.query(sql, function (err, results) {
      conn.release()
      var length = results.length
      var holder = 0;
      let whitelist = ['shenanigans', 'spoon']
      let msg = message.content.toLowerCase()
      let re;
            for (let i = 0; i < whitelist.length; i++) {
              re = new RegExp(`${whitelist[i]}`, 'g')
              msg = msg.replace(re, ' ')
            
          }
      //console.log(msg)
        
      for (var i = 0; i < length; i++) {
        
        if(msg.includes(results[holder].word)) {

          if(message.author.bot) {
            return;
          }
          if(message.member.hasPermission('BAN_MEMBERS')) {
            return;
          }
          message.delete()
          //if in appeals, delete the message, but don't go mute them/warn them
          if(message.channel.name == 'appeals') {
            return;
          }
          pool.getConnection(function(err, conn) {
            var badWord = results[holder].word;
            var sql = `SELECT severity FROM blacklist WHERE word =?`;

            conn.query(sql, [badWord], function (err, results2) {
                conn.release()
              if(results2[0].severity == '1') {
                message.reply(`That kind of language is not allowed here.`)
                .then(msg => {msg.delete(10000)})
              } else if(results2[0].severity == '2') {
                message.reply(`Bad words >:[ Don't use them or try to bypass the filter.`)
                .then(msg => {msg.delete(10000)})
              } else if(results2[0].severity == '3') {
                message.channel.send(`That's over the line, bub. ` + message.author.tag + ` got a 30 minute mute.`)
                const mutes = message.guild.channels.find(channel => channel.name === config.modLogs);
                const muted = message.guild.roles.find(role => role.name === "Muted");

                message.member.addRole(muted).catch(console.error);
                
                const embed = new Discord.RichEmbed()
                embed.setTitle(`Auto Mute`)
                embed.setColor(0xFFA500)
                embed.setTimestamp()
                embed.addField('User', message.author.tag + ' (' + message.author.id + ')', false)
                embed.addField('Reason', 'Bad words.', false)
                embed.addField('Channel', message.channel, false)
                embed.addField('Muted for', '30 minutes', false)

                mutes.send({embed});
                message.author.send({embed}).catch(console.error);

                var amExpire = Math.round((new Date()).getTime() / 1000 + 1800);

                pool.getConnection(function(err, conn) {
                  var sql = `INSERT INTO mutes (guild, id, time) VALUES (?, ?, ?);`;
                  conn.query(sql,[message.guild.id, message.author.id, amExpire], function (err, results) {
                  conn.release()
                  })
              })

              }
            })
          })
          return;
        } else {
          holder++
        }
      }
    
    })
  
})
}
//Reply when mentioned (Incase forgotten prefix)
if(message.content.startsWith(client.user)) {
  message.channel.send(`Hello. :wave: \nMy prefix is: \`` + prefix + `\``)
}

  //Level System begins here
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
  if(message.channel.name == 'appeals' || message.channel.name == 'lobby' || message.channel.name == 'role-request' || message.channel.name == 'voice-and-bot-commands') {
  return;
}

  pool.getConnection(function(err, conn) {
    var sql = `select * from LevelSystem where id =?`;
    if(shitself == false) {
    conn.query(sql, [userid], function (err, results) {
      conn.release()
        if(results.length == 0) {//if user doesn't exist, add them. It won't count for any of the boosts or xp.
          addNewUser(userid);
        } else {
          xpFound(results)
        }

      
    })
  }
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
    //message.member.removeRole(lvl0).catch(console.error);
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
  embed.setAuthor('Message Deleted - ' + message.author.tag, message.author.avatarURL)
  embed.setColor(0xEE7600)
  embed.setTimestamp()
  if(message.content.length > 1000) {
    embed.setDescription("**Message deleted in " + message.channel + "**\nToo long to display.", false)
  } else {
    //if(!message.content) return;
    embed.setDescription("**Message deleted in " + message.channel + "**\n" + message.content, false)
  }
  //console.log(message.attachments.first())
  if(message.attachments.first()) {
    embed.setImage(`${message.attachments.first().proxyURL}`)
    //console.log(message.attachments.first().proxyURL)
  }

  embed.setFooter('Author ID: ' + message.author.id + ' | Message ID: ' + message.id)
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
    .setAuthor('Role added - ' + oldMember.user.tag, oldMember.user.avatarURL)
    .setColor(0x40e0d0)
    .setFooter(oldMember.id)
    .setTimestamp()
    .setDescription(oldMember.user.tag + ' was given the ' + '<@&' + diff + '> role.')
    )
  }
  function removeRole(diff) {
    guild.channels.find(channel => channel.name === config.logChannel).send(
    new Discord.RichEmbed()
    .setAuthor('Role removed - ' + oldMember.user.tag, oldMember.user.avatarURL)
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
    pool.getConnection(function(err, conn) {
      var sql = `SELECT * FROM mutes WHERE id=?`;
      conn.query(sql,[member.id], function (err, resultsMute) {
          conn.release()
          if(!resultsMute[0]){
            guild.channels.find(channel => channel.name === config.logChannel).send(
              new Discord.RichEmbed()
              .setTitle('Member Joined - ' + member.user.tag)
              .setColor(0x3CB371)
              .setFooter('Member ID: ' + member.id)
              .setThumbnail(member.user.avatarURL)
              .setTimestamp()
              .setDescription('Member ' + member + ' has joined the server!')
              .addField('Account created', member.user.createdAt , false)
            )
          } else {
            const muted = guild.roles.find(role => role.name === "Muted");
            member.addRole(muted).catch(console.error);
            var timeMute = Number(resultsMute[0].time)
            var ts = new Date(timeMute*1000);
            var muteTime;
            if(timeMute == '2545065496') {
              muteTime = 'The end of time'
            } else {
              muteTime = ts.toDateString()
            }
            guild.channels.find(channel => channel.name === config.logChannel).send(
              new Discord.RichEmbed()
              .setTitle('Member Re-Joined - ' + member.user.tag)
              .setColor(0x3CB371)
              .setFooter('Member ID: ' + member.id)
              .setTimestamp()
              .setDescription('Member ' + member + ' Re-Joined the server while muted.')
              .addField('User muted until', muteTime, false)
              .addField('Account created on', member.user.createdAt , false)
              )

          }
      })
  })
  pool.getConnection(function(err, conn) {
    var sql = `SELECT * FROM blacklist`;
    conn.query(sql, function (err, badWords) {
      //console.log(badWords.length)
      var nameSize = member.displayName.split(" ")

      for (var i = 0; i < nameSize.length; i++) {
        //console.log(nameSize[i])
        for (var e = 0; e < badWords.length; e++) {
          if(nameSize[i].includes(badWords[e].word)) {
          member.setNickname("Bad Name")
          member.send('Your nickname was changed in the Unturned Official discord server because it contained inappropriate words. \nAsk a moderator to change it if you wish.')
          return;
          }
        }
      }
  })
})


});

//leave message
client.on("guildMemberRemove", (member) => {
  const guild = member.guild;
    guild.channels.find(channel => channel.name === config.logChannel).send(
      new Discord.RichEmbed()
      .setTitle('Member Left - ' + member.user.tag)
      .setColor(0xDC143C)
      .setFooter('Member ID: ' + member.id)
      .setThumbnail(member.user.avatarURL)
      .setTimestamp()
      .setDescription('Member ' + member + ' has left the server.')
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
    .setDescription(oldMessage.channel + `  [Jump to message](https://discordapp.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${oldMessage.id})`)
    .setColor(0x5f9ea0)
    .setFooter('ID: ' + oldMessage.id)
    .setAuthor('Message Edited - ' + oldMessage.member.user.tag, oldMessage.member.user.avatarURL)
    .setTimestamp()
    .addField('Before', '** **' + old, false)
    .addField('After', '** **' + newm, false)
  )
})

//User nickname update
client.on("guildMemberUpdate", function(oldM, newM){
  
  const guild = oldM.guild;
  if(oldM.nickname === newM.nickname) return;
  var oldNick = oldM.nickname;
  var newNick = newM.nickname;
  //old name
  if(!oldNick){
    oldNick = 'None'
  }
  //new name
  if(!newNick) {
    newNick = 'None'
  }



  guild.channels.find(channel => channel.name === config.logChannel).send(
    new Discord.RichEmbed()
    .setAuthor('Nickname Updated - ' + oldM.user.tag, oldM.user.avatarURL)
    .setColor(0x5f9ea0)
    .setFooter('Member ID: ' + oldM.id)
    .setTimestamp()
    .setDescription(oldM + ' had their nickname updated')
    .addField('Before', oldNick, false)
    .addField('After', newNick, false)
  )
});


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
let reactMsg = 655214342228410381 //msg
client.on("messageReactionAdd", function(reaction, user){
  let guild = reaction.message.guild
  let mem = guild.members.get(user.id);
  let survRole = guild.roles.find(role => role.name === "Survivor");
  let confirm = 655216159582584876 //emoji
      if(reaction._emoji.id == confirm) {
        if(reaction.message.id == reactMsg) {
          
          mem.addRole(survRole).catch(console.error);
          if(!mem.roles.some(r=>["Survivor", "Adept Survivor", "Seasoned Survivor", "Hardened Survivor", "Veteran Survivor"].includes(r.name))){
            mem.send(`Welcome to **${guild.name}**!\n\n**By reacting to the message, you have accepted our Terms Of Service**`)
          }
          
        }

      }
}); 
//ty anidiotsguide
client.on('raw', packet => {
  // react add/remove
  if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
  // channel
  const channel = client.channels.get(packet.d.channel_id);
  // check if cached
  if (channel.messages.has(packet.d.message_id)) return;
  // fetch message if not cached
  channel.fetchMessage(packet.d.message_id).then(message => {
      // Emojis can have identifiers of name:id format, so we have to account for that case as well
      const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
      // This gives us the reaction we need to emit the event properly, in top of the message object
      const reaction = message.reactions.get(emoji);
      // Adds the currently reacting user to the reaction's users collection.
      if (reaction) reaction.users.set(packet.d.user_id, client.users.get(packet.d.user_id));
      // Check which type of event it is before emitting
      if (packet.t === 'MESSAGE_REACTION_ADD') {
          client.emit('messageReactionAdd', reaction, client.users.get(packet.d.user_id));
      }
      if (packet.t === 'MESSAGE_REACTION_REMOVE') {
          client.emit('messageReactionRemove', reaction, client.users.get(packet.d.user_id));
      }
  });
});



})

client.login(config.token);