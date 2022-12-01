const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables
const myfunc = require("../config/functions"); // get functions

class buy extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "buy",
      category: "Shop",
      description: "Buy command",
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
    // check items and prices and pushes them to the arrays
    Object.keys(config.shop.buyable).forEach((key) => {
      var name = config.shop.buyable[key].name;
      var price = config.shop.buyable[key].price;
      items.push(name);
      prices.push(price);
    });
    let declare = {
      item: args[2],
      amount: args[3],
    };
    // store user object
    let currents = {
      user: {
        tag: message.author.username + "#" + message.author.discriminator,
      },
    };
    // check if item exists in the list, the amount is a number and greater than zero
    var changeitem = "";
    if (args[2]) {
      changeitem = myfunc.capitalizeFirstLetter(args[2]);
    }
    // looks up item and prices in the correct position
    var lookup = items.indexOf(changeitem);
    var myprice = prices[lookup];
    if (
      (items.includes(changeitem) && isNaN(declare.item) && args[2]) ||
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
            let current = {
              items: {
                item: showitem,
                money: results[0].Money,
              },
            };
            // Values of items when using "buy all"
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
            // how much of a particular item can be bought for the current amount of money
            var howmany = current.items.money / myprice;
            // remove decimals
            var howmanyround = Math.floor(howmany);
            // future amount of items after the command
            let price = {
              all: myprice * howmanyround,
              specified: myprice * amount,
            };
            // total amount of money and the item after selling
            let newvalue = {
              Item: {
                all: howmanyround + current.items.item,
                specified: current.items.item + parseInt(amount),
              },
              Money: {
                all: current.items.money - price.all,
                specified: current.items.money - price.specified,
              },
            };
            // check if there is not enough money or maximum amount of purchasable items is lower than 1
            if (
              newvalue.Money.all < 0 ||
              newvalue.Money.specified < 0 ||
              howmanyround < 1
            ) {
              const exampleEmbed = new MessageEmbed()
                .setColor(config.color.error)
                .setDescription(
                  `**${currents.user.tag}**, you don't have enough :coin: to buy this.`
                )
                .setTitle(`ERROR`)
                .setThumbnail(`${message.author.avatarURL}`);
              return message.channel.createMessage(exampleEmbed.create);
            } else {
              // check if the amount is "all" equaling to the maximum amount of items user can buy for the amount of money they have
              if (args[3] == "all") {
                var sql = `UPDATE players SET ${changeitem} = '${newvalue.Item.all}', Money = '${newvalue.Money.all}' WHERE Discordid = '${message.author.id}'`;
                connection.query(sql, function (err, result) {
                  if (err) throw err;
                });
                const exampleEmbed = new MessageEmbed()
                  .setColor(config.color.success)
                  .setDescription(
                    `**${currents.user.tag}**, you just bought ${howmanyround} ${declare.item} for $${price.all} :coin:`
                  )
                  .setTitle(`SUCCESS`)
                  .setThumbnail(`${message.author.avatarURL}`);
                return message.channel.createMessage(exampleEmbed.create);
              } else {
                // buy an item if the amount does not equal to "all"
                var sql = `UPDATE players SET ${changeitem} = '${newvalue.Item.specified}', Money = '${newvalue.Money.specified}' WHERE Discordid = '${message.author.id}'`;
                connection.query(sql, function (err, result) {
                  if (err) throw err;
                });
                const exampleEmbed = new MessageEmbed()
                  .setColor(config.color.success)
                  .setDescription(
                    `**${currents.user.tag}**, you just bought ${amount} ${declare.item} for $${price.specified} :coin:`
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
      const exampleEmbed = new MessageEmbed()
        .setColor(config.color.error)
        .setDescription(
          `**${currents.user.tag}**, this is an invalid item.\nWhat are you trying to buy?\nCheck again if you made a spelling mistake\nor you entered invalid amount.`
        )
        .setTitle(`ERROR`)
        .setThumbnail(`${message.author.avatarURL}`);
      return message.channel.createMessage(exampleEmbed.create);
    }
  }
}

module.exports = buy;
