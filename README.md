# This is an old project that is no longer maintained and has been abandoned. The bot is using an older Discord.JS library and needs to be updated to the latest one if you wish to use it.

# Pirate Jane
A bot for the Unturned Official Discord server(link removed)
######  I'm not very good at coding, so pls no make fun of me, k thx. Although any feedback would be nice.

## Info about the bot
Basic moderation/logging bot with a level system. 

Nearly every, if not all commands provide a syntax if you do not input any arguments. You can also use the help command to view the mini description of the command `!help <commandName|alias>`

## Current Features:
#### Full Logging system
  - This includes: Deleted messages (including images), edited messages, join/leave messages, Nickname changes, Role add/remove (will add more in the future. Not sure what, but will add anyways)
#### A level system with an infinite amount of levels
  - Roles awarded to those who reach a certain level
  - Daily level cap (only 100 messages will count per day)
  - A token system which allows a moderator to generate a token that boosts your XP gaining (With time limits)
    - Moderator generates one, then a user can redeem it with a command. 
  - Commands to revoke tokens from a user
  - A level command to display your level, xp, current token (if any)
  - Leaderboard
    - Also includes a "Set Leaderboard Channel" command
      - Leaderboard updates every hour
  - Different channels give more xp per message
#### Moderation Commands
  (You can use UserIDs instead of mentioning someone)
  - Ban command: Doesn't exist at the moment, but will be a feature
  - Kick command: `!kick @user reason` Reason can be ommited.
  - Mute command: `!mute @user reason | time` Reason and time can be ommited. Time can be specified in pretty much every way ie `1 day`, `24h`, `5 days 10h 10 minutes` 
  - Unmute command: `!unmute @user reason` Reason can be ommited. (The reason is just for the user (ie accidental mute))
  - Warn command: `!warn @user reason` Reason can be ommited. 
  - A user can check their own warnings by using `!warns` or check another users warnings (`!warns @user`)
  - Word blacklist system (Still sort of WIP)
    - Removes bad words, but mutes users who use the extra bad words. 
  - Add/remove role command (with restricted roles): `!<add|remove>role @user roleName` 
  - Purge command (Deletes bulk messages): `!purge amount`
#### Other
  - Help command: Just displays all the commands available
    - Works as a mini description command for other commands `!help <commandName|alias>`
  - Userinfo command: Shows (nearly) everything about you or another member in the server
  - Restart command: Restarts the bot with a small message before. (Works with pm2 or forever)
  - Botinfo command: Shows uptime, member count, ping, and if the database is up. 
  - Private Command: Verification: `!verify` Works only in the Unturned Official discord server. You visit a website, sign in with steam, get a randomly generated token assigned to your steamID, you then go to the UO discord server and use the verify command followed by the token. This command is there for those who want to get special roles (Ie. Gold Upgrade (Own the Gold Upgrade DLC for unturned) role, or Experienced role (Get it by having 2.4k hours in unturned))
  - Removes discord invite links, but ignores the Unturned Official discord invite


Note: The bot does require a specific database structure that I have not provided here, so if you want to try Jane out, you will need to message me to send it to you.
