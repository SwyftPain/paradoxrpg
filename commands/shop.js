const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables

class shop extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "shop",
      category: "Shop",
      description: "Shop",
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
            `Hey, **${message.author.username}**! Buy anything with \`\`buy [item]\`\``
          );
          Object.keys(config.shop.buyable).forEach((key) => {
            // config.shop.buyable.medicine config.shop.upgradeable.phone
            exampleEmbed.addField(
              `${config.shop.buyable[key].emoji} __${config.shop.buyable[key].name}__`,
              `${config.shop.buyable[key].desc} | **${config.shop.buyable[key].price}** :coin:`,
              false
            );
          });
          return message.channel.createMessage(exampleEmbed.create);
        } else {
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

module.exports = shop;
