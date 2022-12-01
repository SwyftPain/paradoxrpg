const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
const cmdCD = require("command-cooldown");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables
const myfunc = require("../config/functions"); // get functions

class stream extends CommandStructure {
  constructor(client) {
    super(client, {
      name: "stream",
      aliases: ["s"],
      category: "Experience",
      description: "Stream live",
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

    // reminder function
    function reminder() {
      return message.channel.createMessage(
        `<@${message.author.id}>, ${config.reminder.stream.message}`
      );
    }

    // store user object
    let current = {
      user: {
        tag: message.author.username + "#" + message.author.discriminator,
      },
    };
    let cd = await cmdCD.checkCoolDown(message.author.id, "cmd-stream"); // get stream cooldown
    // embed message if the command is on cooldown
    const exampleEmbed = new MessageEmbed()
      .setColor(config.color.error)
      .setDescription(
        `**${
          current.user.tag
        }**, this command is still on cooldown.\nRemaining time: **${(
          cd.res.rem / 1000
        ).toFixed(1)}**s`
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
          // store current amount of items
          let items = {
            Level: results[0].Level,
            Money: results[0].Money,
            Xp: results[0].Xp,
            Xpneeded: results[0].Xpneeded,
            Life: results[0].Energy,
            Maxlife: results[0].Maxenergy,
            Fans: results[0].Fans,
            Device: results[0].Device,
          };
          // minimum and maximum values
          let chances = {
            Fans: { min: 1, max: 3 },
            Coins: {
              min: ~~Math.floor((items.Level / 0.4) ^ 10),
              max: ~~Math.floor((items.Level / 0.7) ^ 15),
            },
            Xp: {
              min: ~~Math.floor((items.Level / 0.2) ^ 6),
              max: ~~Math.floor((items.Level / 0.3) ^ 8),
            },
            Lostlife: { min: items.Level + 1, max: items.Level * 5 },
            Fanchance: { min: 1, max: 100 },
          };
          // increase fan amounts if device is set to phone
          var currentdevice = items.Device;
          switch (true) {
            case currentdevice == "PHONE":
              chances.Fans.min = 2;
              chances.Fans.max = 5;
              break;
            default:
              chances.Fans.min = 1;
              chances.Fans.max = 3;
          }
          // random number in range
          let generate = {
            fans: myfunc.getRandom(chances.Fans.min, chances.Fans.max),
            coins: myfunc.getRandom(chances.Coins.min, chances.Coins.max),
            xp: myfunc.getRandom(chances.Xp.min, chances.Xp.max),
            fanchance: myfunc.getRandom(
              chances.Fanchance.min,
              chances.Fanchance.max
            ),
            lostlife: myfunc.getRandom(
              chances.Lostlife.min,
              chances.Lostlife.max
            ),
          };
          // new amount
          let newvalue = {
            Fans: items.Fans + generate.fans,
            Coins: items.Money + generate.coins,
            Xp: items.Xp + generate.xp,
            Life: items.Life - generate.lostlife,
            Maxlife: items.Maxlife + 5,
            Xpneeded: ~~Math.floor((items.Level / 0.03) ^ 5),
          };
          // the message to display based on whether the amount is singular or plural
          class Print {
            constructor(fans, coins) {
              this.fans = fans;
              this.coins = coins;
            }
          }
          const print = new Print("followers", "coins");
          var thestreammessage;
          if (generate.fans == "1") {
            print.fans = "follower";
          }
          if (generate.coins == "1") {
            print.coins = "coin";
          }

          /* var minjailchance = 1;
          var maxjailchance = 100;
          var jailchance = myfunc.getRandom(minjailchance, maxjailchance); */

          // if user is about to have health less than 1 (die)
          if (newvalue.Life < 1) {
            // new values after death
            let dead = {
              Level: items.Level - 1,
              Xpneeded: items.Xpneeded / 2,
              Maxlife: items.Maxlife - 5,
            };
            switch (true) {
              // can lose levels
              case dead.Level > 0:
                var sql = `UPDATE players SET Energy = '1', Level = '${dead.Level}', Xpneeded = '${dead.Xpneeded}', Xp = '0', Maxenergy = '${dead.Maxlife}' WHERE Discordid = '${message.author.id}'`;
                connection.query(sql, function (err, result) {
                  if (err) throw err;
                  cmdCD.addCoolDown(
                    message.author.id,
                    config.cooldown.stream,
                    "cmd-stream"
                  );
                  setTimeout(reminder, config.cooldown.stream);
                  const streamEmbed = new MessageEmbed()
                    .setColor(config.color.error)
                    .setDescription(
                      `Restore your energy before you can stream again.\nYou lost a level too.`
                    )
                    .setTitle(`YOU PASSED OUT!`)
                    .setThumbnail(`${message.author.avatarURL}`);
                  return message.channel.createMessage(streamEmbed.create);
                });
                break;
              default:
                // cant lose levels
                var sql = `UPDATE players SET Energy = '1' WHERE Discordid = '${message.author.id}'`;
                connection.query(sql, function (err, result) {
                  if (err) throw err;
                  cmdCD.addCoolDown(
                    message.author.id,
                    config.cooldown.stream,
                    "cmd-stream"
                  );
                  setTimeout(reminder, config.cooldown.stream);
                  const streamEmbed = new MessageEmbed()
                    .setColor(config.color.error)
                    .setDescription(
                      `Restore your energy before you can stream again.`
                    )
                    .setTitle(`YOU PASSED OUT!`)
                    .setThumbnail(`${message.author.avatarURL}`);
                  return message.channel.createMessage(streamEmbed.create);
                });
                break;
            }
          } else {
            // if user is not dying
            switch (true) {
              case generate.fanchance < 30:
                // if user gets any fans
                var sql = `UPDATE players SET Fans = '${newvalue.Fans}', Money = '${newvalue.Coins}', Xp = '${newvalue.Xp}', Energy = '${newvalue.Life}' WHERE Discordid = '${message.author.id}'`;
                connection.query(sql, function (err, result) {
                  if (err) throw err;
                });
                thestreammessage = `**${current.user.tag}** went streaming and got ${generate.fans} **${print.fans}**.\n**${current.user.tag}** got ${generate.coins} **${print.coins}** and ${generate.xp} **XP**.\n**${current.user.tag}** lost ${generate.lostlife} **energy** and now has ${newvalue.Life}/${items.Maxlife} **energy**.`;
                break;
              default:
                // if user does not get any fans
                var sql = `UPDATE players SET Money = '${newvalue.Coins}', Xp = '${newvalue.Xp}', Energy = '${newvalue.Life}' WHERE Discordid = '${message.author.id}'`;
                connection.query(sql, function (err, result) {
                  if (err) throw err;
                });
                thestreammessage = `**${current.user.tag}** went streaming.\n**${current.user.tag}** got ${generate.coins} **${print.coins}** and ${generate.xp} **XP**.\n**${current.user.tag}** lost ${generate.lostlife} **energy** and now has ${newvalue.Life}/${items.Maxlife} **energy**.`;
            }
            if (newvalue.Xp >= items.Xpneeded) {
              // check if new xp is higher than the needed xp for level up
              let levelup = {
                Level: items.Level + 1,
                Life: newvalue.Maxlife,
              };
              const lvlEmbed = new MessageEmbed()
                .setColor(config.color.levelup)
                .setDescription(
                  `**${current.user.tag} LEVELED UP!**.\n**${current.user.tag}** got energy restored.`
                )
                .setTitle(`:fire: LEVEL UP`)
                .setThumbnail(`${message.author.avatarURL}`);
              var sqls = `UPDATE players SET Level = '${levelup.Level}', Maxenergy = '${newvalue.Maxlife}', Xp = '0', Energy = '${newvalue.Maxlife}', Xpneeded = '${newvalue.Xpneeded}' WHERE Discordid = '${message.author.id}'`;
              connection.query(sqls, function (err, result) {
                if (err) throw err;
                return message.channel.createMessage(lvlEmbed.create);
              });
              cmdCD.addCoolDown(
                message.author.id,
                config.cooldown.stream,
                "cmd-stream"
              ); // add cooldown
              setTimeout(reminder, config.cooldown.stream); // remind when cooldown is over
              // level up message
              const streamEmbed = new MessageEmbed()
                .setColor(config.color.standard)
                .setDescription(`${thestreammessage}`)
                .setTitle(`:red_circle: LIVE NOW`)
                .setThumbnail(`${message.author.avatarURL}`);
              return message.channel.createMessage(streamEmbed.create);
            }
            /* if (jailchance < 5) {
              const streamEmbede = new MessageEmbed()
                .setColor(config.color.standard)
                .setDescription(
                  `This message is a placeholder for antispam check. You can safely ignore it for now until further development.\nThis will be a multiple option question.`
                )
                .setTitle(
                  `:police_officer::skin-tone-1: Your documents please!`
                )
                .setThumbnail(`${message.author.avatarURL}`);
              return message.channel.createMessage(streamEmbede.create);
            } */
            // display stream message
            cmdCD.addCoolDown(
              message.author.id,
              config.cooldown.stream,
              "cmd-stream"
            ); // add cooldown
            setTimeout(reminder, config.cooldown.stream); // remind when cooldown is over
            const streamEmbed = new MessageEmbed()
              .setColor(config.color.standard)
              .setDescription(`${thestreammessage}`)
              .setTitle(`:red_circle: LIVE NOW`)
              .setThumbnail(`${message.author.avatarURL}`);
            return message.channel.createMessage(streamEmbed.create);
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

module.exports = stream;
