module.exports = {
	name: 'test',
    description: 'Testing',
    aliases: ['tester'],
	execute(Discord, client, pool, config, message, args, userInfo, func, shitself) {



    if(message.author.id != config.owner) {
      message.react('592017668777967616')
      return;
    }





    var str = args.join(" ")
    console.log(JSON.parse(str))

    //define the usable variables
    var world = 'world' //{tester}
    var user = message.member.user.tag //{user}


    //Join the args together, seperating them with a space
    

    //check if it includes a usable variable, if it does, replace it with whatever
    if(str.includes('{world}')) {
        str = str.replace('{world}', world)
    }
    
    if(str.includes('{user}')) {
      str = str.replace('{user}', user)
    }

    //send the message

    message.channel.send(str)


}}