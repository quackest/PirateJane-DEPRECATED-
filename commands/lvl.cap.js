module.exports = {
	name: 'lvl.cap',
    description: 'Resets the global cap',
    aliases: ['lvl.cap'],
	execute(Discord, client, pool, config, message, args) {

        if(!message.member.hasPermission("MANAGE_MESSAGES")) {
            message.react('592017668777967616')
            return;
          }

        pool.getConnection(function(err, conn) {
            var sql = `UPDATE LevelSystem SET cap = '0'`;
            conn.query(sql, function (err, results) {
              conn.release()
              message.channel.send('Daily message cap reset globally.')
            })
        })

    }}