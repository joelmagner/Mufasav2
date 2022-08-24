import * as play from "play-dl";

import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { StageChannel, TextBasedChannels, VoiceChannel } from "discord.js";

import { Song } from "./song.type";

export type Server = {
  voiceChannel: VoiceChannel | StageChannel;
  textChannel: TextBasedChannels;
  connection: VoiceConnection | null;
  songs: Song[];
  audioPlayer: AudioPlayer | null;
  audioStream: play.YouTubeStream | play.SoundCloudStream | null;
};
