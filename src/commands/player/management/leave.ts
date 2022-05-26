import { Message } from "discord.js";
import { isInVoiceChannel } from "../../../utils/isInVoiceChannel";
import { server } from "../../../utils/server";

export const leave = async (message: Message) => {
  if (!(await isInVoiceChannel(message))) return;
  const guildId = message.guild?.id;
  if (!guildId) return;
  server.get(guildId)?.connection?.destroy();
  server.delete(guildId);
  return await message.channel.send({
    embeds: [{ description: ":wave:", color: 0x05c7e9 }],
  });
};
