import { Message } from "discord.js";
import { Song } from "../../../types/song.type";
import { errorNotFound } from "../../../utils/errors/notfound.error";
import { getServerInfo } from "../../../utils/getGuildInfo";
import { soundcloud } from "./soundcloud";
import { trackMessage } from "../../../utils/messages/track.msg";
import { youtube } from "./youtube";

const addTrack = async (message: Message, track: Song, playTop: boolean) => {
  getServerInfo(message)?.songs.push(track);
  if (playTop && (getServerInfo(message)?.songs?.length || 0) > 1) {
    const hasSongs = getServerInfo(message)?.songs?.pop();
    if (hasSongs) getServerInfo(message)?.songs?.splice(1, 0, hasSongs);
  }
  return await message.channel.send(trackMessage(track.title, track.url, playTop));
};

export const search = async (message: Message, args: string[], playTop: boolean) => {
  if (/\.soundcloud\.com|\/soundcloud\.com/g.test(args.join(" "))) {
    console.log("Soundcloud");
    const soundcloudTrack = await soundcloud(args.join(" "));
    if (soundcloudTrack) {
      return await addTrack(message, soundcloudTrack, playTop);
    }
  }

  const youtubeTrack = await youtube(args.join(" "));
  if (youtubeTrack) {
    return await addTrack(message, youtubeTrack, playTop);
  }

  return await message.channel.send(errorNotFound("track"));
};
