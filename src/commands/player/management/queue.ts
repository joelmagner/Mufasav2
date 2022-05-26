/* eslint-disable @typescript-eslint/no-explicit-any */
import { queueInfo, queuePages } from "../../../utils/messages/queue.msg";

import { Message } from "discord.js";
import { Song } from "src/types/song.type";
import { emptyErrorMessage } from "../../../utils/errors/empty.error";
import { getServerInfo } from "../../../utils/getGuildInfo";

export const queue = async (message: Message) => {
  const songs = getServerInfo(message)?.songs;
  if (!songs) return await message.channel.send(emptyErrorMessage);

  await message.channel.send({ embeds: [queueInfo], components: [await queuePages(message, songs)] });
  const collector = message.channel.createMessageComponentCollector({
    componentType: "SELECT_MENU",
    time: 30000,
    max: 9,
  });

  collector.on("collect", async (i) => {
    if (i.user.id !== message?.member?.id) {
      return await i.reply({
        content: `This menu is controlled by @${message?.member?.user.username}!`,
        ephemeral: true,
      });
    }
    try {
      const updatedMessage = queueInfo;
      if (songs) {
        const userResponseAmount = parseInt(((await i.toJSON()) as any).values[0]);
        let msg = "";
        songs.forEach((song: Song, index: number) => {
          if (index >= userResponseAmount * 10 && index <= (userResponseAmount + 1) * 10) {
            if (index === 0) {
              msg += `▶️ **${song.title}**.`;
              if (song.thumbnail) queueInfo.setThumbnail(song.thumbnail);
            } else {
              msg += `\n${index}. **${song.title}**.`;
            }
          }
        });
        updatedMessage.setDescription(msg);
      }
      await i.update({ embeds: [updatedMessage], fetchReply: true });
    } catch (err) {
      console.log("Queue Message Error:", err);
      return await i.reply({
        embeds: [
          {
            description: `Something went wrong...`,
            color: 0xef0101,
          },
        ],
      });
    }
  });

  collector.on("dispose", async (i) => {
    return await i.update({ components: [] });
  });

  collector.on("end", async (i) => {
    await message.react("✅");
    const menu = i.firstKey();
    if (!menu) return;
    return await i.get(menu)?.deleteReply();
  });
  return;
};
