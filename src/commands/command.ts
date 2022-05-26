import { Client, Message } from "discord.js";
import { addMemberToPostureRole, postureInfo } from "./postureCheck";

import PlayCommand from "./play";
// import clearCommand from "./clear";
import { getQueue } from "./player/getQueue";
import helpCommand from "./help";
import { idle } from "./player/idle";
import { leave } from "./player/leave";
import pingCommand from "./ping";
import { shuffle } from "./player/shuffle";
import { skip } from "./player/skip";

let player: PlayCommand;

const command = async (client: Client, message: Message, cmd: string, args: string[]) => {
  try {
    if (!player) {
      player = new PlayCommand();
      //   setInterval(async () => {
      //     isWithinOpeningHours() ? await postureCommand(client) : null;
      //   }, 60 * 1000 * 60 * Math.floor(Math.random() * (4 - 2 + 1) + 2)); // 2-4h
    }
    switch (cmd) {
      case "ping":
        await pingCommand(client, message);
        break;
      case "clear":
        // await clearCommand(message, args);
        break;
      case "play":
      case "p":
        if (player) await player.init(message, args).catch(console.error);
        break;
      case "playtop":
      case "pt":
        if (player) await player.init(message, args, true).catch(console.error);
        break;
      case "skip":
      case "fs":
        if (player) await skip(message, args);
        break;
      case "queue":
        if (player) await getQueue(message);
        break;
      case "shuffle":
      case "mix":
        if (player) await shuffle(message);
        break;
      case "help":
      case "h":
      case "menu":
        if (player) await helpCommand(message);
        break;
      case "posture":
        await addMemberToPostureRole(message);
        break;
      case "badposture":
        await addMemberToPostureRole(message, true);
        break;
      case "postureinfo":
        await postureInfo(message);
        break;
      case "idle":
        await idle(message);
        break;
      case "leave":
        if (player) await leave(message);
        break;
      default:
        await message.channel.send({ embeds: [{ description: "We don't have that command" }] });
        break;
    }
  } catch (err) {
    await message.channel.send({
      embeds: [
        {
          description: `Something went wrong...`,
          color: 0xef0101,
        },
      ],
    });
    console.log("❌", "args:", args, "err:", err);
  }
};

export default command;
