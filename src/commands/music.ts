import * as play from "play-dl";

import { getGuildId, getServerInfo } from "../utils/getGuildInfo";

import { AudioPlayerStatus } from "@discordjs/voice";
import { Message } from "discord.js";
import { createServer } from "../utils/createServer";
import { isUserInVoiceChannel } from "../utils/isUserInVoiceChannel";
import { joinVoice } from "../utils/joinVoice";
import { server } from "../utils/server";
import { refreshSpotifyToken } from "../utils/sessions/spotify.session";
import { player } from "./player/player";
import { search } from "./player/search/search";
import { album } from "./player/spotify/album";
import { playlist } from "./player/spotify/playlist";
import { track } from "./player/spotify/track";

export default class Music {
  init = async (message: Message, args: string[], playTop = false) => {
    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel || !(await isUserInVoiceChannel(message))) return;
    if (!args.length) return await message.channel.send("Please specify a song to play.");

    const serverInfo = getServerInfo(message);

    // update to see if bot has been moved
    if (serverInfo?.voiceChannel) {
      serverInfo.voiceChannel = message.guild?.members?.me?.voice.channel ?? serverInfo.voiceChannel;
    }

    // check if same channel as bot.
    if (serverInfo?.voiceChannel && serverInfo?.voiceChannel.id !== voiceChannel.id) {
      return await message.channel.send({
        embeds: [
          {
            color: 0xff0000,
            description: "You are not connected to the same voice channel as the bot.",
          },
        ],
      });
    }

    if (!serverInfo && getGuildId(message)) {
      server.set(getGuildId(message), createServer(voiceChannel, message.channel));
    }

    await refreshSpotifyToken();

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

    await joinVoice(message);
    if (getServerInfo(message)?.audioPlayer?.state.status !== AudioPlayerStatus.Playing) {
      return await player(message);
    }
    return;
  };
}
