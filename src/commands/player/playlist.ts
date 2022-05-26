import * as play from "play-dl";

import { Message, MessageEmbed } from "discord.js";

import { getGuildInfo } from "../../utils/getGuildInfo";
import { logoPng } from "../../utils/logo";

export const playlist = async (message: Message, args: string[], playTop: boolean) => {
  if (playTop)
    return await message.channel.send({
      embeds: [
        {
          description: `You cannot add a playlist to the top of the queue dude, that's rude...\nType \`!help\` to get some help`,
          color: 0xef0101,
        },
      ],
    });

  const metadata: any = await play.spotify(args[0]);

  await metadata.fetch();
  const playlist = await metadata.page(1);

  for (let i = 1; i <= playlist.length - 1; i++) {
    // verkar behöva starta på 1.
    try {
      const songName = playlist[i].name + " - " + playlist[i].artists[0].name;

      getGuildInfo(message)?.songs?.push({
        title: songName,
        url: playlist[i].url,
        thumbnail: playlist[i].thumbnail.url ?? "",
      });
    } catch (err) {
      console.log("playlist err:", err);
    }
  }
  const songInfo = new MessageEmbed()
    .addField(`Playlist`, metadata.name)
    .addField("Songs", `Added **${playlist.length}** tracks from playlist`)
    .setTimestamp()
    .setFooter(`Playlist by: ${metadata.owner.name}`, logoPng);
  if (metadata.thumbnail) songInfo.setThumbnail(metadata.thumbnail.url);
  return await message.channel.send({ embeds: [songInfo] });
};
