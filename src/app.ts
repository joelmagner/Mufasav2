import { Client, Intents, Message } from "discord.js";
import fs from "fs";
import command from "./commands/command";
import { Settings } from "./types/settings.type";

import express from "express";
export class App {
  public client: Client;
  public prefix = "!";
  constructor() {
    this.client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],
      partials: ["MESSAGE", "CHANNEL", "REACTION"],
    });
  }

  private initSettings(filename: string, encoding: BufferEncoding): Settings {
    return JSON.parse(fs.readFileSync(filename, { encoding }));
  }

  public login = async (): Promise<Settings> => {
    const settings: Settings = this.initSettings("settings.json", "utf8");
    await this.client.login(settings.discord_token);
    return settings;
  };

  public startBot = async (): Promise<void> => {
    this.client.on("ready", () => {
      console.log("Bot is running... ✅", this?.client?.user?.tag);
    });
    const app = express();
    // define a route handler for the default home page
    app.get("/", (_, res) => {
      res.send("Mufasa is running");
    });
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
      if (cmd) command(this.client, message, cmd, args);
    });
  };
}

const { startBot } = new App();
startBot().catch((err) => {
  console.error("Err: ", err);
});
