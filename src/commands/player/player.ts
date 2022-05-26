import * as play from "play-dl";

import { AudioPlayerStatus, NoSubscriberBehavior, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import { Message, MessageEmbed } from "discord.js";

import { Queue } from "../../types/queue.type";
import { getGuildInfo } from "../../utils/getGuildInfo";
import { idle } from "./idle";
import { logoPng } from "../../utils/logo";
import { queue } from "../../utils/queue";

const idleTimer = async (message: Message) => setTimeout(async () => await idle(message), 60 * 1000 * 10);

export const player = async (message: Message) => {
  const server: Queue | undefined = getGuildInfo(message);
  if (!server) return await message.channel.send("No queue found.");
  if (server.voiceChannel.members.size === 1 && server.voiceChannel.members.first()?.user.bot) {
    getGuildInfo(message)?.connection?.destroy();
    if (message.guild?.id) queue.delete(message.guild?.id);
    return await message.channel.send({
      embeds: [
        {
          color: 0xff0000,
          description: "Not enough people in the voice channel to play music. Leaving.",
        },
      ],
    });
  }
  if (!server.audioPlayer) {
    server.audioPlayer = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    });
  }

  server.audioPlayer.removeAllListeners();
  server.audioPlayer.once(AudioPlayerStatus.Idle, async () => {
    console.log("⏭");
    getGuildInfo(message)?.songs?.shift();
    if (getGuildInfo(message)?.songs?.length) {
      clearTimeout(await idleTimer(message));
      await player(message);
    } else {
      await idleTimer(message);
    }
  });

  if (!getGuildInfo(message)?.songs?.length) {
    getGuildInfo(message)?.connection?.destroy();
    if (message.guild?.id) queue.delete(message.guild?.id);
    return await message.channel.send("Queue is empty. Destroying voice connection.");
  }

  if (server.audioPlayer?.state.status === AudioPlayerStatus.Idle || server.audioPlayer?.state.status === AudioPlayerStatus.Paused) {
    const nextSong = server.songs;

    if (!nextSong && !nextSong?.[0]) {
      return await idleTimer(message);
    }

    clearTimeout(await idleTimer(message));

    if (play.is_expired()) {
      await play.refreshToken();
    }

    const isSpotify = play.sp_validate(nextSong[0].url);
    let searchType: string = !!isSpotify ? nextSong[0].title : nextSong[0].url;

    let foundTrack: any = await play.search(`${searchType}`, {
      limit: 1,
    });

    if (!foundTrack?.[0]?.url) {
      // fallback to searching, only needed for spotify links..
      console.log("Couldn't find song, using fallback.");
      foundTrack = await play.search(`${nextSong[0].title}`, {
        limit: 1,
      });
    }

    if (!foundTrack?.[0]?.url) {
      // give up, go to next song.
      server.songs.shift();
      server.audioPlayer.state.status = AudioPlayerStatus.Idle;
      setTimeout(() => console.log("Couldn't find song...", foundTrack), 200);
      await player(message);
      return await message.channel.send({
        embeds: [
          {
            color: 0xff0000,
            description: "Song not found, skipping to next one.",
          },
        ],
      });
    }

    if (server.audioStream) (await server.audioStream).stream.destroy();
    server.audioStream = await play.stream(foundTrack[0].url);

    let resource = createAudioResource(server.audioStream.stream, {
      inputType: server.audioStream.type,
    });
    server.audioPlayer.play(resource);
    server.connection?.subscribe(server.audioPlayer);

    const songInfo = new MessageEmbed()
      .addField("Now Playing:", foundTrack[0].title)
      .addField("Requested:", nextSong[0].title)
      .setTimestamp()
      .setFooter(`Duration: ${foundTrack[0].durationRaw}`, logoPng);
    if (nextSong[0].thumbnail) songInfo.setThumbnail(nextSong[0].thumbnail);
    return await message.channel.send({ embeds: [songInfo] });
  }
  return await message.channel.send("Something went wrong...");
};
