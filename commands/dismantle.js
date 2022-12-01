const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables
const myfunc = require("../config/functions"); // get functions

class downgrade extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "return",
      category: "Shop",
      description: "Return command",
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

    let current = {
      user: {
        tag: message.author.username + "#" + message.author.discriminator,
      },
    };
    var args = message.content.split(" ");
    var items = []; // list of purchasable items
    var prices = []; // list of prices
    var emojis = []; // list of emojis
    // check items and prices and pushes them to the arrays
    Object.keys(config.shop.upgradeable).forEach((key) => {
      var name = config.shop.upgradeable[key].name;
      var price = config.shop.upgradeable[key].price;
      var emoji = config.shop.upgradeable[key].emoji;
      items.push(name);
      prices.push(price);
      emojis.push(emoji);
    });
    var changeitem = "";
    if (args[2]) {
      changeitem = myfunc.capitalizeFirstLetter(args[2]);
    }
    // looks up item and prices in the correct position
    var lookup = items.indexOf(changeitem);
    var myprice = prices[lookup];
    var myemoji = emojis[lookup];
    var thatitem = args[2].toUpperCase();
    // check if item is in the list and is not a number
    if (items.includes(changeitem) && isNaN(args[2]) && args[2].length) {
      connection.query(
        `SELECT * from players WHERE Discordid="${message.author.id}"`,
        function (error, results, fields) {
          if (error) throw error;
          if (results && results.length) {
            // current items and amounts
            let currentitem = {
              device: results[0].Device,
              money: results[0].Money,
            };
            // future amount
            let newValue = {
              money: currentitem.money + parseInt(myprice),
            };
            // check if the current item is one from the list (to be updated for compatibility with other items)
            if (currentitem.device == thatitem) {
              var sql = `UPDATE players SET Device = 'NONE', Money = '${newValue.money}' WHERE Discordid = '${message.author.id}'`;
              connection.query(sql, function (err, result) {
                if (err) throw err;
              });
              const exampleEmbed = new MessageEmbed()
                .setColor(config.color.success)
                .setDescription(
                  `**${current.user.tag}**, you just returned ${args[2]} for $${myprice} :coin:`
                )
                .setTitle(`SUCCESS`)
                .setThumbnail(`${message.author.avatarURL}`);
              return message.channel.createMessage(exampleEmbed.create);
            } else {
              // check if the item exists to return
              const exampleEmbed = new MessageEmbed()
                .setColor(config.color.error)
                .setDescription(
                  `**${current.user.tag}**, you don't have a ${myemoji} to return.`
                )
                .setTitle(`ERROR`)
                .setThumbnail(`${message.author.avatarURL}`);
              return message.channel.createMessage(exampleEmbed.create);
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
      // display the error message if the item does not exist in the list of items
      const exampleEmbed = new MessageEmbed()
        .setColor(config.color.error)
        .setDescription(
          `**${current.user.tag}**, this is an invalid item.\nWhat are you trying to return?\nCheck again if you made a spelling mistake\nor you entered invalid amount.`
        )
        .setTitle(`ERROR`)
        .setThumbnail(`${message.author.avatarURL}`);
      return message.channel.createMessage(exampleEmbed.create);
    }
  }
}

module.exports = downgrade;
