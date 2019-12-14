module.exports = {
	name: 'warnings',
    description: 'Check your or another users warnings',
    aliases: ['warns'],
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



    const userMention = message.mentions.users.first();
    //get user by mention
    if (userMention) {
      var member = message.guild.member(userMention);
      var memberID = member.id;
      //get user by id
    } else if (args[0]){
        var userCheck = args[0];
        var member = message.guild.member(userCheck)
        if(!member) {
          message.channel.send('User does not exist.')
          return;

        } else {
          var memberID = member.id;
        }
    } else {
      var member = message.author
      var memberID = message.author.id;
    }
    
    var isMember = message.guild.member(memberID)

    pool.getConnection(function(err, conn) {
      var sql = `SELECT * FROM warns WHERE id=?`;
      conn.query(sql, [isMember.id], function (err, results) {
        conn.release()
        sendWarnings(results, isMember)
      })
  })

  function sendWarnings(results, isMember) {
    if(!results[0]){
      message.channel.send('User does not have any warns')
      return;
    } else {
      const embed = new Discord.RichEmbed()
      embed.setTitle(`Warnings for ` + isMember.user.tag)
      embed.setColor(0xffff94)
      embed.setTimestamp()
      embed.setDescription('Total Warns: ' + results[0].amount)
      if(!results[0].reasons) {
        embed.addField('Reason(s)', 'No reason(s) specified.', false)
      } else {
        embed.addField('Reason(s)', results[0].reasons, false)
      }
      message.channel.send({embed});
    }
  }
}}