module.exports = {
	name: 'emit',
    description: 'For testing purposes',
    aliases: ['emit'],
	execute(Discord, client, pool, config, message, args) {

        if(!message.author.id == config.owner) {
            message.react('592017668777967616')
            return;
          }
          
        var type = args[0];
        if(!type) {
            message.channel.send('Provide an event to emit')
            return;
        }
        client.emit(type, message.member);
}}