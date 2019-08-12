module.exports = {
	name: 'lvl.revoke',
    description: 'Revoke a users booster token',
    aliases: ['revoke'],
	execute(Discord, client, pool, config, message, args) {

    if(!message.member.roles.some(r=>["Moderation Team", "Administrator", "Moderator", "SDG", "Community Staff"].includes(r.name)) ) {
        message.channel.send('You must be a staff member to use this command')
        .then(msg => {
            msg.delete(10000)
        })
        return;
      }

    var id = args[0];
    
    if(!id) {
        message.channel.send(':gear: Revoke a booster token for a user \nUsage: `' + config.prefix + 'lvl.revoke {UserID}` \nIt will revoke their token if they have one.')
    } else if(id.includes('<@')) {
        message.channel.send('Please use the users ID.')
        .then(msg => {
            msg.delete(10000)
        })
    } else if(!id.match(/[0-9]/)) {
        message.channel.send('Invalid ID')
        .then(msg => {
            msg.delete(10000)
        })
    } else { 
        checkForToken(id)
    }
    
    function checkForToken(id) {
        pool.getConnection(function(err, connection) {
            var sql = `SELECT * FROM LevelSystem where id =?`;
    
            connection.query(sql, [id], function (err, results) {
                if(results[0].boosttype == 'None') {
                    connection.release()
                    message.channel.send('This user does not have a booster token.')
                    .then(msg => {
                        msg.delete(10000)
                    })
                } else {
                    connection.release()
                    beginRevoking(id)
                    message.channel.send('Revoked <@' + id + '> ' + results[0].boosttype + ' token.')
                    .then(msg => {
                        msg.delete(15000)
                    })
                }
            })
        })
    }
    
    function beginRevoking(id) {
        pool.getConnection(function(err, connection) {
            var sql = `UPDATE LevelSystem SET boosttype = 'None' , boosttoken = '0' WHERE id =?`;
                    connection.query(sql, [id], function (err, results) {
                })
                connection.release()
            })
    }
}}