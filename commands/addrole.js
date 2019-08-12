module.exports = {
	name: 'addrole',
    description: 'Gives a user a role',
    aliases: ['giverole'],
	execute(Discord, client, pool, config, message, args) {

        if(!message.member.hasPermission("MANAGE_MESSAGES")) {
            message.react('592017668777967616')
            return;
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
              message.channel.send(':gear: Give user a role by name.\nUsage: `' + config.prefix + 'addrole {user} {Role Name}`\nAbusing this command in anyway will result in a punishment.')
              return;
          }

          var roleName = args.slice(1).join(' ');
          if(!roleName) {
              message.channel.send('You need to specify a role')
              return;
          }

            var roleN = roleName.toLowerCase()
            var role = message.guild.roles.find(role => role.name.toLowerCase() === roleN);

            if(!role) {
                message.channel.send('Role by the name `' + roleName + '` could not be found.')
                return;
            }


            member.addRole(role).catch(console.error);
            message.channel.send(member.user.tag + ' was given the `' + role.name + '` Role')

            const logs = message.guild.channels.find(channel => channel.name === config.logChannel);

            const embed = new Discord.RichEmbed()
            embed.setTitle(`Role granted using addrole command `)
            embed.setColor(role.color)
            embed.setTimestamp()
            embed.setDescription(member.user.tag + ' was given the <@&' + role.id + '> role')
            embed.addField('Moderator responsible', message.member.user.tag, false)
            logs.send({embed});
            
          
}}