import * as play from "play-dl";

import { Message } from "discord.js";
import { Song } from "../../types/song.type";
import { getGuildInfo } from "../../utils/getGuildInfo";

export const track = async (message: Message, args: string[], playTop: boolean) => {
  try {
    const metadata: any = await play.spotify(args.join(" ")); // get info from spotify
    const songName = metadata.name + " - " + metadata.artists[0].name;

    const song: Song = {
      title: songName,
      url: metadata.url,
      thumbnail: metadata.thumbnail.url ?? "",
    };
    if (getGuildInfo(message)?.songs) {
      getGuildInfo(message)?.songs.push(song);
      if (playTop && (getGuildInfo(message)?.songs.length || 0) > 1) {
        // PlayTop
        getGuildInfo(message)?.songs.splice(1, 0, getGuildInfo(message)?.songs.pop()!);
      }
    }
    await message.channel.send({
      embeds: [
        {
          description: `Added **${song.title}** to the ${playTop ? "top of the " : ""}queue`,
        },
      ],
    });
  } catch (err) {
    console.log("err", err);
  }
};
