const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables
const fs = require("fs");

// get the list of available commands
function getFiles(dir, files_) {
  files_ = files_ || [];
  var files = fs.readdirSync(dir);
  for (var i in files) {
    var name = dir + "/" + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push(name.replace(".txt", "").replace(dir + "/", ""));
    }
  }
  return files_;
}

// list of commands in rank 1
var rankon = getFiles(__dirname + "/rankone");
var rankone = rankon.toString();
// list of always available commands
var alway = getFiles(__dirname + "/always");
var always = alway.toString();

class help extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "donate",
      category: "Donation",
      description: "Donation command",
    });
  }

  run(message) {
    function help() {
      const exampleEmbed = new MessageEmbed()
        .setColor(config.color.info)
        .setTitle("Help")
        .setDescription(
          `Remember to use \`\`${config.command.prefix.slice(
            0,
            -1
          )}\`\` before any command.\n\nThis bot is still in early stages of development,\nmore features coming...\n\nCommands available in any rank:\n\`\`${always.replace(
            /,/g,
            ", "
          )}\`\`\n\nHere are some of my commands:\n:one: \`\`${rankone
            .replace(/,/g, ", ")
            .replace(
              "adminhelp, adminset, buy, cooldown, daily, help, inventory, profile, ready, revive, shop, ",
              ""
            )
            .replace(/1/g, "")}\`\``
        );
      return message.channel.createMessage(exampleEmbed.create);
    }

    function donate() {
      const exampleEmbed = new MessageEmbed()
        .setColor(config.color.info)
        .setTitle("Donate")
        .setDescription(
          `If you wish to help with development and speed up the improvements and implementation of more functions, stats, commands and more, please consider donating via paypal to:\n\n\`\`nikolamatic225@gmail.com\`\`\n\nAnd make sure to put your discord tag (**user#discriminator**) in notes to get some bonus credits you will be able to use in the shop.`
        );
      return message.channel.createMessage(exampleEmbed.create);
    }

    connection.query(
      `SELECT * from players WHERE Discordid="${message.author.id}"`,
      function (error, results, fields) {
        if (error) throw error;
        if (results && results.length) {
          donate();
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

module.exports = help;
