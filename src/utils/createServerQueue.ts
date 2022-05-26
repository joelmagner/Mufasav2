import { NoSubscriberBehavior, createAudioPlayer } from "@discordjs/voice";
import { StageChannel, TextBasedChannels, VoiceChannel } from "discord.js";

import { Queue } from "src/types/queue.type";

export const createServerQueue = (voiceChannel: VoiceChannel | StageChannel, textChannel: TextBasedChannels): Queue => {
  return {
    voiceChannel,
    textChannel,
    connection: null,
    songs: [],
    audioPlayer: createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    }),
    audioStream: null,
  };
};
