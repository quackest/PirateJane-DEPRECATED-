module.exports = {
	name: 'leaderboard',
    description: 'Shows top 10',
    aliases: ['lb'],
	execute(Discord, client, pool, config, message, args, userInfo, func, shitself) {
    

    if(message.channel.name !== 'command-spam') {
      if(message.channel.name !== 'voice-and-bot-commands') {
        if(!message.member.hasPermission("MANAGE_MESSAGES")) {
          return;
        }      
    }
  }


  if(shitself == true) {
    return message.channel.send(`Database is on the fritz. The command will not work until the database is back up.`)
  }

    pool.getConnection(function(err, conn) {
      var sql = `SELECT * FROM LevelSystem ORDER BY xp DESC LIMIT 15`;
      conn.query(sql, function (err, results) {
        lb(results);
      })
  })

  function lb(results) {
    var mapID = results.map(results => '<@' + results.id + '>').join("\n")
    var mapXP = results.map(results => '' + results.xp + ' (' + results.level + ')').join("\n")
    const embed = new Discord.RichEmbed()
    .setTitle("Leaderboard (Top 15)")
    .setColor(0xADD8E6)
    .setFooter("Sorted by XP")
    .setTimestamp()
    .addField("Users", mapID, true)
    .addField("XP (Level)", mapXP, true)
    message.channel.send({embed});
  }
}}