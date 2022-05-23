import { Message, MessageEmbed } from "discord.js";
const logoPng =
  "https://camo.githubusercontent.com/848b01c611455668ef21f91f0bc32d974c87df7714dd7506797c23702f722cbf/68747470733a2f2f692e696d6775722e636f6d2f396f745338475a2e706e67";
const helpCommand = async (message: Message) => {
  const help = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Mufasa bot")
    .setAuthor("v0.0.7", logoPng, logoPng)
    .setThumbnail(logoPng)
    .addFields(
      {
        name: "!play `input` *[alias: !p]*",
        value:
          "*Spotify:* Song URL or playlist URL.\n*YouTube:* Song URL or search term.",
      },
      {
        name: "!playtop *[alias: !pt]*",
        value: "Places song first in queue",
      },
      { name: "!queue *[alias: !q]*", value: "See the current queue" },
      { name: "!skip *[alias: !fs]*", value: "Skips a song" },
      { name: "!shuffle *[alias: !mix]*", value: "Shuffle songs in queue" },
      { name: "!leave", value: "Bot leaves channel, useful for bugs." }
    )
    .addField(
      "!clear `amount` *[default: 10]*",
      "Clears requested amount of messages from chat"
    )
    .addField("!postureinfo", "Get reminders for your posture :chair:")
    .setTimestamp()
    .setFooter("Mufasa Bot", logoPng);
  return await message.channel.send({ embeds: [help] });
};

export default helpCommand;
