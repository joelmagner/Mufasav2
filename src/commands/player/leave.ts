import { Message } from "discord.js";
import { isInVoiceChannel } from "../../utils/isInVoiceChannel";
import { queue } from "../../utils/queue";

export const leave = async (message: Message) => {
  if (!(await isInVoiceChannel(message))) return;
  queue.get(message.guild!.id)?.connection?.destroy();
  queue.delete(message.guild!.id);
  return await message.channel.send({
    embeds: [{ description: ":wave:", color: 0x05c7e9 }],
  });
};
