const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables

class upshop extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "extras",
      category: "Shop",
      description: "Extras shop",
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

    connection.query(
      `SELECT * from players WHERE Discordid="${message.author.id}"`,
      function (error, results, fields) {
        if (error) throw error;
        if (results && results.length) {
          const exampleEmbed = new MessageEmbed();
          exampleEmbed.setColor(config.color.info);
          exampleEmbed.setTitle("Shop");
          exampleEmbed.setDescription(
            `Hey, **${message.author.username}**! Craft anything with \`\`upgrade [item]\`\``
          );
          Object.keys(config.shop.upgradeable).forEach((key) => {
            exampleEmbed.addField(
              `${config.shop.upgradeable[key].emoji} __${config.shop.upgradeable[key].name}__`,
              `${config.shop.upgradeable[key].desc} | **${config.shop.upgradeable[key].price}** :coin:`,
              false
            );
          });
          return message.channel.createMessage(exampleEmbed.create);
        } else {
          // if the user executing the command does not exist in the database, add it to the database
          var sql = `INSERT INTO players (Title, Medicine, Discordid, Played, Fans, Level, Money, Xp, Xpneeded, Energy, Maxenergy, Dname, Moder, Games, Replays, Subs, Antivirus, Device, Vpn, Credit) VALUES (' ', '0', '${message.author.id}', '1', '1', '1', '0', '0', '10', '100', '100','${message.author.username}', '0', '0', '0', '0', '0', 'NONE', 'NONE', '0')`;
          connection.query(sql, function (err, result) {
            if (err) throw err;
          });
          help();
        }
      }
    );
  }
}

module.exports = upshop;
