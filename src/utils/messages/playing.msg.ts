import { SoundCloudTrack, YouTubeVideo } from "play-dl";

import { MessageEmbed } from "discord.js";
import { Song } from "../../types/song.type";
import { logoPng } from "../logo";

const calculateDuration = (s: number) => {
  // returns the duration in "minutes:seconds" format
  return (s - (s %= 60)) / 60 + (9 < s ? ":" : ":0") + s;
};

export const playingMessageSoundCloud = (req: Song, song: SoundCloudTrack) => {
  return new MessageEmbed()
    .addFields({ name: "Requested:", value: req.title }, { name: "Now Playing:", value: song.name })
    .setFooter({
      text: `Duration: ${calculateDuration(song.durationInSec)}`,
      iconURL: logoPng,
    })
    .setThumbnail(song.thumbnail ?? "")
    .setTimestamp();
};

export const playingMessageYoutube = (req: Song, song: YouTubeVideo) => {
  return new MessageEmbed()
    .addFields({ name: "Requested:", value: req.title }, { name: "Now Playing:", value: song.title ?? "" })
    .setFooter({ text: `Duration: ${song.durationRaw}`, iconURL: logoPng })
    .setThumbnail(req.thumbnail ?? "")
    .setTimestamp();
};
