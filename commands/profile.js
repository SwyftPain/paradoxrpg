const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables
const myfunc = require("../config/functions"); // get functions

class profile extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "profile",
      aliases: ["p"],
      category: "stats",
      description: "Check profile",
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
    var mentionexist = Object.keys(message.mentions).length; // check if user mentions exist
    if (args[1] && mentionexist > 0) {
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
      var avatar = {
        url: `https://cdn.discordapp.com/avatars/${tagged.user.id}/${tagged.user.avatar}.jpg`,
      };
    } else {
      var tagged = {
        user: {
          id: message.author.id,
          username: message.author.username,
          avatar: message.author.avatar,
          tag: message.author.username + "#" + message.author.discriminator,
        },
      };
      var avatar = {
        url: `https://cdn.discordapp.com/avatars/${tagged.user.id}/${tagged.user.avatar}.jpg`,
      };
    }
    connection.query(
      `SELECT * from players WHERE Discordid="${tagged.user.id}"`,
      function (error, results, fields) {
        if (error) throw error;
        if (results && results.length) {
          // current amount of items
          let items = {
            Games: results[0].Games,
            Replays: results[0].Replays,
            Subs: results[0].Subs,
            Antivirus: results[0].Antivirus,
            Device: results[0].Device,
            Vpn: results[0].Vpn,
            Credit: results[0].Credit,
            Xp: results[0].Xp,
            Xpneeded: results[0].Xpneeded,
            Level: results[0].Level,
            Life: results[0].Energy,
            Maxlife: results[0].Maxenergy,
            Money: results[0].Money,
            Credit: results[0].Credit,
          };
          var title = results[0].Title;
          // check whether the user has a title
          var mytitle = "";
          if (title) {
            mytitle = title;
          }
          // check if device exists
          var devicename = "";
          var deviceemoji = "";
          if (items.Device == "PHONE") {
            devicename = config.device.device.phone.name;
            deviceemoji = config.device.device.phone.emoji;
          } else {
            devicename = items.Device;
          }
          var percent = myfunc.percentage(items.Xp, items.Xpneeded);
          const exampleEmbed = new MessageEmbed()
            .setColor(config.color.info)
            .setTitle(`${mytitle}`)
            .setAuthor(`${tagged.user.username} — profile`, `${avatar.url}`)
            .setDescription(
              `**PROGRESS**\n**Level**: ${items.Level} (${percent.toFixed(
                2
              )}%)\n**XP**: ${items.Xp}/${items.Xpneeded}\n**Games**: ${
                items.Games
              }\n**Replays**: ${
                items.Replays
              }\n\n**STATS**\n:video_game: **Subs**: ${
                items.Subs
              }\n:microbe: **Antivirus**: ${
                items.Antivirus
              }\n:zap: **Energy**: ${items.Life}/${items.Maxlife}\n\n`
            )
            .setThumbnail(`${avatar.url}`)
            .addField(
              "EQUIPMENT",
              `${deviceemoji} [${devicename}]\n${config.device.vpn.none.emoji} [${items.Vpn}]`,
              true
            )
            .addField(
              "MONEY",
              `:coin: **Coins**: ${items.Money}\n:credit_card: **Credit**: ${items.Credit}`,
              true
            )
            .setFooter(`RANK: 0`, `${config.command.commands.footer.photo}`);
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

module.exports = profile;
