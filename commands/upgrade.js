const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables
const myfunc = require("../config/functions"); // get functions

class upgrade extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "upgrade",
      category: "Shop",
      description: "Upgrade command",
    });
  }

  run(message) {
    function help() {
      const exampleEmbed = new MessageEmbed()
        .setColor(config.color.info)
        .setTitle("Help")
        .setDescription(`${config.help.message}`);
      return message.channel.createMessage(exampleEmbed.create);
    }

    // store user object
    let current = {
      user: {
        tag: message.author.username + "#" + message.author.discriminator,
      },
    };
    var args = message.content.split(" ");
    var items = []; // list of purchasable items
    var prices = []; // list of prices
    // check items and prices and pushes them to the arrays
    Object.keys(config.shop.upgradeable).forEach((key) => {
      var name = config.shop.upgradeable[key].name;
      var price = config.shop.upgradeable[key].price;
      items.push(name);
      prices.push(price);
    });
    var item = args[2];
    var changeitem = "";
    if (args[2]) {
      changeitem = myfunc.capitalizeFirstLetter(args[2]);
    }
    // looks up item and prices in the correct position
    var lookup = items.indexOf(changeitem);
    var price = prices[lookup];
    // check if the item is in the list and is not a number
    if (items.includes(changeitem) && isNaN(args[2])) {
      var toupper = item.toUpperCase();
      connection.query(
        `SELECT * from players WHERE Discordid="${message.author.id}"`,
        function (error, results, fields) {
          if (error) throw error;
          if (results && results.length) {
            // store current values
            let myitems = {
              Device: results[0].Device,
              Money: results[0].Money,
            };
            // store values after upgrading
            let newValue = {
              Device: toupper,
              Money: myitems.Money - price,
            };
            // check if the user has a device they are buying
            if (myitems.Device == toupper) {
              const exampleEmbed = new MessageEmbed()
                .setColor(config.color.error)
                .setDescription(
                  `**${current.user.tag}**, you already have a ${args[2]}.`
                )
                .setTitle(`ERROR`)
                .setThumbnail(`${message.author.avatarURL}`);
              return message.channel.createMessage(exampleEmbed.create);
            } else {
              // if the user does not have enough money
              if (newValue.Money < 0) {
                const exampleEmbed = new MessageEmbed()
                  .setColor(config.color.error)
                  .setDescription(
                    `**${current.user.tag}**, you don't have enough :coin: to upgrade your device.`
                  )
                  .setTitle(`ERROR`)
                  .setThumbnail(`${message.author.avatarURL}`);
                return message.channel.createMessage(exampleEmbed.create);
              } else {
                // if the user has enough money
                var sql = `UPDATE players SET Device = '${newValue.Device}', Money = '${newValue.Money}' WHERE Discordid = '${message.author.id}'`;
                connection.query(sql, function (err, result) {
                  if (err) throw err;
                });
                const exampleEmbed = new MessageEmbed()
                  .setColor(config.color.success)
                  .setDescription(
                    `**${current.user.tag}**, you just bought ${args[2]} for $${price} :coin:`
                  )
                  .setTitle(`SUCCESS`)
                  .setThumbnail(`${message.author.avatarURL}`);
                return message.channel.createMessage(exampleEmbed.create);
              }
            }
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
    } else {
      // if the item is not in the list
      const exampleEmbed = new MessageEmbed()
        .setColor(config.color.standard)
        .setDescription(
          `**${current.user.tag}**, this is an invalid item.\nWhat are you trying to upgrade?\nCheck again if you made a spelling mistake\nor you entered invalid amount.`
        )
        .setTitle(`ERROR`)
        .setThumbnail(`${message.author.avatarURL}`);
      return message.channel.createMessage(exampleEmbed.create);
    }
  }
}

module.exports = upgrade;
