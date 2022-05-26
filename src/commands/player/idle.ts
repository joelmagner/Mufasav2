import { AudioPlayerStatus } from "@discordjs/voice";
import { Message } from "discord.js";
import { getGuildInfo } from "../../utils/getGuildInfo";
import { queue } from "../../utils/queue";

export const idle = async (message: Message) => {
  const audioPlayer = getGuildInfo(message)?.audioPlayer;
  if (audioPlayer?.state?.status !== AudioPlayerStatus.Idle) {
    // is playing or doing something...
    console.log("Apparently not idling..", audioPlayer?.state?.status);
    return;
  }

  const created = message.createdTimestamp;

  // if five minutes have passed
  if (created + 300000 < Date.now()) {
    getGuildInfo(message)?.connection?.destroy();
    queue.delete(message.guild!.id);
    console.log("idle, leaving...");
  }
  return;
};
