module.exports = {
	name: 'level',
    description: 'See your level info',
    aliases: ['lvl'],
	execute(Discord, client, pool, config, message, args) {


    if(message.channel.name !== 'command-spam') {
      if(message.channel.name !== 'voice-and-bot-commands') {
        if(!message.member.hasPermission("MANAGE_MESSAGES")) {
          return;
        }      
    }
  }



    const userMention = message.mentions.users.first();
    //mention
    if (userMention) {
      var member = message.guild.member(userMention);
      //id
    } else if (args[0]){
        var userCheck = args[0];
        var member = message.guild.member(userCheck)
        if(!member) {
          message.channel.send('Invalid user.')
          return;
        }
    } else {
      var member = message.member
    }


    
    pool.getConnection(function(err, conn) {
      var sql = `SELECT * FROM LevelSystem WHERE id=?`;
      conn.query(sql, [member.id], function (err, results) {
        lb(results);
      })
  })

  function lb(results) {
    if(!results[0]) {
      message.channel.send('User has no level.')
      return;
    }
    var lvl = results[0].level;
    var level = Number(lvl); //level
 
    //get the xp for next level
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
    const embed = new Discord.RichEmbed()
    .setTitle('Level Info: ' + member.user.tag)
    .setColor(0xADD8E6)
    .setFooter(member.id)
    .setTimestamp()
    .addField("Level", results[0].level, true)
    .addField("XP / XP for next lvl", results[0].xp + ' / ' + LevelUp, true)
    .addField("Daily message cap", results[0].cap + ' / 100', true)
    .addField("Booster", results[0].boosttype, true)
    message.channel.send({embed});
  }
	},
};
    
    

