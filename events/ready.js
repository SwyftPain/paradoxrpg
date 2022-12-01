const { EventStructure } = require("simple-eris-command");

class ReadyEvent extends EventStructure {
  constructor(client) {
    super(client, {
      name: "ready",
    });
  }
  run() {
    console.log(
      `logged in as ${this.client.user.username}#${this.client.user.discriminator}.`
    );
  }
}
module.exports = ReadyEvent;
