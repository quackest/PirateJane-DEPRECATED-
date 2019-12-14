module.exports = {
	name: 'lvl.revoke',
    description: 'Revoke a users booster token',
    aliases: ['revoke'],
	execute(Discord, client, pool, config, message, args, userInfo, func, shitself) {

        if(!message.member.hasPermission("BAN_MEMBERS")) {
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
            message.channel.send(':gear: Revoke a booster token for a user \nUsage: `' + config.prefix + 'lvl.revoke User` \nIt will revoke their token if they have one.')
            return;
        }
    
        var id = member.id
        checkForToken(id)
    
    
    function checkForToken(id) {
        pool.getConnection(function(err, conn) {
            var sql = `SELECT * FROM LevelSystem where id =?`;
    
            conn.query(sql, [id], function (err, results) {
                if(results[0].boosttype == 'None') {
                    conn.release()
                    message.channel.send('This user does not have a booster token.')
                    .then(msg => {
                        msg.delete(10000)
                    })
                } else {
                    conn.release()
                    beginRevoking(id)
                    var boostertype = results[0].boosttype
                    var tokenTier;
                    if(boostertype == 't1'){
                        tokenTier = 'Tier 1'
                      } else if(boostertype == 't2') {
                        tokenTier = 'Tier 2'
                      } else if(boostertype == 't3') {
                        tokenTier = 'Tier 3'
                      } else if(boostertype == 'SDG') {
                        tokenTier = 'SDG'
                      } else {
                        tokenTier = 'None'
                      }
                    message.channel.send('Revoked ' + member + ' \'s ' + tokenTier + ' token.')
                }
            })
        })
    }
    
    function beginRevoking(id) {
        pool.getConnection(function(err, conn) {
            var sql = `UPDATE LevelSystem SET boosttype = 'None' , boosttoken = '0' WHERE id =?`;
            conn.query(sql, [id], function (err, results) {
                })
                conn.release()
            })
            pool.getConnection(function(err, conn) {
                var sql = `UPDATE boosterTokens SET isRevoked = 'true' WHERE redeemedBy =?`;
                conn.query(sql, [id], function (err, results) {
                    })
                    conn.release()
                })
    }
}}