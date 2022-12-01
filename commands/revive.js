const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables

class revive extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "revive",
      aliases: ["r"],
      category: "Energy",
      description: "Heal yourself",
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
          // get current amount of money and medicine
          let items = {
            Life: results[0].Energy,
            Medicine: results[0].Medicine,
            Maxlife: results[0].Maxenergy,
          };
          // new amount of medicine
          let newValue = {
            medicine: {
              amount: items.Medicine - 1,
            },
          };
          // check if health is full and medicine is higher than 0
          if (items.Medicine > 0 && items.Life < items.Maxlife) {
            var sql = `UPDATE players SET Medicine = '${newValue.medicine.amount}', Energy = '${items.Maxlife}' WHERE Discordid = '${message.author.id}'`;
            connection.query(sql, function (err, result) {
              if (err) throw err;
            });
            const exampleEmbed = new MessageEmbed()
              .setColor(config.color.success)
              .setTitle("Success")
              .setDescription(
                `Hey, **${message.author.username}**! You successfully healed yourself!\nYou now got ${items.Maxlife}/${items.Maxlife} energy.`
              );
            return message.channel.createMessage(exampleEmbed.create);
          } else {
            // error message if user does not have any medicine
            const exampleEmbed = new MessageEmbed()
              .setColor(config.color.error)
              .setTitle("Error")
              .setDescription(
                `Hey, **${message.author.username}**!\nYou don't have enough medicine to heal yourself or your energy is full!\nBuy one (if needed) in the \`\`${config.command.prefix}shop\`\``
              );
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
  }
}

module.exports = revive;
