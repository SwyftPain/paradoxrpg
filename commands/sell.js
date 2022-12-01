const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables
const myfunc = require("../config/functions"); // get functions

class sell extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "sell",
      category: "Shop",
      description: "Sell command",
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
    var items = []; // list of purchasable items
    var prices = []; // list of prices
    var emojis = []; // list of emojis
    // check items and prices and pushes them to the arrays
    Object.keys(config.shop.buyable).forEach((key) => {
      var name = config.shop.buyable[key].name;
      var price = config.shop.buyable[key].price;
      var emoji = config.shop.buyable[key].emoji;
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
    let declare = {
      item: args[2],
      amount: args[3],
    };
    // store user object
    let current = {
      user: {
        tag: message.author.username + "#" + message.author.discriminator,
      },
    };
    // check if item is in the list and amount is a number higher than 0 (to be changed for compatibility with other items in the future)
    if (
      (changeitem.includes(items) && isNaN(declare.item)) ||
      declare.amount == "all"
    ) {
      connection.query(
        `SELECT * from players WHERE Discordid="${message.author.id}"`,
        function (error, results, fields) {
          if (error) throw error;
          if (results && results.length) {
            // evaluates the mysql query results to adjust for the correct item
            var check = `results[0].${changeitem}`;
            var showitem = eval(check);
            // current amount of items
            let items = {
              item: showitem,
              money: results[0].Money,
            };
            // check if amount is provided and if not, default to 1
            var amount = 1;
            if (
              declare.amount &&
              !isNaN(declare.amount) &&
              declare.amount > 0
            ) {
              amount = declare.amount;
            } else {
              amount = 1;
            }
            // Values of items when using "buy all"
            let price = {
              all: myprice * items.item,
              specified: myprice * amount,
            };
            // total amount of money and medicine after selling
            let newvalue = {
              Item: items.item - parseInt(amount),
              Money: {
                all: items.money + price.all,
                specified: items.money + price.specified,
              },
            };
            // if the item is not in the inventory or maximum is less than 0
            if (newvalue.Item < 0 || items.item < 1) {
              const exampleEmbed = new MessageEmbed()
                .setColor(config.color.error)
                .setDescription(
                  `**${current.user.tag}**, you don't have that many ${myemoji} to sell.`
                )
                .setTitle(`ERROR`)
                .setThumbnail(`${message.author.avatarURL}`);
              return message.channel.createMessage(exampleEmbed.create);
            } else {
              // if the amount is all, sell maximum amount possible
              if (args[3] == "all") {
                var sql = `UPDATE players SET ${changeitem} = '0', Money = '${newvalue.Money.all}' WHERE Discordid = '${message.author.id}'`;
                connection.query(sql, function (err, result) {
                  if (err) throw err;
                });
                const exampleEmbed = new MessageEmbed()
                  .setColor(config.color.success)
                  .setDescription(
                    `**${current.user.tag}**, you just sold ${items.item} ${args[2]} for $${price.all} :coin:`
                  )
                  .setTitle(`SUCCESS`)
                  .setThumbnail(`${message.author.avatarURL}`);
                return message.channel.createMessage(exampleEmbed.create);
              } else {
                // if the amount is a number, sell that amount
                var sql = `UPDATE players SET ${changeitem} = '${newvalue.Item}', Money = '${newvalue.Money.specified}' WHERE Discordid = '${message.author.id}'`;
                connection.query(sql, function (err, result) {
                  if (err) throw err;
                });
                const exampleEmbed = new MessageEmbed()
                  .setColor(config.color.success)
                  .setDescription(
                    `**${current.user.tag}**, you just sold ${amount} ${args[2]} for $${price.specified} :coin:`
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
      // error message if the item is not in the list
      const exampleEmbed = new MessageEmbed()
        .setColor(config.color.standard)
        .setDescription(
          `**${current.user.tag}**, this is an invalid item.\nWhat are you trying to sell?\nCheck again if you made a spelling mistake\nor you entered invalid amount.`
        )
        .setTitle(`ERROR`)
        .setThumbnail(`${message.author.avatarURL}`);
      return message.channel.createMessage(exampleEmbed.create);
    }
  }
}

module.exports = sell;
