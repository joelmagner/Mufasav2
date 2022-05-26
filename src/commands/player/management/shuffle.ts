import { Message } from "discord.js";
import { Song } from "../../../types/song.type";
import { getServerInfo } from "../../../utils/getGuildInfo";

export const shuffle = async (message: Message) => {
  const channel = getServerInfo(message);

  const shuffleArray = (array: Song[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  if (channel?.songs) {
    channel.songs = shuffleArray(channel.songs);
    return await message.channel.send({
      embeds: [
        {
          description: `:arrows_counterclockwise: Shuffled ${channel.songs.length} songs`,
        },
      ],
    });
  }
  return;
};
