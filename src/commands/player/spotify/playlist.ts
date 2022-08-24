import * as play from "play-dl";

import { Message } from "discord.js";
import { SpotifyPlaylist } from "play-dl";
import { errorTopOfQueue } from "../../../utils/errors/usage.error";
import { getServerInfo } from "../../../utils/getGuildInfo";
import { playlistMessage } from "../../../utils/messages/playlist.msg";
import { playlistNotFound } from "../../../utils/errors/playlist.error";

export const playlist = async (message: Message, args: string[], playTop: boolean) => {
  if (playTop) return await message.channel.send(errorTopOfQueue("playlist"));

  const playlist = (await play.spotify(args[0])) as SpotifyPlaylist;
  await playlist.fetch();
  const songs = playlist.page(1);
  if (!songs) return await message.channel.send(playlistNotFound);

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

  return await message.channel.send(playlistMessage(playlist, songs));
};
