const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
const cmdCD = require("command-cooldown");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables

class rd extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "ready",
      aliases: ["rd"],
      category: "Cooldown",
      description: "Shows active cooldown",
    });
  }

  async run(message) {
    function help() {
      const exampleEmbed = new MessageEmbed()
        .setColor(config.color.info)
        .setTitle("Help")
        .setDescription(config.help.message);
      return message.channel.createMessage(exampleEmbed.create);
    }

    var dailycd = ""; // get daily cooldown
    var streamcd = ""; // get stream cooldown
    var tournamentcd = ""; // get tournament cooldown
    var mentionexist = Object.keys(message.mentions).length; // check if user mention exists
    if (mentionexist > 0) {
      var ment = JSON.stringify(message.mentions);
      const obj = JSON.parse(ment); // get the user object
      var tagged = {
        user: {
          id: obj[0].id,
          username: obj[0].username,
          avatar: obj[0].avatar,
          tag: obj[0].username + "#" + obj[0].discriminator,
        },
      };

      dailycd = await cmdCD.checkCoolDown(obj[0].id, "cmd-daily"); // get daily cooldown
      streamcd = await cmdCD.checkCoolDown(obj[0].id, "cmd-stream"); // get stream cooldown
      tournamentcd = await cmdCD.checkCoolDown(obj[0].id, "cmd-tournament"); // get tournament cooldown
    } else {
      var tagged = {
        user: {
          id: message.author.id,
          username: message.author.username,
          avatar: message.author.avatar,
          tag: message.author.username + "#" + message.author.discriminator,
        },
      };

      dailycd = await cmdCD.checkCoolDown(message.author.id, "cmd-daily"); // get daily cooldown
      streamcd = await cmdCD.checkCoolDown(message.author.id, "cmd-stream"); // get stream cooldown
      tournamentcd = await cmdCD.checkCoolDown(
        message.author.id,
        "cmd-tournament"
      ); // get tournament cooldown
    }
    // convert the cooldowns into hour, minute, second format
    var dailymyms = dailycd.res.rem;
    var streammyms = streamcd.res.rem;
    var tournamentmyms = tournamentcd.res.rem;
    // get cooldowns
    let cooldown = {
      daily: dailymyms,
      stream: streammyms,
      tournament: tournamentmyms,
    };
    // Show how messages are formatted in the embed
    var dailyconvms = "";
    var streamconvms = "";
    var tournamentconvms = "";
    var showrewards = "";
    var showexperience = "";
    var extraline = "";
    // check if daily cooldown is ready
    if (cooldown.daily < 1) {
      showrewards = ":gift: **Rewards**";
      dailyconvms = "\n:white_check_mark: ~-~ ``daily``";
    } else {
      showrewards = "";
      dailyconvms = "";
    }
    // check if stream cooldown is ready
    if (cooldown.stream < 1) {
      showexperience = ":crossed_swords: **Experience**";
      streamconvms = "\n:white_check_mark: ~-~ ``stream``";
    } else {
      showexperience = "";
      streamconvms = "";
    }
    // check if tournament cooldown is ready
    if (cooldown.tournament < 1) {
      showexperience = ":crossed_swords: **Experience**";
      tournamentconvms = "\n:white_check_mark: ~-~ ``tournament``";
    } else {
      showexperience = "";
      tournamentconvms = "";
    }
    // if all cooldowns are ready, put them in a new row
    if (cooldown.stream < 1 && cooldown.daily < 1 && cooldown.tournament < 1) {
      extraline = "\n\n";
    }
    // if no cooldowns are ready
    if (cooldown.stream > 0 && cooldown.daily > 0 && cooldown.tournament > 0) {
      extraline = "No commands ready yet.";
    }
    connection.query(
      `SELECT * from players WHERE Discordid="${tagged.user.id}"`,
      function (error, results, fields) {
        if (error) throw error;
        if (results && results.length) {
          const exampleEmbed = new MessageEmbed()
            .setColor(config.color.info)
            .setAuthor(
              tagged.user.username + " — ready",
              `https://cdn.discordapp.com/avatars/${tagged.user.id}/${tagged.user.avatar}.jpg`
            )
            .setFooter(
              `Check the longer version of this command with "${config.command.prefix}cd"`
            )
            .setDescription(
              `${showrewards}${dailyconvms}${extraline}${showexperience}${streamconvms}${tournamentconvms}`
            );
          return message.channel.createMessage(exampleEmbed.create);
        } else {
          // error message if the user has not played yet
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
  }
}

module.exports = rd;
