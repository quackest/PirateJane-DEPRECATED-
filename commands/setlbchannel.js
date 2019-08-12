module.exports = {
	name: 'setlbchannel',
    description: 'Set leaderboard channel. (Updates every hour with new leaderboard)',
    aliases: ['setlbchan'],
	execute(Discord, client, pool, config, message, args) {

        if(!message.member.hasPermission("MANAGE_MESSAGES")) {
            message.react('592017668777967616')
            return;
          }
    var msg;
    message.delete()

    pool.getConnection(function(err, conn) {
        var sql = 'SELECT * FROM guilds WHERE id =?'
        conn.query(sql, [message.channel.guild.id], function (err, results) {
            conn.release()
            if(!results[0]){
                message.channel.send('This guild is not in the database... Woops')
            } else if(results[0].id == message.channel.guild.id && results[0].lbchannel == message.channel.id) { //remove channel
                removeChannel()
            } else if(results[0].id == message.channel.guild.id && results[0].lbchannel == null) { //if doesn't exist, we add it
                updateChannel()
            } else {
                msg = 'Another channel is already the LeaderBoard channel (<#' + results[0].lbchannel + '>)'
                confimation(msg)
            }

        })
    })


    function updateChannel() {
    pool.getConnection(function(err, conn) {
        var sql = 'UPDATE guilds SET lbchannel =? WHERE id =?'
        conn.query(sql, [message.channel.id, message.channel.guild.id], function (err, results) {
            conn.release()
            msg = 'Set this channel to LeaderBoard channel.'
            confirmStart()
            confimation(msg)
        })
    })
}

function removeChannel() {
    pool.getConnection(function(err, conn) {
        var sql = 'UPDATE guilds SET lbchannel =?, lbid =? WHERE id =?'
        conn.query(sql, [null, null, message.channel.guild.id], function (err, results) {
            conn.release()
            msg = 'This channel is no longer the LeaderBoard channel.'
            confimation(msg)
        })
    })
}


function confimation(msg) {
    message.channel.send(msg)
    .then(msg => {
        msg.delete(10000)
    })
}

function confirmStart() {
    startLB()
}

function startLB() {
    pool.getConnection(function(err, conn) {
        var sql = `SELECT * FROM LevelSystem ORDER BY xp DESC LIMIT 30`;
        conn.query(sql, function (err, results) {
          lb(results);
        })
    })
  
    function lb(results) {
      var mapID = results.map(results => '<@' + results.id + '>').join("\n")
      var mapXP = results.map(results => '' + results.xp + ' (' + results.level + ')').join("\n")
      const embed = new Discord.RichEmbed()
      .setTitle("Leaderboard (Top 30)")
      .setColor(0xADD8E6)
      .setFooter("Sorted by XP")
      .setTimestamp()
      .addField("Users", mapID, true)
      .addField("XP (Level)", mapXP, true)
      message.channel.send({embed})
      .then(msg => {
        pool.getConnection(function(err, conn) {
            var sql = `UPDATE guilds SET lbid =? WHERE id =?`;
            conn.query(sql,[msg.id, message.channel.guild.id], function (err, results) {
            
            })
        })
      })
    }
}
}}