import { ActivityType, Client, IntentsBitField, Message, Partials } from "discord.js";

import { config } from "dotenv";
import express from "express";
import command from "./commands/command";

export class App {
  public client: Client;
  public prefix = "!";
  constructor() {
    this.client = new Client({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildVoiceStates,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    });
    // check env.d.ts for the required keys
    config({ path: process.cwd() + "/.env" });
  }

  public login = async (): Promise<void> => {
    await this.client.login(process.env.discord_token);
  };

  public startBot = async (): Promise<void> => {
    const app = express();

    app.listen(3551, () => {
      console.log("Listening on port:3551 ");
    });

    this.client.on("ready", () => {
      console.log("Bot is running... ✅", this?.client?.user?.tag);
    });

    await this.login();

    this.client.user?.setActivity({ type: ActivityType.Playing, name: "🦁 !help" });

    this.client.on("messageCreate", async (message: Message) => {
      if (!message.content.startsWith(this.prefix) || message.author.bot) {
        return; // not for us
      }
      console.group("message", message);
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
