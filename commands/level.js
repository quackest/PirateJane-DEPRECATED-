module.exports = {
	name: 'level',
    description: 'See your level info',
    aliases: ['lvl'],
	execute(Discord, client, pool, config, message, args, userInfo, func, shitself) {


    if(message.channel.name !== 'command-spam') {
      if(message.channel.name !== 'voice-and-bot-commands') {
        if(!message.member.hasPermission("MANAGE_MESSAGES")) {
          return;
        }      
    }
  }

  if(shitself == true) {
    return message.channel.send(`Database is on the fritz. The command will not work until the database is back up.`)
  }


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
      var member = message.member
    }


    
    pool.getConnection(function(err, conn) {
      var sql = `SELECT * FROM LevelSystem WHERE id=?`;
      conn.query(sql, [member.id], function (err, results) {
        lb(results);
      })
  })

  function lb(results) {
    if(!results[0]) {
      message.channel.send('User has no level.')
      return;
    }
    var lvl = results[0].level;
    var level = Number(lvl); //level
 
    //get the xp for next level
    if(level >= 50) {

      var LevelUpExtra = level * 100;
      var LevelUp = (level * 100) + (LevelUpExtra + LevelUpExtra);
      }
      if(level <= 49 && level >= 31) {
    
        var LevelUpExtra = level * 50;
        var LevelUp = (level * 100) + (LevelUpExtra + LevelUpExtra);
        }
      if(level <= 40 && level >= 30) {
    
        var LevelUpExtra = level * 35;
        var LevelUp = (level * 100) + (LevelUpExtra + LevelUpExtra);
      }
      if(level <= 29) {
        
        var LevelUpExtra = level * 20;
        var LevelUp = (level * 100) + (LevelUpExtra + LevelUpExtra);
      }

      //boost type
      var boost;
      var boostertype = results[0].boosttype;

      if(boostertype == 't1'){
        boost = 'Tier 1'
      } else if(boostertype == 't2') {
        boost = 'Tier 2'
      } else if(boostertype == 't3') {
        boost = 'Tier 3'
      } else if(boostertype == 'SDG') {
        boost = 'SDG'
      } else {
        boost = 'None'
      }
      
      
      var timeText = 'None'
      var check;
        pool.getConnection(function(err, conn) {
          var sql = `SELECT * FROM LevelSystem where id =?`;
          conn.query(sql, [member.id], function (err, results) {
            conn.release()
            
            if(results[0].boosttype == 'None') {
              timeText = 'None'
              check = 'false'
              sendEmbed(timeText, check)
            } else {
              
              var tokenID = results[0].boosttoken
              pool.getConnection(function(err, conn) {
                var sql = `SELECT * FROM boosterTokens where token =?`;
        
                conn.query(sql, [tokenID], function (err, results2) {
                  conn.release()
                  if(!results2[0]){
                    
                  } else {
                    var uTime = results2[0].expire;
                    check = 'true'
                    timeText = getExpireDate(uTime)
                    sendEmbed(timeText, check)
                  }
                })
            })
            }
          })
      })

      
      function getExpireDate(uTime) {
        
        if(uTime == 33468338387) {
          timeText = 'Never'
        } else {

        //var expireDate = Math.round((new Date()).getTime() / 1000 + uTime);

        var months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
       
        var date = new Date(uTime*1000);
       
        var year = date.getFullYear();
       
        var month = months_arr[date.getMonth()];
       
        var day = date.getDate();
       
        var hours = date.getHours();
       
        var minutes = "0" + date.getMinutes();

        var seconds = "0" + date.getSeconds();
       
        var timeText = month+'-'+day+'-'+year+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        
        
        }
        
        return timeText;

  }


    function sendEmbed(timeText, check) {

    const embed = new Discord.RichEmbed()
    embed.setTitle('Level Info: ' + member.user.tag)
    embed.setColor(0xADD8E6)
    embed.setFooter(member.id)
    embed.setTimestamp()
    embed.addField("Level", results[0].level, true)
    embed.addField("XP / XP for next lvl", results[0].xp + ' / ' + LevelUp, true)
    embed.addField("Daily message cap", results[0].cap + ' / 100', true)
    embed.addField("Booster", boost, true)
    if(check != 'false') {
      embed.addField("Booster Expire Date", timeText, false)
    }
    message.channel.send({embed});
  }
}
	},
};

    

