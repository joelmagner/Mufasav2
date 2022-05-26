import { Message } from "discord.js";
import { server } from "./server";

export const getServerInfo = (message: Message) => {
  const guildId = message.guild?.id;
  if (!guildId) return;
  const serverInfo = server.get(guildId);
  if (!serverInfo) return;
  return serverInfo;
};
