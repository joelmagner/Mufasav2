import { SpotifyAlbum, SpotifyTrack } from "play-dl";

import { MessageEmbed } from "discord.js";
import { logoPng } from "../logo";

export const albumMessage = (album: SpotifyAlbum, songs: SpotifyTrack[]) => {
  const songInfo = new MessageEmbed()
    .addField(`Album`, album.name)
    .addField("Songs", `Added **${songs.length}** tracks from album`)
    .setTimestamp()
    .setFooter(``, logoPng);
  if (album.thumbnail) songInfo.setThumbnail(album.thumbnail.url);
  return { embeds: [songInfo] };
};
