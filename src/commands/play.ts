import * as play from "play-dl";

import { AudioPlayerStatus } from "@discordjs/voice";
import { Message } from "discord.js";
import { album } from "./player/album";
import { createServerQueue } from "../utils/createServerQueue";
import { getGuildInfo } from "../utils/getGuildInfo";
import { isInVoiceChannel } from "../utils/isInVoiceChannel";
import { joinVoice } from "../utils/joinVoice";
import { player } from "./player/player";
import { playlist } from "./player/playlist";
import { queue } from "../utils/queue";
import { track } from "./player/track";
import { youtube } from "./player/youtube";

export default class PlayCommmand {
  init = async (message: Message, args: string[], playTop: boolean = false) => {
    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel || !(await isInVoiceChannel(message))) return;
    if (!args.length) return await message.channel.send("Please specify a song to play.");

    const serverQueue = getGuildInfo(message);

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
      queue.set(message.guild.id, createServerQueue(voiceChannel, message.channel));
    }

    if (play.is_expired()) {
      await play.refreshToken();
    }

    const spotifyLink = play.sp_validate(args.join(" "));
    if (!spotifyLink || spotifyLink === "search") {
      await youtube(message, args, playTop);
    } else if (spotifyLink === "track") {
      await track(message, args, playTop);
    } else if (spotifyLink === "playlist") {
      await playlist(message, args, playTop);
    } else if (spotifyLink === "album") {
      await album(message, args, playTop);
    }

    // Join channel
    await joinVoice(message);

    if (getGuildInfo(message)?.audioPlayer?.state.status !== AudioPlayerStatus.Playing) {
      return await player(message);
    }
    return;
  };
}
// TODO: bryt ut menu-command.
// TODO: bryta ut funktioner.
// TODO: fixa felhantering, crashar den, gör det möjligt att inte behöva starta om hela node-processen.
// TODO: testa youtube-länkar. // implementera annars.
// TODO: skapa en mediaplayer för varje kanal.
