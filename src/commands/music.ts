import * as play from "play-dl";

import { AudioPlayerStatus } from "@discordjs/voice";
import { Message } from "discord.js";
import { album } from "./player/spotify/album";
import { createServer } from "../utils/createServer";
import { getServerInfo } from "../utils/getGuildInfo";
import { isUserInVoiceChannel } from "../utils/isUserInVoiceChannel";
import { joinVoice } from "../utils/joinVoice";
import { player } from "./player/player";
import { playlist } from "./player/spotify/playlist";
import { search } from "./player/search/search";
import { server } from "../utils/server";
import { track } from "./player/spotify/track";

export default class Music {
  init = async (message: Message, args: string[], playTop = false) => {
    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel || !(await isUserInVoiceChannel(message))) return;
    if (!args.length) return await message.channel.send("Please specify a song to play.");

    const serverQueue = getServerInfo(message);

    // check if same channel as bot.
    if (serverQueue?.voiceChannel && serverQueue?.voiceChannel.id !== voiceChannel.id) {
      return await message.channel.send({
        embeds: [
          {
            color: 0xff0000,
            description: "You are not connected to the same voice channel as the bot.",
          },
        ],
      });
    }

    if (!serverQueue && message.guild?.id) {
      server.set(message.guild.id, createServer(voiceChannel, message.channel));
    }

    if (play.is_expired()) {
      await play.refreshToken();
    }

    const spotifyLink = play.sp_validate(args.join(" "));
    if (!spotifyLink || spotifyLink === "search") {
      await search(message, args, playTop);
    } else if (spotifyLink === "track") {
      await track(message, args, playTop);
    } else if (spotifyLink === "playlist") {
      await playlist(message, args, playTop);
    } else if (spotifyLink === "album") {
      await album(message, args, playTop);
    }

    // Join channel
    await joinVoice(message);

    if (getServerInfo(message)?.audioPlayer?.state.status !== AudioPlayerStatus.Playing) {
      return await player(message);
    }
    return;
  };
}
