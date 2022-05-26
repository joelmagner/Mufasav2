import * as play from "play-dl";

import { Message, MessageEmbed } from "discord.js";

import { SpotifyPlaylist } from "play-dl/dist/Spotify/classes";
import { getGuildInfo } from "../../utils/getGuildInfo";
import { logoPng } from "../../utils/logo";

export const album = async (message: Message, args: string[], playTop: boolean) => {
  if (playTop)
    return await message.channel.send({
      embeds: [
        {
          description: `You cannot add an album to the top of the queue dude, that's rude...\nType \`!help\` to get some help`,
          color: 0xef0101,
        },
      ],
    });

  const metadata = (await play.spotify(args[0])) as SpotifyPlaylist;

  await metadata.fetch();
  const album = metadata.page(1);

  if (!album) return await message.channel.send("Album not found");

  for (let i = 1; i <= album.length - 1; i++) {
    try {
      const songName = album[i].name + " - " + album[i].artists[0].name;

      getGuildInfo(message)?.songs?.push({
        title: songName,
        url: album[i].url,
        thumbnail: album[i].thumbnail?.url ?? "",
      });
    } catch (err) {
      console.log("playlist err:", err);
    }
  }
  const songInfo = new MessageEmbed()
    .addField(`Album`, metadata.name)
    .addField("Songs", `Added **${album.length}** tracks from album`)
    .setTimestamp()
    .setFooter(``, logoPng);
  if (metadata.thumbnail) songInfo.setThumbnail(metadata.thumbnail.url);
  return await message.channel.send({ embeds: [songInfo] });
};
