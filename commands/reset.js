const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables

class reset extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "reset",
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

    // check if the user is a mod in database
    connection.query(
      `SELECT * from players WHERE Discordid="${message.author.id}" AND Moder='1'`,
      function (error, results, fields) {
        if (error) throw error;
        if (results && results.length) {
          var args = message.content.split(" ");
          var mentionexist = Object.keys(message.mentions).length; // check if there are any user mentions
          if (args[2] && mentionexist > 0) {
            var ment = JSON.stringify(message.mentions);
            const obj = JSON.parse(ment); // store the user object
            let tagged = {
              user: {
                id: obj[0].id,
              },
            };
            connection.query(
              `SELECT * from players WHERE Discordid="${tagged.user.id}"`,
              function (error, results, fields) {
                if (error) throw error;
                if (results && results.length) {
                  var sql = `UPDATE players SET Energy = '100', Fans = '0', Medicine = '0', Level = '1', Money = '0', Xp = '0', Xpneeded = '10', Maxenergy = '100', Title = '', Games = '0', Replays = '0', Subs = '0', Antivirus = '0', Device = 'NONE', Vpn = 'NONE', Credit = '0' WHERE Discordid = '${obj[0].id}'`;
                  connection.query(sql, function (err, result) {
                    if (err) throw err;
                  });
                  const exampleEmbed = new MessageEmbed()
                    .setColor(config.color.info)
                    .setDescription(
                      `<@${message.author.id}> reset <@${tagged.user.id}>'s profile.`
                    );
                  return message.channel.createMessage(exampleEmbed.create);
                } else {
                  // error message if the user has not played yet
                  const exampleEmbed = new MessageEmbed()
                    .setColor(config.color.standard)
                    .setTitle("Error")
                    .setDescription(
                      `**${obj[0].username}#${obj[0].discriminator}** has not played with me yet.`
                    );
                  return message.channel.createMessage(exampleEmbed.create);
                }
              }
            );
          } else {
            connection.query(
              `SELECT * from players WHERE Discordid="${message.author.id}"`,
              function (error, results, fields) {
                if (error) throw error;
                if (results && results.length) {
                  var sql = `UPDATE players SET Energy = '100', Fans = '0', Medicine = '0', Level = '1', Money = '0', Xp = '0', Xpneeded = '10', Maxenergy = '100', Title = '', Games = '0', Replays = '0', Subs = '0', Antivirus = '0', Device = 'NONE', Vpn = 'NONE', Credit = '0' WHERE Discordid = '${message.author.id}'`;
                  connection.query(sql, function (err, result) {
                    if (err) throw err;
                  });
                  const exampleEmbed = new MessageEmbed()
                    .setColor(config.color.info)
                    .setDescription(
                      `<@${message.author.id}> reset own profile.`
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

module.exports = reset;
