const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables

class inventory extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "inventory",
      aliases: ["i"],
      category: "Stats",
      description: "Show owned items",
    });
  }

  run(message) {
    function help() {
      const exampleEmbed = new MessageEmbed()
        .setColor(config.color.info)
        .setTitle("Help")
        .setDescription(config.help.message);
      return message.channel.createMessage(exampleEmbed.create);
    }

    var args = message.content.split(" ");
    var mentionexist = Object.keys(message.mentions).length; // check if there are any user mentions
    if (args[1] && mentionexist > 0) {
      var ment = JSON.stringify(message.mentions);
      const obj = JSON.parse(ment); // get the user object
      var tagged = {
        user: {
          id: obj[0].id,
          username: obj[0].username,
          avatar: obj[0].avatar,
          tag: obj[0].username + "#" + obj[0].discriminator,
        },
      };
      var avatar = {
        url: `https://cdn.discordapp.com/avatars/${tagged.user.id}/${tagged.user.avatar}.jpg`,
      };
    } else {
      var tagged = {
        user: {
          id: message.author.id,
          username: message.author.username,
          avatar: message.author.avatar,
          tag: message.author.username + "#" + message.author.discriminator,
        },
      };
      var avatar = {
        url: `https://cdn.discordapp.com/avatars/${tagged.user.id}/${tagged.user.avatar}.jpg`,
      };
    }
    connection.query(
      `SELECT * from players WHERE Discordid="${tagged.user.id}"`,
      function (error, results, fields) {
        if (error) throw error;
        if (results && results.length) {
          // get the current amount of items
          var items = {
            fans: results[0].Fans,
            medicine: results[0].Medicine,
          };
          // empty messages if items do not exist
          var medicinemessage = "";
          var fansmessage = "";
          var itemmessage = "";
          // messages if items do exist
          switch (true) {
            case items.medicine > 0:
              medicinemessage = `\n:syringe: **medicine**: ${items.medicine}`;
              break;
            default:
              medicinemessage = "";
              break;
          }
          switch (true) {
            case items.fans > 0:
              fansmessage = `\n:troll: **fans**: ${items.fans}`;
              break;
            default:
              fansmessage = "";
              break;
          }
          switch (true) {
            case items.medicine > 0 || items.fans > 0:
              itemmessage = `${fansmessage}${medicinemessage}`;
              break;
            default:
              itemmessage = "None";
              break;
          }
          const exampleEmbed = new MessageEmbed()
            .setColor(config.color.info)
            .setAuthor(`${tagged.user.username} — inventory`, `${avatar.url}`)
            .addField("Items", `${itemmessage}`, true);
          return message.channel.createMessage(exampleEmbed.create);
        } else {
          // error message if the user has not played before
          const exampleEmbed = new MessageEmbed()
            .setColor(config.color.error)
            .setTitle("Error")
            .setDescription(
              `**${tagged.user.tag}** has not played with me yet.`
            );
          return message.channel.createMessage(exampleEmbed.create);
        }
      }
    );
  }
}

module.exports = inventory;
