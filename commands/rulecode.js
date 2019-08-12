module.exports = {
	name: 'rulecode',
    description: 'Gets you out of hell.',
    aliases: ['rc'],
	execute(Discord, client, pool, config, message, args) {
        
    //incase database is not available
    var hint = 'You shall also not share...';
    var answer = 'private messages';

    pool.getConnection(function(err, conn) {
      var sql = `SELECT * FROM rulecode WHERE active = '1'`;
      conn.query(sql, function (err, results) {
          conn.release()
          if(!results[0]) {
            rulecode(hint, answer);
          } else {
            hint = results[0].hint;
            answer = results[0].answer;
          rulecode(hint, answer);
          }
        
      })
  })

    function rulecode(hint, answer) {

    var role = message.guild.roles.find(role => role.name === "Survivor");
    var response = args.slice(0).join(' ');
    message.delete()
    if(message.member.roles.some(r=>["Survivor", "Adept Survivor", "Seasoned Survivor", "Hardened Survivor", "Veteran Survivor"].includes(r.name)) ) {
        message.reply('Why would you want to go back to hell??')
        return;
    }

    var rcMSG = 'You have to read the rules and fill in the blanks!\nThe answer starts with `' + hint + '`\nUse `' + config.prefix +'rulecode <The Answer>` to fill in the blanks\n**Hint: The rules are located in <#553311236389863425>**'
    if(!response) {
        message.channel.send(rcMSG)
        .then(msg => {
            msg.delete(15000)
        })
        return;
    } else {
        if(response.toLowerCase() == answer) {
            message.channel.send('**' + message.author.tag + '** Filled in the blanks and received the Survivor role!')
            message.member.addRole(role).catch(console.error);
        } else {
            message.channel.send(rcMSG)
            .then(msg => {
                msg.delete(15000)
            })
            return;
        }
    }
  }


}}