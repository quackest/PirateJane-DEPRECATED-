module.exports = {
	name: 'purge',
    description: 'Purges x amount of messages.',
    aliases: ['prune'],
	execute(Discord, client, pool, config, message, args, userInfo, func, shitself) {

        if(!message.member.hasPermission("MANAGE_MESSAGES")) {
            message.react('592017668777967616')
            return;
          }
        const logs = message.guild.channels.find(channel => channel.name === config.logChannel);
        var amount = args[0];

        if(!amount) {
            message.channel.send(':gear: Purge command. Purges X amount of messages.\nUsage: `' + config.prefix + 'purge {amount}`');
            return;
        }

        if(amount > 100) {
            message.delete()
            message.channel.send(`That's more than the recommended! React with <:Yes:605916785472045067> to continue`)
            .then((msg) => {
                
                msg.react('605916785472045067')
                msg.react('605916713976070174')
            
        const filter = (reaction, user) => {
            return ['605916785472045067', '605916713976070174'].includes(reaction.emoji.id) && user.id === message.author.id;
        }
        msg.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
            .then(collected => {
                const reaction = collected.first();

                if (reaction.emoji.id === '605916785472045067') {
                    
                    var check = Math.floor(amount / 100);

                    var amount2 = amount;
                    var i;
                    var test = 0;
                  for (i = 0; i < check; i++) { 
                    message.channel.bulkDelete(100)
                    var test = test + 1
                    var amount2 = amount2 - 100
                   }
                   if(!amount2 == 0) {
                     message.channel.bulkDelete(amount2)
                   }
                    const embed = new Discord.RichEmbed()
                    embed.setTitle('Purge')
                    embed.setColor(0xFF4500)
                    embed.setFooter(message.author.id)
                    embed.setTimestamp()
                    embed.setDescription('In channel ' + message.channel + ', ' + amount + ' messages were deleted by ' + message.author.tag)
                    logs.send({embed})
                } else {
                    
                    message.channel.send('Purge stopped.')
                }
            })
            .catch(collected => {
                msg.delete()
                message.reply('You didn\'t react, so I canceled the purge.');
                return;
            });
            })

        } else {

            //message.delete()
            
                const embed = new Discord.RichEmbed()
                embed.setTitle('Purge')
                embed.setColor(0xFF4500)
                embed.setFooter(message.author.id)
                embed.setTimestamp()
                embed.setDescription('In channel ' + message.channel + ', ' + amount + ' messages were deleted by ' + message.author.tag)
                logs.send({embed})
              message.channel.bulkDelete(amount)
        }

}}