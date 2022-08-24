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
    .addField("Requested:", req.title)
    .addField("Now Playing:", song.name)
    .setFooter(`Duration: ${calculateDuration(song.durationInSec)}`, logoPng)
    .setThumbnail(song.thumbnail ?? "")
    .setTimestamp();
};

export const playingMessageYoutube = (req: Song, song: YouTubeVideo) => {
  return new MessageEmbed()
    .addField("Requested:", req.title)
    .addField("Now Playing:", song?.title ?? "")
    .setFooter(`Duration: ${song.durationRaw}`, logoPng)
    .setThumbnail(req.thumbnail ?? "")
    .setTimestamp();
};
