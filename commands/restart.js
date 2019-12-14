module.exports = {
	name: 'restart',
    description: 'Restarts the bot',
    aliases: ['restart'],
	execute(Discord, client, pool, config, message, args, userInfo, func, shitself) {


        if(shitself == false) {
        if(message.author.id !== config.owner) {
            message.react('592017668777967616')
            return;
          }
        } else {
          if(!message.member.hasPermission("BAN_MEMBERS")) {
            message.react('592017668777967616')
            return;
        }
        }

          message.channel.send('*brb.*')
          setTimeout(restart, 1000)
          
        function restart() {
        process.exit()
        }
          
          

    }}