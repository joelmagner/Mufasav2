import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";

import { Message } from "discord.js";
import { getServerInfo } from "./getGuildInfo";

export const joinVoice = async (message: Message) => {
  if (message.guild && message?.member?.voice?.channel) {
    if (!getServerInfo(message)?.connection) {
      try {
        const connection = joinVoiceChannel({
          channelId: message.member.voice.channel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });
        const channel = getServerInfo(message);
        if (channel) {
          channel.connection = connection;
        } else {
          console.log("Couldn't connect to channel!");
        }
      } catch (err) {
        console.log("ERR", err);
      }
    }
    return;
  } else {
    return await message.channel.send("You are not connected to the bots voice channel.");
  }
};
