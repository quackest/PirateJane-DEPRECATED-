module.exports = {
	name: 'kick',
    description: 'Kicks a user out of the server',
    aliases: ['punch'],
	execute(Discord, client, pool, config, message, args, userInfo, func, shitself) {
    
        if(!message.member.hasPermission("KICK_MEMBERS")) {
            message.react('592017668777967616')
            return;
        }
        if(!message.guild.me.hasPermission('KICK_MEMBERS')) {
            message.channel.send('I don\'t have permissions to kick members')
            return;
          }

        message.delete()
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
            message.channel.send(':gear: Kicks a users.\nUsage:`' + config.prefix + 'kick {@user|userID} {reason}`\nReason is not required.')
            return;
        }
        var reason = args.slice(1).join(' ');
        if(!reason) {
            var reason = 'No reason specified.';
        }
        const kick = message.guild.channels.find(channel => channel.name === config.modLogs);

        if(member.id == message.guild.me.id) {
            const ouch = client.emojis.find(emoji => emoji.name === "ouch");
            return message.reply('I feel hurt. ' + ouch)
        }


        if(member.id == message.author.id) {
            return message.reply('You cannot kick yourself.')
        }

        if(!member.kickable) {
            return message.channel.send('I cannot kick them. They are either the same role as I am, or higher')
        }

        if(shitself == false) {

        
        pool.getConnection(function(err, conn) {
            //keep the counters in the "warns" table
            var sql = `SELECT * FROM warns WHERE id='kcounter'`;
            conn.query(sql, function (err, results) {
                conn.release()
              sendKick(results[0].amount);
            })
        })
    } else {
        let kickAmount = 0
        sendKick(kickAmount);
    }
        function sendKick(kickAmount) {
        const embed = new Discord.RichEmbed()
        embed.setTitle(`Kick #` + kickAmount)
        embed.setColor(0xfc4503)
        embed.setTimestamp()
        embed.addField('User', member.user.tag + ' (' + member.id + ')', false)
        embed.addField('Reason', reason, false)
        embed.addField('Moderator', message.author.tag + ' (' + message.author.id + ')', false)
        embed.addField('Channel', '<#' + message.channel.id + '>', false)
        kick.send({embed});
        member.send({embed}).catch(console.error);
        //send a channel message
        message.channel.send(message.author.tag + ' has kicked ' + member.user.tag + ' for: ```' + reason + '```')
        setTimeout(kickUser, 1500, reason);
        if(shitself == false) {
            updateCounter()
        }
        
        }

        function updateCounter() {
            pool.getConnection(function(err, conn) {
                var sql = `UPDATE warns SET amount = amount+1 WHERE id ='kcounter';`;
                conn.query(sql, function (err, results) {
                conn.release()
                })
            })
        }
        function kickUser(reason) {
            member.kick(reason)
        }
}};