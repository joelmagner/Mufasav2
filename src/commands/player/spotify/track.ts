import * as play from "play-dl";

import { Message } from "discord.js";
import { Song } from "../../../types/song.type";
import { SpotifyTrack } from "play-dl/dist/Spotify/classes";
import { errorNotFound } from "../../../utils/errors/notfound.error";
import { getServerInfo } from "../../../utils/getGuildInfo";
import { trackMessage } from "../../../utils/messages/track.msg";

export const track = async (message: Message, args: string[], playTop: boolean) => {
  try {
    const track = (await play.spotify(args.join(" "))) as SpotifyTrack;
    const songName = track.name + " - " + track.artists[0].name;

    const song: Song = {
      title: songName,
      url: track.url,
      thumbnail: track.thumbnail?.url ?? "",
    };
    if (getServerInfo(message)?.songs) {
      getServerInfo(message)?.songs.push(song);
      if (playTop && (getServerInfo(message)?.songs.length || 0) > 1) {
        const hasSongs = getServerInfo(message)?.songs.pop();
        if (hasSongs) getServerInfo(message)?.songs.splice(1, 0, hasSongs);
      }
    }
    return await message.channel.send(trackMessage(song.title, song.url, playTop));
  } catch (err) {
    console.log("err", err);
    return await message.channel.send(errorNotFound("track"));
  }
};
