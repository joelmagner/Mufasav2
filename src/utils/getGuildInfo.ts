import { Message } from "discord.js";
import { server } from "./server";

export const getServerInfo = (message: Message) => {
  const guildId = getGuildId(message);
  if (!guildId) return;
  const serverInfo = server.get(guildId);
  if (!serverInfo) return;
  return serverInfo;
};

export const getGuildId = (message: Message) => {
  const guildId = message.guild?.id;
  if (!guildId) throw Error("Guild Id not found");
  return guildId;
};
