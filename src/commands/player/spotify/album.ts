import * as play from "play-dl";

import { Message } from "discord.js";
import { SpotifyAlbum } from "play-dl/dist/Spotify/classes";
import { albumMessage } from "../../../utils/messages/album.msg";
import { albumNotFound } from "../../../utils/errors/album.error";
import { errorTopOfQueue } from "../../../utils/errors/usage.error";
import { getServerInfo } from "../../../utils/getGuildInfo";

export const album = async (message: Message, args: string[], playTop: boolean) => {
  if (playTop) return await message.channel.send(errorTopOfQueue("album"));

  const album = (await play.spotify(args[0])) as SpotifyAlbum;
  const songs = (await album.fetch())?.page(1);
  if (!songs) return await message.channel.send(albumNotFound);

  for (let i = 1; i <= songs.length - 1; i++) {
    try {
      const songName = songs[i].name + " - " + songs[i].artists[0].name;

      getServerInfo(message)?.songs?.push({
        title: songName,
        url: songs[i].url,
        thumbnail: songs[i].thumbnail?.url ?? "",
      });
    } catch (err) {
      console.log("playlist err:", err);
    }
  }
  return await message.channel.send(albumMessage(album, songs));
};
