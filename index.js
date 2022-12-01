const { Client } = require("simple-eris-command"); // Require Client class
require('dotenv').config()

class MyClient extends Client {
  constructor() {
    super({
      token:
      process.env.MYTOKEN, // Your bot token.
      eventsPath: "./events", // Your events folder path
      commandsPath: "./commands", // Your commands folder path (?:optional).
    });
  }
}

const myClient = new MyClient();
