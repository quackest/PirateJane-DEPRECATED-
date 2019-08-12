module.exports = {
	name: 'lvl.tgen',
    description: 'Generate a booster token',
    aliases: ['tgen'],
	execute(Discord, client, pool, config, message, args) {

    if(!message.member.roles.some(r=>["Moderation Team", "Administrator", "Moderator", "SDG", "Community Staff"].includes(r.name)) ) {
        message.channel.send('You must be a staff member to use this command')
        .then(msg => {
            msg.delete(10000)
        })
        return;
      }

    var tier = args[0]
    var str = args.slice(1).join(' ');

    if(!args[0]) {
        message.channel.send(':gear: Gerenate a booster token for the LevelSystem\n Usage: `' + config.prefix + 'lvl.tgen (tier1|tier2|tier3) {time}`\n Different tiers have different multipliers (ie: tier1 = 1.5x | tier2 = 2.0x | tier3 = 3.0x)');
        return;
    }

    if(str.includes('d') || str.includes('h') || str.includes('m')) {

        var days = str.match(/[0-9 ]+(?=d)/) || str.match(/[0-9 ]+(?=days)/) || str.match(/[0-9 ]+(?=day)/);

        var hours = str.match(/[0-9 ]+(?=h)/) || str.match(/[0-9 ]+(?=hrs)/) || str.match(/[0-9 ]+(?=hours)/) || str.match(/[0-9 ]+(?=hour)/) || str.match(/[0-9 ]+(?=hr)/);

        var mins = str.match(/[0-9 ]+(?=m)/) || str.match(/[0-9 ]+(?=mins)/) || str.match(/[0-9 ]+(?=minutes)/);
        
        
        var totalTime = (mins * 60) + (hours * 3600) + (days * 86400);
        
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

        //added onto time UNIX


    } else if(str == 'never'){
        var expireDate = 33468338387;
        var timeText = 'never'
    } else {
        var expireDate = 33468338387;
        var timeText = 'never'
    }

    function generateToken(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
    }
 
    if(tier == 'tier1') {
        var token = 't1' + generateToken(8)
        message.channel.send('Your Tier 1 token has arrivied! ||' + token + '|| (Expiry date: ' + timeText + ')')
        var whatTier = 't1'
        makeToken(expireDate, whatTier, token)

    } else if(tier == 'tier2') {
        var token = 't2' + generateToken(8)
        message.channel.send('Your Tier 2 token has arrivied! ||' + token + '|| (Expiry date: ' + timeText + ')')
        var whatTier = 't2'
        makeToken(expireDate, whatTier, token)

    } else if(tier == 'tier3') {
        var token = 't3' + generateToken(8)
        message.channel.send('Your Tier 3 token has arrivied! ||' + token + '|| (Expiry date: ' + timeText + ')')
        var whatTier = 't3'
        makeToken(expireDate, whatTier, token)

    } else if(tier == 'tSDG'){
        var token = 'sdg' + generateToken(15)
        message.channel.send('1 SDG Token coming right up! ||' + token + '|| (Expiry date: ' + timeText + ')')
        var whatTier = 'SDG'
        makeToken(expireDate, whatTier, token)

    }

    function makeToken(expireDate, whatTier, token) {
        pool.getConnection(function(err, conn) {
            var sql = "INSERT INTO boosterTokens (token, tier, expire) VALUES ?";
            var values = [
              [token, whatTier, expireDate]
            ];
            conn.query(sql, [values], function (err, result) {
                if (err) throw err;
              });
            conn.release()
          })
    }
    
}}