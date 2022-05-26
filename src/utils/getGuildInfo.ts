import { Message } from "discord.js";
import { queue } from "./queue";

export const getGuildInfo = (message: Message) => {
  const guildId = message.guild?.id;
  if (!guildId) return;
  const serverInfo = queue.get(guildId);
  if (!serverInfo) return;
  return serverInfo;
};
