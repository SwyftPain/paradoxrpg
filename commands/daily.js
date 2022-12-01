const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
const cmdCD = require("command-cooldown");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables
const myfunc = require("../config/functions"); // get functions

class daily extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "daily",
      category: "Rewards",
      description: "Daily Rewards",
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

    // store user object
    let current = {
      user: {
        tag: message.author.username + "#" + message.author.discriminator,
      },
    };

    let cd = await cmdCD.checkCoolDown(message.author.id, "cmd-daily"); // get daily cooldown
    // convert to hour, minute, second format
    var myms = cd.res.rem;
    var convms = myfunc.convertMsToTime(myms);
    // message if the command is on cooldown
    const exampleEmbed = new MessageEmbed()
      .setColor(config.color.error)
      .setDescription(
        `**${current.user.tag}**, this command is still on cooldown.\nRemaining time: **${convms}**`
      )
      .setTitle(`HOLD ON, THE COMMAND IS ON COOLDOWN`)
      .setThumbnail(`${message.author.avatarURL}`);
    if (!cd.res.ready)
      return message.channel.createMessage(exampleEmbed.create);
    connection.query(
      `SELECT * from players WHERE Discordid="${message.author.id}"`,
      function (error, results, fields) {
        if (error) throw error;
        if (results && results.length) {
          // store current data
          let items = {
            Level: results[0].Level,
            Money: results[0].Money,
            Fans: results[0].Fans,
          };
          // minimum and maximum amounts
          let chance = {
            fans: {
              min: items.Level * 2,
              max: items.Level * 20,
            },
            coins: {
              min: items.Level * 2,
              max: items.Level * 50,
            },
          };
          // calculate new amounts
          var fans = myfunc.getRandom(chance.fans.min, chance.fans.max);
          var coins = myfunc.getRandom(chance.coins.min, chance.coins.max);
          // new values
          let newitem = {
            fans: items.Fans + fans,
            coins: items.Money + coins,
          };
          // display words based on whether they are singular or plural
          class Print {
            constructor(fans, coins) {
              this.fans = fans;
              this.coins = coins;
            }
          }
          const print = new Print("followers", "coins");
          if (fans == "1") {
            print.fans = "follower";
          }
          if (coins == "1") {
            print.coins = "coin";
          }
          var sql = `UPDATE players SET Fans = '${newitem.fans}', Money = '${newitem.coins}' WHERE Discordid = '${message.author.id}'`;
          connection.query(sql, function (err, result) {
            if (err) throw err;
          });
          const streamEmbed = new MessageEmbed()
            .setColor(config.color.standard)
            .setDescription(
              `**${current.user.tag}** got daily bonus of ${fans} **${print.fans}**.\n**${current.user.tag}** got daily bonus of ${coins} **${print.coins}**.`
            )
            .setTitle(`:red_circle: Daily Bonus`)
            .setThumbnail(`${message.author.avatarURL}`);
          return message.channel.createMessage(streamEmbed.create);
        } else {
          var sql = `INSERT INTO players (Title, Medicine, Discordid, Played, Fans, Level, Money, Xp, Xpneeded, Energy, Maxenergy, Dname, Moder, Games, Replays, Subs, Antivirus, Device, Vpn, Credit) VALUES (' ', '0', '${message.author.id}', '1', '1', '1', '0', '0', '10', '100', '100','${message.author.username}', '0', '0', '0', '0', '0', 'NONE', 'NONE', '0')`;
          connection.query(sql, function (err, result) {
            if (err) throw err;
          });
          help();
        }
      }
    );
    // set command cooldown
    cmdCD.addCoolDown(message.author.id, config.cooldown.daily, "cmd-daily");
  }
}

module.exports = daily;
