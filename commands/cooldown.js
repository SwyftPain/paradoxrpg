const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
const cmdCD = require("command-cooldown");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables
const myfunc = require("../config/functions"); // get functions

class cd extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "cooldown",
      aliases: ["cd"],
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

    let current = {
      user: {
        tag: message.author.username + "#" + message.author.discriminator,
      },
    };
    var dailycd = ""; // get daily cooldown
    var streamcd = ""; // get stream cooldown
    var tournamentcd = ""; // get tournament cooldown
    var mentionexist = Object.keys(message.mentions).length;
    // check whether to show someone elses cooldown or own
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
    var dailyconvms =
      ":clock4: ~-~ ``daily`` (" + myfunc.convertMsToTime(cooldown.daily) + ")";
    var tournamentconvms =
      ":clock4: ~-~ ``tournament`` (" +
      myfunc.convertMsToTime(tournamentmyms) +
      ")";
    // check if stream cooldown is less than 10 and remove 0 as the first digit, displaying 5 instead of 05
    var streamsliced = myfunc.convertMsToTime(cooldown.stream).slice(8);
    switch (true) {
      case streamsliced.startsWith(0):
        var streamshow = streamsliced.slice(1);
        break;
      default:
        var streamshow = streamsliced;
    }
    // Show how messages are displayed in the embed
    var streamconvms = ":clock4: ~-~ ``stream`` (" + streamshow + ")";
    if (cooldown.daily < 1) {
      dailyconvms = ":white_check_mark: ~-~ ``daily``";
    }
    if (cooldown.stream < 1) {
      streamconvms = ":white_check_mark: ~-~ ``stream``";
    }
    // Show how messages are displayed in the embed
    if (cooldown.tournament < 1) {
      tournamentconvms = ":white_check_mark: ~-~ ``tournament``";
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
              `Check the shorter version of this command with "${config.command.prefix}rd"`
            )
            .setDescription(
              `:gift: **Rewards**\n${dailyconvms}\n\n:crossed_swords: **Experience**\n${streamconvms}\n${tournamentconvms}`
            );
          return message.channel.createMessage(exampleEmbed.create);
        } else {
          // message if the user has never played
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

module.exports = cd;
