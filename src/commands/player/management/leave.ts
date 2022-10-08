import { Message } from "discord.js";
import { getGuildId } from "../../../utils/getGuildInfo";
import { isUserInVoiceChannel } from "../../../utils/isUserInVoiceChannel";
import { server } from "../../../utils/server";

export const leave = async (message: Message) => {
  if (!(await isUserInVoiceChannel(message))) return;
  const guildId = getGuildId(message);
  if (!guildId) return;
  server.get(guildId)?.connection?.destroy();
  server.delete(guildId);
  return await message.channel.send({
    embeds: [{ description: ":wave:", color: 0x05c7e9 }],
  });
};
