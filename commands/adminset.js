const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables
const myfunc = require("../config/functions"); // get functions

class set extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "adminset",
      aliases: ["set", "aset"],
      category: "Cheat code",
      description: "Change somebody stats",
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
      `SELECT * from players WHERE Discordid="${message.author.id}" AND Moder='1'`,
      function (error, results, fields) {
        if (error) throw error;
        if (results && results.length) {
          // list of settable items
          var items = [
            "Energy",
            "Fans",
            "Medicine",
            "Level",
            "Money",
            "Xp",
            "Xpneeded",
            "Maxenergy",
            "Title",
            "Dname",
            "Moder",
            "Games",
            "Replays",
            "Subs",
            "Antivirus",
            "Device",
            "Vpn",
            "Credit",
          ];
          var args = message.content.split(" ");
          var item = args[2];
          var changeitem = myfunc.capitalizeFirstLetter(args[2]);
          // check if the item exists in the list, if the user is mentioned and if amount is a number that is greater than zero
          if (
            args[2] &&
            args[4] &&
            !isNaN(args[4]) &&
            args[4] > 0 &&
            message.mentions.length &&
            items.includes(changeitem)
          ) {
            var ment = JSON.stringify(message.mentions);
            const obj = JSON.parse(ment); // get the mentioned user object so we can access the id
            let tagged = {
              user: {
                id: obj[0].id,
                username: obj[0].username,
                avatar: obj[0].avatar,
                tag: obj[0].username + "#" + obj[0].discriminator,
              },
            };
            connection.query(
              `SELECT * from players WHERE Discordid="${tagged.user.id}"`,
              function (error, results, fields) {
                if (error) throw error;
                if (results && results.length) {
                  var sql = `UPDATE players SET ${changeitem} = '${args[4]}' WHERE Discordid = '${tagged.user.id}'`;
                  connection.query(sql, function (err, result) {
                    if (err) throw err;
                  });
                  const exampleEmbed = new MessageEmbed()
                    .setColor(config.color.success)
                    .setDescription(
                      `<@${message.author.id}> set <@${tagged.user.id}>'s ${item} to ${args[4]}.`
                    );
                  return message.channel.createMessage(exampleEmbed.create);
                } else {
                  // if the user does not exist in the database, show error message
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
          } else if (!items.includes(changeitem)) {
            // if item is not includes in the list
            return;
          } else {
            // get the value of the item being changed
            var mytitle = message.content.slice(
              args[0].length + args[1].length + args[2].length + 3
            );
            connection.query(
              `SELECT * from players WHERE Discordid="${message.author.id}"`,
              function (error, results, fields) {
                if (error) throw error;
                if (results && results.length) {
                  var sql = `UPDATE players SET ${changeitem} = '${mytitle}' WHERE Discordid = '${message.author.id}'`;
                  connection.query(sql, function (err, result) {
                    if (err) throw err;
                  });
                  const exampleEmbed = new MessageEmbed()
                    .setColor(config.color.success)
                    .setDescription(
                      `<@${message.author.id}> set own ${item} to ${mytitle}`
                    );
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
        } else {
          return;
        }
      }
    );
  }
}

module.exports = set;
