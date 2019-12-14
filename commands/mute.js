module.exports = {
	name: 'mute',
    description: 'Mute a user for doing the bad',
    aliases: ['mute'],
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
            message.channel.send(':gear: Mutes a users.\nUsage:`' + config.prefix + 'mute {@user|userID} {reason} | time`\nTime can be set with `1 day` or `1d` or `5 days`\nReason or time are not required.')
            return;
        }

        var string = args.slice(1).join(' ');
        var stringCheck = string.split('|')

        var time;
        if(!stringCheck[1]) { //check if time
            //if no time, add them to the database with the unban time set to 30 years ahead
            time = 'the end of time.'
            pool.getConnection(function(err, conn) {
                var sql = `SELECT * FROM mutes WHERE id=?;`;
                conn.query(sql,[member.id], function (err, results) {
                conn.release()
                if(!results[0]) {
                    pool.getConnection(function(err, conn) {
                    var sql = `INSERT INTO mutes (guild, id, time) VALUES (?, ?, 2545065496)`;
                    conn.query(sql,[message.guild.id, member.id], function (err, results) {
                    conn.release()
                    })
                })} else {
                    pool.getConnection(function(err, conn) {
                        var sql = `UPDATE mutes SET guild =?, time ='2545065496' WHERE id =?`;
                        conn.query(sql, [message.guild.id, member.id], function (err, results) {
                        conn.release()
                        })
                    })}})})
        } else {
            //if time, add them to the database, if they exist, update their time instead
            var str;
            str = stringCheck[1].trim()
            var time = getTime(str)
            if(time == 'badTime') {
                return;
            }
        }
        var reason;
        if(!stringCheck[0]) {
            reason = 'No reason specified'
        } else {
            reason = stringCheck[0].trim()
        }

        //add a check for unmute command => if user exists in the database, remove them, if not return.
        
        const mutes = message.guild.channels.find(channel => channel.name === config.modLogs);
        const muted = message.guild.roles.find(role => role.name === "Muted");
        if(!muted) {
            message.channel.send('Could not get the muted role')
            return;
        }
        startMute()

        function sendMute(counter) {
        member.addRole(muted).catch(console.error);
        const embed = new Discord.RichEmbed()
        embed.setTitle(`Mute #` + counter[0].amount)
        embed.setColor(0xFFA500)
        embed.setTimestamp()
        embed.addField('User', member.user.tag + ' (' + member.id + ')', false)
        embed.addField('Reason', reason, false)
        embed.addField('Moderator', message.author.tag + ' (' + message.author.id + ')', false)
        embed.addField('Channel', '<#' + message.channel.id + '>', false)
        embed.addField('Muted until', time, false)
        mutes.send({embed});
        member.send({embed}).catch(console.error);
        //send a channel message
        message.channel.send(message.author.tag + ' has muted ' + member.user.tag + ' for: ```' + reason + '``` Muted until: ' + time)
        }


        function getTime(str) {

            var days = str.match(/[0-9 ]+(?=d)/) || str.match(/[0-9 ]+(?=days)/) || str.match(/[0-9 ]+(?=day)/);

            var hours = str.match(/[0-9 ]+(?=h)/) || str.match(/[0-9 ]+(?=hrs)/) || str.match(/[0-9 ]+(?=hours)/) || str.match(/[0-9 ]+(?=hour)/) || str.match(/[0-9 ]+(?=hr)/);
    
            var mins = str.match(/[0-9 ]+(?=m)/) || str.match(/[0-9 ]+(?=mins)/) || str.match(/[0-9 ]+(?=minutes)/);
            
            var totalTime = (mins * 60) + (hours * 3600) + (days * 86400);

            if(totalTime == 0) {
                message.channel.send('Invalid time argument.')
                var badTime = 'badTime'
                return badTime;
            } else {
            
            var expireDate = Math.round((new Date()).getTime() / 1000 + totalTime);
    
                var months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
               
                var date = new Date(expireDate*1000);
               
                var year = date.getFullYear();
               
                var month = months_arr[date.getMonth()];
               
                var day = date.getDate();
               
                var hours = date.getHours();
               
                var minutes = "0" + date.getMinutes();
    
                var seconds = "0" + date.getSeconds();
               
                var timeText = month+'-'+day+'-'+year+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);


                pool.getConnection(function(err, conn) {
                    var sql = `SELECT * FROM mutes WHERE id=?;`;
                    conn.query(sql,[member.id], function (err, results) {
                    conn.release()
                    if(!results[0]) {
                        pool.getConnection(function(err, conn) {
                        var sql = `INSERT INTO mutes (guild, id, time) VALUES (?, ?, ?);`;
                        conn.query(sql,[message.guild.id, member.id, expireDate], function (err, results) {
                        conn.release()
                        })
                    })} else {
                        pool.getConnection(function(err, conn) {
                            var sql = `UPDATE mutes SET guild =?, time =? WHERE id =?`;
                            conn.query(sql, [message.guild.id, expireDate, member.id], function (err, results) {
                            conn.release()
                            })
                        })}})})
                return timeText;
            }
        }

        function startMute() {
            pool.getConnection(function(err, conn) {
                var sql = `SELECT * FROM warns WHERE id='mcounter'`;
                conn.query(sql, function (err, counter) {
                    conn.release()
                    sendMute(counter)
                    pool.getConnection(function(err, conn) {
                        var sql = `UPDATE warns SET amount = amount+1 WHERE id ='mcounter';`;
                        conn.query(sql, function (err, results) {
                        conn.release()
                        })
                    })
                })
            })
        }
  
}}