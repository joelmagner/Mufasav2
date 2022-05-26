import { AudioPlayerStatus } from "@discordjs/voice";
import { Message } from "discord.js";
import { getGuildInfo } from "../../utils/getGuildInfo";
import { isInVoiceChannel } from "../../utils/isInVoiceChannel";
import { player } from "./player";

export const skip = async (message: Message, args: string[]) => {
  if (!(await isInVoiceChannel(message))) return;
  const audioPlayer = getGuildInfo(message)?.audioPlayer;
  if (!audioPlayer) return await message.channel.send("No audioPlayer found.");
  if (audioPlayer?.state.status !== AudioPlayerStatus.Playing) {
    await message.channel.send({
      embeds: [{ description: "Something is wrong, try `!leave` if it doesn't work next time, I'll try to do a few things in the background..." }],
    });
  }
  audioPlayer.state.status = AudioPlayerStatus.Idle; // DO NOT DELETE!
  try {
    const q = getGuildInfo(message);
    if (q?.songs) {
      if (!q.songs.length) {
        return await message.channel.send({ embeds: [{ description: "The end of the queue... Bye :wave:" }] });
      }
      const multiple = Number(args.join("")) ?? false;
      if (multiple) {
        for (let i = 0; i < multiple; i++) {
          if (q.songs.length > multiple) q.songs.shift();
        }
      }
      q.songs.shift();
      audioPlayer.stop();
      await message.channel.send({
        embeds: [{ description: `Skipping ${multiple ? multiple + " songs" : "song"}... :next_track:` }],
      });
      return await player(message);
    } else {
      return await message.channel.send("Nothing to skip :eyes:");
    }
  } catch (err) {
    console.log("error skipping ", err);
  }
  return await message.channel.send("ERROR SKIPPING");
};
