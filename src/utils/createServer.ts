import { NoSubscriberBehavior, createAudioPlayer } from "@discordjs/voice";
import { StageChannel, TextBasedChannel, VoiceChannel } from "discord.js";

import { Server } from "src/types/server.type";

export const createServer = (voiceChannel: VoiceChannel | StageChannel, textChannel: TextBasedChannel): Server => {
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
