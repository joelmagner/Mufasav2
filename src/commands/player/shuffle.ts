import { Message } from "discord.js";
import { Song } from "../../types/song.type";
import { getGuildInfo } from "../../utils/getGuildInfo";

export const shuffle = async (message: Message) => {
  const q = getGuildInfo(message);

  const shuffleArray = (array: Song[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  if (q?.songs) {
    q.songs = shuffleArray(q.songs);
    return await message.channel.send({
      embeds: [
        {
          description: `:arrows_counterclockwise: Shuffled ${q.songs.length} songs`,
        },
      ],
    });
  }
  return;
};
