import { Message } from "discord.js";

const clearCommand = async (message: Message, args: string[]) => {
  let limit: number = 10;

  if (args[0]) {
    try {
      const val = parseInt(args[0]);
      if (val <= 50) {
        limit = val;
      } else {
        return await message.channel.send("Limit must be less than 50");
      }
    } catch (e) {
      console.log("Not a number in clearCommand");
    }
  }

  await message.channel.send(`Clearing **${limit}** messages...`);
  setTimeout(async () => {
    if (message.channel.type === "GUILD_TEXT") {
      return await message.channel.bulkDelete(limit);
    }
    return;
  }, 800);
  return;
};

export default clearCommand;
