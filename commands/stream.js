const { CommandStructure } = require("simple-eris-command");
const MessageEmbed = require("discord-eris-embeds");
const cmdCD = require("command-cooldown");
var configs = require("../config/databaseConfig");
var connection = configs.connection;
var { config } = require("../config/variables"); // get variables
const myfunc = require("../config/functions"); // get functions
const Eris = require("eris-additions")(require("eris"))

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
      async function (error, results, fields) {
        if (error) throw error;
        if (results && results.length) {
          // store current amount of items
          let items = {
            Platform: results[0].Platform,
            Status: results[0].Status,
            Money: results[0].Money,
            Life: results[0].Energy,
            Maxlife: results[0].Maxenergy,
            Games: results[0].Games,
            Subs: results[0].Subs
          };
          // minimum and maximum values
          let chances = {
            Subs: { min: 1, max: 3 },
            Lostlife: { min: items.Level + 1, max: items.Level * 5 },
            Subchance: { min: 1, max: 100 },
            Coins: { min: 1, max: 5 }
          };
          // random number in range
          let generate = {
            Subs: myfunc.getRandom(chances.Subs.min, chances.Subs.max),
            coins: myfunc.getRandom(chances.Coins.min, chances.Coins.max),
            Subchance: myfunc.getRandom(
              chances.Subchance.min,
              chances.Subchance.max
            ),
            lostlife: myfunc.getRandom(
              chances.Lostlife.min,
              chances.Lostlife.max
            ),
          };
          // new amount
          let newvalue = {
            Subs: items.Subs + generate.Subs,
            Coins: items.Money + generate.coins,
            Life: items.Life - generate.lostlife,
            Maxlife: items.Maxlife + 5
          };
          // the message to display based on whether the amount is singular or plural
          class Print {
            constructor(Subs, coins) {
              this.Subs = Subs;
              this.coins = coins;
            }
          }
          const print = new Print("subs", "coins");
          var thestreammessage;
          if (generate.Subs == "1") {
            print.Subs = "sub";
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
              Maxlife: items.Maxlife - 5,
            };
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
          var sql = `INSERT INTO players (Discordid, Platform, Status, Money, Energy, Maxenergy, Title, Dname, Moder, Games, Subs) VALUES ('${message.author.id}', 'None', 'Regular', '0', '100', '100', '', '${message.author.username}', '0', '0', '0')`;
          connection.query(sql, function (err, result) {
            if (err) throw err;
          });
          help();
          message.channel.createMessage("Choose  your platform:\n\n1. Twitch\n2. Youtube");
          let responses = await message.channel.awaitMessages(m => m.content === "yes", { time: 10000, maxMatches: 1 });
if(responses.length) message.channel.createMessage("You said yes :)");
else message.channel.createMessage("You didn't say yes :(");
        }
      }
    );
  }
}

module.exports = stream;
