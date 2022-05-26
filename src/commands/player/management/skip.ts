import { AudioPlayerStatus } from "@discordjs/voice";
import { Message } from "discord.js";
import { emptyErrorMessage } from "../../../utils/errors/empty.error";
import { getServerInfo } from "../../../utils/getGuildInfo";
import { isUserInVoiceChannel } from "../../../utils/isUserInVoiceChannel";
import { player } from "../player";

export const skip = async (message: Message, args: string[]) => {
  if (!(await isUserInVoiceChannel(message))) return;
  const audioPlayer = getServerInfo(message)?.audioPlayer;
  if (!audioPlayer) return await message.channel.send("No audioPlayer found.");
  if (audioPlayer?.state.status !== AudioPlayerStatus.Playing) {
    await message.channel.send({
      embeds: [{ description: "Something is wrong, try `!leave` if it doesn't work next time, I'll try to do a few things in the background..." }],
    });
  }
  audioPlayer.state.status = AudioPlayerStatus.Idle; // DO NOT DELETE!
  try {
    const channel = getServerInfo(message);
    if (channel?.songs) {
      if (!channel.songs.length) {
        return await message.channel.send({ embeds: [{ description: "The end of the queue... Bye :wave:" }] });
      }
      const multiple = Number(args.join("")) ?? false;
      if (multiple) {
        for (let i = 0; i < multiple; i++) {
          if (channel.songs.length > multiple) channel.songs.shift();
        }
      }
      channel.songs.shift();
      audioPlayer.stop();
      await message.channel.send({
        embeds: [{ description: `Skipping ${multiple ? multiple + "songs" : "song"}... :next_track:` }],
      });
      return await player(message);
    } else {
      return await message.channel.send(emptyErrorMessage);
    }
  } catch (err) {
    console.log("error skipping ", err);
  }
  return await message.channel.send("ERROR SKIPPING");
};
