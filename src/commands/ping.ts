import { Client, Message } from "discord.js";

const pingCommand = async (client: Client, message: Message) => {
  await message.channel.send(`:ping_pong: Pong! ${client.ws.ping}ms`);
};

export default pingCommand;
