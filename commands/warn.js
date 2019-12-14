module.exports = {
	name: 'warn',
    description: 'Warn a user for doing the nono',
    aliases: ['warn'],
	execute(Discord, client, pool, config, message, args, userInfo, func, shitself) {
    
        if(!message.member.hasPermission("MANAGE_MESSAGES")) {
            message.react('592017668777967616')
            return;
        }

        if(shitself == true) {
            return message.channel.send(`Database is on the fritz. The command will not work until the database is back up.`)
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
            message.channel.send(':gear: Warns a users.\nUsage:`' + config.prefix + 'warn {@user|userID} {reason}`\nReason is not required.')
            return;
        }
        var reason = args.slice(1).join(' ');
        if(!reason) {
            var reason = 'No reason specified.';
        }
        const warn = message.guild.channels.find(channel => channel.name === config.modLogs);

        pool.getConnection(function(err, conn) {
            var sql = `SELECT * FROM warns WHERE id='counter'`;
            conn.query(sql, function (err, results) {
                conn.release()
              sendWarn(results);
            })
        })
        function sendWarn(results) {
        const embed = new Discord.RichEmbed()
        embed.setTitle(`Warn #` + results[0].amount)
        embed.setColor(0xffff94)
        embed.setTimestamp()
        embed.addField('User', member.user.tag + ' (' + member.id + ')', false)
        embed.addField('Reason', reason, false)
        embed.addField('Moderator', message.author.tag + ' (' + message.author.id + ')', false)
        embed.addField('Channel', '<#' + message.channel.id + '>', false)
        warn.send({embed});
        member.send({embed}).catch(console.error);
        //send a channel message
        message.channel.send(message.author.tag + ' has warned ' + member.user.tag + ' for: ```' + reason + '```')
        updateUser(member, reason)
        updateCounter()
        }

        function updateCounter() {
            pool.getConnection(function(err, conn) {
                var sql = `UPDATE warns SET amount = amount+1 WHERE id ='counter';`;
                conn.query(sql, function (err, results) {
                conn.release()
                })
            })
        }
        function updateUser(member, reason) {
            pool.getConnection(function(err, conn) {
                var sql = `SELECT * FROM warns WHERE id=?`;
                conn.query(sql, [member.id], function (err, results) {
                    conn.release()
                    if(reason == 'No reason specified.') {
                        var reas = ''; //if not reason specified, don't add anything
                    } else {
                    var reas = reason + '\n';
                    }
                    if(!results[0]){
                        pool.getConnection(function(err, conn) {
                            var sql = `INSERT INTO warns (id, reasons, amount) VALUES (?, ?, 1)`;
                            conn.query(sql, [member.id, reas], function (err, results) {
                            conn.release()
                            })
                        })
                    } else {
                        pool.getConnection(function(err, conn) {
                            var sql = `UPDATE warns SET reasons=CONCAT(reasons, ?), amount = amount+1 WHERE id =?`;
                            conn.query(sql, [reas, member.id], function (err, results) {
                            conn.release()
                            })
                        })
                    }
                })
            })
        }
}};