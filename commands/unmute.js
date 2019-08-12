module.exports = {
	name: 'unmute',
    description: 'Unmutes a user',
    aliases: ['unmute'],
	execute(Discord, client, pool, config, message, args) {

        if(!message.member.hasPermission("MANAGE_MESSAGES")) {
            message.react('592017668777967616')
            return;
        }


        //set an event for when a user is unmuted via the member update. If they lost a role by the name of "Muted", delete them from the database.
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
            message.channel.send(':gear: Unmutes a user.\nUsage: `' + config.prefix + 'unmute {@user/userID} {reason}`  (Reason is optional)')
            return;
        }

        const muted = message.guild.roles.find(role => role.name === "Muted");

        if(!member.roles.some(r=>["Muted"].includes(r.name))){
            message.channel.send(member.user.tag + ' isn\'t muted')
            return;
        }
        member.removeRole(muted).catch(console.error);
        pool.getConnection(function(err, conn) {
            var sql = `SELECT * FROM mutes WHERE id=?`;
            conn.query(sql, [member.id], function (err, results) {
              if(!results[0]) {
                sendUnmuteMsg()
                return;
              } else {
                pool.getConnection(function(err, conn) {
                    var sql = `DELETE FROM mutes WHERE id =?`;
                    conn.query(sql,[member.id], function (err, results) {
                        conn.release()
                        sendUnmuteMsg()
                    })
                })
              }
            })
        })
        function sendUnmuteMsg() {
        var reason = args.slice(1).join(' ');
            if(!reason) {
                message.channel.send(member.user.tag + ' unmuted by ' + message.author.tag)
                member.send('You were unmuted by ' + message.author.tag)
            } else {
                message.channel.send(member.user.tag + ' unmuted by ' + message.author.tag + '. Reason for unmute: ```' + reason + '```')
                member.send('You were unmuted by ' + message.author.tag + '. Reason for unmute: ```' + reason + '```')
            }
            
        }
    
    
}}