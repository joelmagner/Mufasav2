import * as play from "play-dl";

import { AudioPlayerStatus, NoSubscriberBehavior, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import { playingMessageSoundCloud, playingMessageYoutube } from "../../utils/messages/playing.msg";

import { Message } from "discord.js";
import { Server } from "../../types/server.type";
import { SoundCloudTrack } from "play-dl/dist/SoundCloud/classes";
import { YouTubeVideo } from "play-dl/dist/YouTube/classes/Video";
import { getServerInfo } from "../../utils/getGuildInfo";
import { idle } from "./management/idle";
import { playError } from "../../utils/errors/play.error";
import { refreshSoundcloudToken } from "../../utils/sessions/soundcloud.session";
import { server } from "../../utils/server";

const idleTimer = async (message: Message) => setTimeout(async () => await idle(message), 60 * 1000 * 10);

const getSoundcloudSong = async (message: Message, server: Server) => {
  const nextSong = server.songs?.[0];
  if (!nextSong) {
    await idleTimer(message);
    return null;
  }

  clearTimeout(await idleTimer(message));
  await refreshSoundcloudToken();
  const isSoundcloud = await play.so_validate(nextSong.url);
  if (isSoundcloud === "track") {
    return await play.soundcloud(nextSong.url);
  } else if (isSoundcloud == "playlist") {
    await message.channel.send("Playlists from soundcloud are not supported yet.");
    return null;
  }
  return null;
};

const searchNextSong = async (message: Message, server: Server) => {
  const nextSong = server.songs?.[0];
  if (!nextSong) {
    await idleTimer(message);
    return null;
  }

  clearTimeout(await idleTimer(message));
  let foundTrack = await play.search(`${nextSong.url}`, {
    limit: 1,
  });
  if (foundTrack?.[0]?.url) return foundTrack;

  // fallback to searching, only needed for spotify links...
  foundTrack = await play.search(`${nextSong.title}`, {
    limit: 1,
  });
  if (foundTrack?.[0]?.url) return foundTrack;

  return null;
};

const playSong = async (message: Message, server: Server, soundcloud: boolean, song: play.YouTube | play.Spotify | play.SoundCloud | play.Deezer) => {
  if (server.audioStream) server.audioStream.stream.destroy();
  if (!song.url) {
    console.log("no song url was found");
    return;
  }

  const requestedSong = server.songs?.[0];
  if (!requestedSong) return;

  let nowPlayingMessage = null;

  if (soundcloud) {
    song = song as SoundCloudTrack;
    server.audioStream = await play.stream_from_info(song);
    nowPlayingMessage = playingMessageSoundCloud(requestedSong, song);
  } else {
    server.audioStream = await play.stream(song.url);
    nowPlayingMessage = playingMessageYoutube(requestedSong, song as YouTubeVideo);
  }

  const resource = createAudioResource(server.audioStream.stream, {
    inputType: server.audioStream.type,
  });
  if (!server.audioPlayer) server.audioPlayer = setupAudioPlayer(server);
  server.audioPlayer.play(resource);
  server.connection?.subscribe(server.audioPlayer);

  return await message.channel.send({ embeds: [nowPlayingMessage] });
};

const setupAudioPlayer = (server: Server) => {
  if (!server.audioPlayer) {
    return createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    });
  }
  return server.audioPlayer;
};

export const player = async (message: Message) => {
  const channel: Server | undefined = getServerInfo(message);
  if (!channel) return await message.channel.send("No queue found.");
  if (channel.voiceChannel.members.size === 1 && channel.voiceChannel.members.first()?.user.bot) {
    getServerInfo(message)?.connection?.destroy();
    if (message.guild?.id) server.delete(message.guild?.id);
    return await message.channel.send({
      embeds: [
        {
          color: 0xff0000,
          description: "Not enough people in the voice channel to play music. Leaving.",
        },
      ],
    });
  }

  if (!channel.audioPlayer) {
    channel.audioPlayer = setupAudioPlayer(channel);
  }

  channel.audioPlayer.removeAllListeners();
  channel.audioPlayer.once(AudioPlayerStatus.Idle, async () => {
    console.log("⏭");
    getServerInfo(message)?.songs?.shift();
    if (getServerInfo(message)?.songs?.length) {
      clearTimeout(await idleTimer(message));
      await player(message);
    } else {
      await idleTimer(message);
    }
  });

  if (!getServerInfo(message)?.songs?.length) {
    getServerInfo(message)?.connection?.destroy();
    if (message.guild?.id) server.delete(message.guild?.id);
    return await message.channel.send("Queue is empty. Destroying voice connection.");
  }

  if (channel.audioPlayer?.state.status === AudioPlayerStatus.Idle || channel.audioPlayer?.state.status === AudioPlayerStatus.Paused) {
    const soundcloudSong = await getSoundcloudSong(message, channel);
    if (soundcloudSong) return await playSong(message, channel, true, soundcloudSong);

    const search = await searchNextSong(message, channel);
    if (search) return await playSong(message, channel, false, search[0]);

    if (!soundcloudSong && !search) {
      // give up, go to next song.
      channel.songs.shift();
      channel.audioPlayer.state.status = AudioPlayerStatus.Idle;
      await player(message);
      return await message.channel.send(playError);
    }
  }
  return await message.channel.send("Something went wrong...");
};
