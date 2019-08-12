module.exports = {
	name: 'test',
    description: 'Testing',
    aliases: ['tester'],
	execute(Discord, client, pool, config, message, args) {

    if(!message.author.id == config.owner) {
      message.react('592017668777967616')
      return;
    }



    message.channel.fetchMessages({ limit: 1 }).then(messages => {
      var lastMessage = messages.first();
      
      if (!lastMessage.author.bot) {
        message.react('🚩');
      }
    })
    .catch(console.error);


}}