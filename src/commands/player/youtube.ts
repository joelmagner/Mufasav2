import * as play from "play-dl";

import { Message } from "discord.js";
import { getGuildInfo } from "../../utils/getGuildInfo";

export const youtube = async (message: Message, args: string[], playTop: boolean) => {
  console.log("youtube");
  const searchedByQuery: any = await play.search(`${args.join(" ")}`, {
    limit: 1,
  });
  if (!searchedByQuery[0]?.url) return await message.channel.send("Song not found");

  getGuildInfo(message)?.songs?.push({
    title: searchedByQuery[0].title,
    url: searchedByQuery[0].url,
    thumbnail: searchedByQuery[0].thumbnail.url,
  });

  if (
    playTop &&
    message.guild?.id &&
    getGuildInfo(message)?.songs &&
    getGuildInfo(message)?.songs &&
    (getGuildInfo(message)?.songs.length || 0) > 1
  ) {
    // PlayTop
    getGuildInfo(message)?.songs?.splice(1, 0, getGuildInfo(message)?.songs?.pop()!);
  }

  return await message.channel.send({
    embeds: [
      {
        description: `Added **${searchedByQuery[0].title}** to the ${playTop ? "top of the " : ""}queue`,
      },
    ],
  });
};
