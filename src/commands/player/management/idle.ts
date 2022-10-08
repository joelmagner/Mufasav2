import { getGuildId, getServerInfo } from "../../../utils/getGuildInfo";

import { AudioPlayerStatus } from "@discordjs/voice";
import { Message } from "discord.js";
import { server } from "../../../utils/server";

export const idle = async (message: Message) => {
  const audioPlayer = getServerInfo(message)?.audioPlayer;
  if (audioPlayer?.state?.status !== AudioPlayerStatus.Idle) {
    // is playing or doing something...
    console.log("Apparently not idling..", audioPlayer?.state?.status);
    return;
  }

  const created = message.createdTimestamp;
  // if five minutes have passed
  if (created + 300000 < Date.now()) {
    getServerInfo(message)?.connection?.destroy();
    const guildId = getGuildId(message);
    if (guildId) server.delete(guildId);
    console.log("idle, leaving...");
  }
  return;
};
