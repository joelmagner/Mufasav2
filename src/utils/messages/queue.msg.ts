import { Message, MessageActionRow, MessageEmbed, MessageSelectMenu } from "discord.js";

import { Song } from "../../types/song.type";
import { logoPng } from "../logo";

export const queueInfo = new MessageEmbed()
  .setAuthor("Music Queue:")
  .setDescription("Select the queue page you want to look at")
  .setColor(0x05c7e9)
  .setTimestamp()
  .setFooter("Mufasa", logoPng);

export const queuePages = async (message: Message, songs: Song[]) => {
  const row = new MessageActionRow();
  const menu = new MessageSelectMenu().setCustomId("queue_menu").setPlaceholder("Select Queue Page");
  const qPages = Math.ceil((songs?.length ?? 1) / 10);
  for (let i = 0; i < qPages; i++) {
    menu.addOptions([
      {
        label: `Page ${i + 1}`,
        description: `${i + 1}. Songs ${i * 10} - ${i * 10 + 10} of the current queue`,
        value: `${i}`,
      },
    ]);
  }
  await message.channel.sendTyping();
  row.addComponents(menu); // add menu
  return row;
};
