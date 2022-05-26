import { Message, MessageActionRow, MessageEmbed, MessageSelectMenu } from "discord.js";

import { getGuildInfo } from "../../utils/getGuildInfo";
import { logoPng } from "../../utils/logo";

export const getQueue = async (message: Message) => {
  const q = getGuildInfo(message);

  const qMsg = new MessageEmbed()
    .setAuthor("Music Queue:")
    .setDescription("Select the queue page you want to look at")
    .setColor(0x05c7e9)
    .setTimestamp()
    .setFooter("Mufasa", logoPng);

  const row = new MessageActionRow();
  const menu = new MessageSelectMenu().setCustomId("queue_menu").setPlaceholder("Select Queue Page");
  const qPages = Math.ceil((q?.songs?.length ?? 1) / 10);
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
  await message.channel.send({ embeds: [qMsg], components: [row] });
  const collector = message.channel.createMessageComponentCollector({
    componentType: "SELECT_MENU",
    time: 30000,
    max: 9,
  });

  collector.on("collect", async (i) => {
    if (i.user.id === message?.member?.id) {
      try {
        if (q?.songs) {
          let msg = "";
          qMsg.description = "";
          const userResponseAmount = parseInt(((await i.toJSON()) as any).values[0]);
          q.songs.forEach((song, index) => {
            if (index >= userResponseAmount * 10 && index <= (userResponseAmount + 1) * 10) {
              if (index === 0) {
                msg += `▶️ **${song.title}**.`;
                if (song.thumbnail) qMsg.setThumbnail(song.thumbnail);
              } else {
                msg += `\n${index}. **${song.title}**.`;
              }
            }
          });
          qMsg.setDescription(msg);
        }
      } catch (err) {
        await i.reply({
          embeds: [
            {
              description: `Something went wrong...`,
              color: 0xef0101,
            },
          ],
        });
        console.log("err in queue", err);
      }

      await i.update({ embeds: [qMsg], fetchReply: true });
    } else {
      await i.reply({
        content: `This menu isn't meant for you! Ask @${message?.member?.user.username}!`,
        ephemeral: true,
      });
    }
  });

  collector.on("dispose", async (i) => {
    await i.update({ components: [] });
  });
};
