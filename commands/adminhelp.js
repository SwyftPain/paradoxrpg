const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables

class adminhelp extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "adminhelp",
      aliases: ["ah", "ahelp"],
      category: "Admin Help",
      description: "Admin Help command",
    });
  }

  run(message) {
    function help() {
      const exampleEmbed = new MessageEmbed()
        .setColor(config.color.info)
        .setTitle("Help")
        .setDescription(`${config.help.admin.message}`)
        .setFooter(`${config.help.admin.format.message}`);
      return message.channel.createMessage(exampleEmbed.create);
    }

    connection.query(
      `SELECT * from players WHERE Discordid="${message.author.id}"`,
      function (error, results, fields) {
        if (error) throw error;
        if (results && results.length) {
          help();
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

module.exports = adminhelp;
