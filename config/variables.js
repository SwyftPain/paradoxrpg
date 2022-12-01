require('dotenv').config()
// object declarations

// shop
let items = {
  buyable: {
    medicine: {
      emoji: ":syringe:",
      name: "Medicine",
      price: 25,
      desc: "Restore your life with ``revive``",
    },
  },
  upgradeable: {
    phone: {
      emoji: ":mobile_phone:",
      name: "Phone",
      price: 50,
      desc: "Get more fans and subs with a shiny new device",
    },
  },
};

// devices
let devices = {
  device: {
    phone: {
      name: "PHONE",
      emoji: ":mobile_phone:",
    },
    none: {
      name: "NONE",
      emoji: "",
    },
  },
  vpn: {
    none: {
      name: "NONE",
      emoji: "",
    },
  },
};

// cooldowns
let cooldowns = {
  daily: 86400000,
  stream: 60000,
  tournament: 3600000,
};

// commands
let commands = {
  prefix: "pox ",
  commands: {
    any: "``buy, cooldown, daily, donate, extras, inventory, profile, ready, return, revive, sell, shop, upgrade``",
    rank: {
      one: "``stream, tournament``",
    },
    footer: {
      photo: "https://i.imgur.com/uw8koia.png",
    },
  },
};

// reminders
let reminders = {
  stream: {
    message: `**__${commands.prefix.toUpperCase()}STREAM__** is ready!`,
  },
  tournament: {
    message: `**__${commands.prefix.toUpperCase()}TOURNAMENT__** is ready!`,
  },
};

// help messages
let helps = {
  message: `Welcome.\nThis is your 1st time using the bot.\n\nRemember to use \`\`${commands.prefix.slice(
    0,
    -1
  )}\`\` before any command.\n\nThis bot is still in early stages of development,\nmore features coming...\n\nCommands available in any rank:\n${
    commands.commands.any
  }\n\nHere are some of my commands:\n:one:${commands.commands.rank.one}`,
  admin: {
    message: `Remember to use \`\`${commands.prefix.slice(
      0,
      -1
    )}\`\` before any command.\n\nHere are some of my commands:\n\`\`set medicine\nset fans\nset xp\nset xpneeded\nset money\nset level\nset energy\nset maxenergy\nset title\nset moder\nset games\nset replays\nset subs\nset antivirus\nset device\nset vpn\nset credit\nreset\`\``,
    format: {
      message: `Format is:\n${commands.prefix}[command] [@member] [amount]\nMember is optional. If none, targets command author.`,
    },
  },
};

// settings
let settings = {
  serverid: process.env.SERVERID,
  ownerid: process.env.OWNERID,
};

// colors
let colors = {
  error: "#880808",
  standard: "#7600bc",
  success: "#86DC3D",
  levelup: "#FE2465",
  info: "#EF7215",
};

// export
module.exports.config = {
  color: colors,
  reminder: reminders,
  help: helps,
  shop: items,
  cooldown: cooldowns,
  command: commands,
  setting: settings,
  device: devices,
};
