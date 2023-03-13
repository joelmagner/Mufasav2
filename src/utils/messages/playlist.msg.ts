import { SpotifyPlaylist, SpotifyTrack } from "play-dl";

import { EmbedBuilder } from "discord.js";
import { logoPng } from "../logo";

export const playlistMessage = (playlist: SpotifyPlaylist, songs: SpotifyTrack[]) => {
  const songInfo = new EmbedBuilder()
    .addFields({ name: "Playlist", value: playlist.name }, { name: "Songs", value: `Added **${songs.length}** tracks from playlist` })
    .setTimestamp()
    .setFooter({ text: `Playlist by: ${playlist.owner.name}`, iconURL: logoPng });
  if (playlist.thumbnail) songInfo.setThumbnail(playlist.thumbnail.url);
  return { embeds: [songInfo] };
};
