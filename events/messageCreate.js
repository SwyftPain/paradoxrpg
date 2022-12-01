const { EventStructure } = require("simple-eris-command");
var { config } = require("../config/variables");

class MessageCreate extends EventStructure {
  constructor(client) {
    super(client, {
      name: "messageCreate",
    });
  }
  async run(message) {
    if (message.author.bot) return; // Ignore other bots and itself.
    // This is your prefix which your commands are gonna respond by.
    if (!message.content.startsWith(config.command.prefix)) return; // Ignore any message that does not start with your prefix.
    const args = message.content.slice(config.command.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const clientCommand =
      this.client.commands.get(command) ||
      this.client.commands.aliases.get(command);
    if (!clientCommand) return;
    if (
      clientCommand.supportServerOnly &&
      message.channel.guild.id !== config.setting.serverid
    )
      return; // If a command that's supportServerOnly is used in a guild isn't yours, do not run the command.
    if (
      clientCommand.guildOwnerOnly &&
      message.member.user.id !== message.channel.guild.ownerID
    )
      return; // If you only want the guild owner to be able to use a command.
    if (
      clientCommand.clientPermissions &&
      message.channel.guild &&
      clientCommand.clientPermissions.find(
        (p) =>
          !message.channel.guild.members
            .get(this.client.user.id)
            .permission.has(p)
      )
    )
      return; // If the command requires permissions for the client and it does not have them, do not run the command.
    if (
      clientCommand.userPermissions &&
      message.channel.guild &&
      clientCommand.userPermissions.find(
        (p) => !message.member.permission.has(p)
      )
    )
      return; // If the command requires permissions for the user and they do not have them, do not run the command.
    if (clientCommand.nsfw && !message.channel.nsfw) return; // If the command must be used in a nsfw channel and the channel isn't an nsfw one, do not run the command.
    if (clientCommand.ownerOnly && message.author.id !== config.setting.ownerid)
      return; // If the command is ownerOnly and the message author's ID is not yours, do not run the command. You can also make an array of ids so that you can have other owners.
    try {
      // run it if exists.
      await clientCommand.run(message, args);
    } catch (err) {
      console.log(err);
    }
  }
}
module.exports = MessageCreate;
