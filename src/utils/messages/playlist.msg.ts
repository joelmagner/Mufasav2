import { SpotifyPlaylist, SpotifyTrack } from "play-dl";

import { MessageEmbed } from "discord.js";
import { logoPng } from "../logo";

export const playlistMessage = (playlist: SpotifyPlaylist, songs: SpotifyTrack[]) => {
  const songInfo = new MessageEmbed()
    .addField(`Playlist`, playlist.name)
    .addField("Songs", `Added **${songs.length}** tracks from playlist`)
    .setTimestamp()
    .setFooter(`Playlist by: ${playlist.owner.name}`, logoPng);
  if (playlist.thumbnail) songInfo.setThumbnail(playlist.thumbnail.url);
  return { embeds: [songInfo] };
};
