module.exports = {
	name: 'rulecode.rotate',
    description: 'Randomizes the rulecode answer and the hint.',
    aliases: ['rc.rotate'],
	execute(Discord, client, pool, config, message, args) {


        if(!message.member.hasPermission("MANAGE_MESSAGES")) {
            message.react('592017668777967616')
            return;
        }

        pool.getConnection(function(err, conn) {
            var sql = `SELECT * FROM rulecode`;
            conn.query(sql, function (err, results) {
                conn.release()

                beginRotation(results);

            })
        })

        function beginRotation(results) {
            var rand = results.length;
            
            var random = Math.floor(Math.random() * rand);

            var hint = results[random].hint;
            var answer = results[random].answer;

            message.channel.send('Random number: ' + random + '\nHint: ' + hint + '\nAnswer: ' + answer)

            pool.getConnection(function(err, conn) {
                var sql = `UPDATE rulecode SET active = 0 WHERE active ='1'`;
                conn.query(sql, function (err, results) {
                    conn.release()
                    
                    pool.getConnection(function(err, conn) {
                        var sql = `UPDATE rulecode SET active = 1 WHERE hint =?`;
                        conn.query(sql,[hint], function (err, results) {
                            conn.release()
            
            
                        })
                    })
    
                })
            })


        }





    }}