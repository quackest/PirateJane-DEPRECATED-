module.exports = {
	name: 'help',
    description: 'Shows the list of commands',
    aliases: ['commands'],
	execute(Discord, client, pool, config, message, args, userInfo, func, shitself) {


        if(message.channel.name !== 'command-spam') {
            if(message.channel.name !== 'voice-and-bot-commands') {
              if(!message.member.hasPermission("MANAGE_MESSAGES")) {
                return;
              }      
          }
        }

        const data = [];
        const { commands } = message.client;
        
        if (!args.length) {
            const embed = new Discord.RichEmbed()
            embed.setTitle('Help')
            embed.setColor(0xFFB6C1)
            embed.setTimestamp()
            embed.addField('Commands', commands.map(command => '`' + config.prefix + command.name + '`').join(', '), true);
            //embed.addField('Commands', commands.map(command => command.description).join('\n'), true);
            embed.setDescription(`\nYou can send \`${config.prefix}help [command name]\` to get info on a specific command!`);

            return message.channel.send({embed})
        }
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.channel.send('<:turd:592017668777967616> Command by the name `' + args[0] + '` does not exist.');
        }

        const embed = new Discord.RichEmbed()
        embed.setTitle(command.name)
        embed.setColor(0xFFB6C1)
        embed.setTimestamp()
        if (command.aliases) embed.addField('Aliases', command.aliases.join(', '));
        if (command.description) embed.addField('Description', command.description);
        
        message.channel.send({embed});
    
}}