module.exports = {
	name: 'botinfo',
    description: 'Shows bot info',
    aliases: ['bi', 'binfo'],
	execute(Discord, client, pool, config, message, args, userInfo, func, shitself) {
const art = `       .___,   
    ___('v')___
    \`"-\._./-"'
        ^ ^    
`
        if(message.channel.name !== 'command-spam') {
            if(message.channel.name !== 'voice-and-bot-commands') {
            if(!message.member.hasPermission("MANAGE_MESSAGES")) {
                return;
            }      
        }
        }

        let boomer;

        if(shitself == true) {
            boomer = 'Down.'
        } else if (shitself == false) {
            boomer = 'Fine.'
        }

        //total uptime
        var uptime = process.uptime();
        var days = Math.floor((uptime % 31536000) / 86400);
        var hours = Math.floor((uptime % 86400) / 3600);
        var minutes = Math.floor((uptime % 3600) / 60);
        var seconds = Math.round(uptime % 60);
        var botuptime = (days > 0 ? days + "d, ":"") + (hours > 0 ? hours + "h, ":"") + (minutes > 0 ? minutes + "m, ":"") + (seconds > 0 ? seconds + "s":"")
        //message.guild.fetchMembers()

        const embed = new Discord.RichEmbed()
        .setTitle('Pirate Jane')
        .setColor(0xDC143C)
        .setFooter(message.author.tag)
        .setTimestamp()
        .addField("Uptime", botuptime, true)
        .addField('Ping', Math.round(client.ping) + 'ms', false)
        .addField('Members', client.users.size, true)
        .setDescription('```' + art + '```')
        .addField('Database Status', boomer, false)
        message.channel.send({embed});
}}