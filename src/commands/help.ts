import { Message, MessageEmbed } from "discord.js";

import { logoPng } from "../utils/logo";

const helpCommand = async (message: Message) => {
  const help = new MessageEmbed()
    .setColor("#F8A926")
    .setTitle("Mufasa bot")
    .setAuthor("v1.0.2", logoPng, logoPng)
    .setThumbnail(logoPng)
    .addFields(
      {
        name: "!play `input` *[alias: !p]*",
        value: "*Spotify:* Song, Album or Playlist URL.\n*YouTube:* Song URL or search term.\n*Soundcloud:* Song URL",
      },
      {
        name: "!playtop `input` *[alias: !pt]*",
        value: "Places song first in queue",
      },
      { name: "!skip `amount` *[alias: !fs]*", value: "Skip song(s)" },
      { name: "!queue *[alias: !q]*", value: "See the current queue" },
      { name: "!shuffle *[alias: !mix]*", value: "Shuffle songs in queue" },
      { name: "!leave", value: "Bot leaves channel, useful for bugs." },
      { name: "!clear `amount` *[default: 10]*", value: "Clears requested amount of messages from chat" },
      { name: "!postureinfo", value: "Get reminders for your posture :chair:" }
    )
    .setTimestamp()
    .setFooter("Mufasa Bot", logoPng);
  return await message.channel.send({ embeds: [help] });
};

export default helpCommand;
