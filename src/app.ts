import { Client, Intents, Message } from "discord.js";

import command from "./commands/command";
import { config } from "dotenv";
import express from "express";

export class App {
  public client: Client;
  public prefix = "!";
  constructor() {
    this.client = new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
      partials: ["MESSAGE", "CHANNEL", "REACTION"],
    });
    // check env.d.ts for the required keys
    config({ path: process.cwd() + "/.env" });
  }

  public login = async (): Promise<void> => {
    await this.client.login(process.env.discord_token);
  };

  public startBot = async (): Promise<void> => {
    this.client.on("ready", () => {
      console.log("Bot is running... ✅", this?.client?.user?.tag);
    });
    const app = express();

    app.listen(3551, () => {
      console.log("Listening on port:3551 ");
    });
    await this.login();

    this.client.user?.setActivity({
      type: "PLAYING",
      name: "🦁 !help",
    });

    this.client.on("messageCreate", async (message: Message) => {
      if (!message.content.startsWith(this.prefix) || message.author.bot) {
        return; // not for us
      }

      const args = message.content.slice(this.prefix.length).split(/ +/);
      const cmd = args.shift()?.toLowerCase();
      if (cmd) await command(this.client, message, cmd, args);
    });
  };
}

const { startBot } = new App();
startBot().catch((err) => {
  console.error("Err: ", err);
});
