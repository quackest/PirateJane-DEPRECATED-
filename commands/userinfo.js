module.exports = {
	name: 'userinfo',
    description: '~~Stalk someone~~ Let\'s you see information about a user',
    aliases: ['whois', 'ui'],
	execute(Discord, client, pool, config, message, args, userInfo, func, shitself) {

        if(!message.member.hasPermission("MANAGE_MESSAGES")) {
            message.react('592017668777967616')
            return;
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
    const guild = message.guild;
    const status = {
        online: "Online",
        idle: "Idle",
        dnd: "Do Not Disturb",
        offline: "Offline"
      }
      var sortedmembers = message.guild.members.array().sort((a, b) => {
        a.joinedTimestamp - b.joinedTimestamp
    })
    var roleNumber = (Number(member.roles.size)- 1)
    var roleList = member.roles.map(role => role).join(' ').replace('@everyone', '')
    var position = sortedmembers.indexOf(member)
    //console.log(member)
    var ts = new Date(member.user.createdTimestamp);
    var joined = new Date(member.joinedAt)
    const embed = new Discord.RichEmbed()
    embed.setDescription(member)
    embed.setColor(member.displayHexColor)
    embed.setAuthor(member.user.tag, member.user.avatarURL)
    embed.setThumbnail(member.user.avatarURL)
    embed.setFooter('ID: ' + member.user.id);
    embed.addField('Status', status[member.user.presence.status], true)
    embed.addField('Registered', ts.toDateString(), true)
    embed.addField('Join Position', position , true)
    embed.addField('Join date', joined.toDateString(), true)
    if(!roleList) {
    embed.addField('Roles [0]', 'None', true)
    } else {
    embed.addField('Roles [' + roleNumber + ']', roleList, true)  
    }
    
    var permCheck = checkPerms(member)
    if(!permCheck[0]){
    embed.addField('Permissions', 'None', false)
    } else {
    embed.addField('Permissions', checkPerms(member).join(', '), false)
    }


    message.channel.send({embed});

    function checkPerms(member) {
        var permsList = [];

        if(member.hasPermission("ADMINISTRATOR")) {
            permsList.push('Administrator')
        }
        if(member.hasPermission("BAN_MEMBERS")) {
            permsList.push('Ban Members')
        }
        if(member.hasPermission("MANAGE_CHANNELS")) {
            permsList.push('Manage Channels')
        }
        if(member.hasPermission("MANAGE_GUILD")) {
            permsList.push('Manage Server')
        }
        if(member.hasPermission("MANAGE_MESSAGES")) {
            permsList.push('Manage Messages')
        }
        if(member.hasPermission("MENTION_EVERYONE")) {
            permsList.push('Mention Everyone')
        }
        if(member.hasPermission("MUTE_MEMBERS")) {
            permsList.push('Mute Members')
        }
        if(member.hasPermission("MANAGE_ROLES")) {
            permsList.push('Manage Roles')
        }

        return permsList;
    }

}}