import { SpotifyAlbum, SpotifyTrack } from "play-dl";

import { MessageEmbed } from "discord.js";
import { logoPng } from "../logo";

export const albumMessage = (album: SpotifyAlbum, songs: SpotifyTrack[]) => {
  const songInfo = new MessageEmbed()
    .addFields({ name: "Album", value: album.name }, { name: "Songs", value: `Added **${songs.length}** tracks from album` })
    .setTimestamp()
    .setFooter({ text: "", iconURL: logoPng });
  if (album.thumbnail) songInfo.setThumbnail(album.thumbnail.url);
  return { embeds: [songInfo] };
};
