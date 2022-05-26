import { Message } from "discord.js";

export const isUserInVoiceChannel = async (message: Message): Promise<boolean> => {
  const voiceChannel = message.member?.voice?.channel;
  if (!voiceChannel) {
    await message.channel.send({
      embeds: [
        {
          color: 0xff0000,
          description: "You are not connected to a voice channel.",
        },
      ],
    });
    return false;
  }
  return true;
};
