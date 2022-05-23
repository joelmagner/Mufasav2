import * as play from "play-dl";

import {
  AudioPlayer,
  AudioPlayerStatus,
  DiscordGatewayAdapterCreator,
  NoSubscriberBehavior,
  VoiceConnection,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";
import { Message, MessageActionRow, MessageEmbed, MessageSelectMenu, StageChannel, TextBasedChannels, VoiceChannel } from "discord.js";

import { SpotifyPlaylist } from "play-dl/dist/Spotify/classes";

type Song = {
  title: string;
  url: string;
  thumbnail?: string;
};

type Queue = {
  voiceChannel: VoiceChannel | StageChannel;
  textChannel: TextBasedChannels;
  connection: VoiceConnection | null;
  songs: Song[];
  audioPlayer: AudioPlayer | null;
  audioStream: any;
};

const queue: Map<string, Queue> = new Map();
const logoPng =
  "https://camo.githubusercontent.com/848b01c611455668ef21f91f0bc32d974c87df7714dd7506797c23702f722cbf/68747470733a2f2f692e696d6775722e636f6d2f396f745338475a2e706e67";

export default class PlayCommmand {
  createServerQueue = (voiceChannel: VoiceChannel | StageChannel, textChannel: TextBasedChannels): Queue => {
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

  isInVoiceChannel = async (message: Message): Promise<boolean> => {
    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel) {
      await message.channel.send({
        embeds: [
          {
            color: 0xff0000,
            description: "You are not connected to a voice channel.",
          },
        ],
      });
      return false;
    }
    return true;
  };

  init = async (message: Message, args: string[], playTop: boolean = false) => {
    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel || !(await this.isInVoiceChannel(message))) return;
    if (!args.length) return await message.channel.send("Please specify a song to play.");

    const serverQueue = queue.get(message.guild!.id);

    // check if same channel as bot.
    if (serverQueue?.voiceChannel && serverQueue?.voiceChannel.id !== voiceChannel.id) {
      await message.channel.send({
        embeds: [
          {
            color: 0xff0000,
            description: "You are not connected to the same voice channel as the bot.",
          },
        ],
      });
      return;
    }

    if (!serverQueue && message.guild?.id) {
      queue.set(message.guild.id, this.createServerQueue(voiceChannel, message.channel));
    }

    if (play.is_expired()) {
      await play.refreshToken();
    }
    const serverSongs = this.getGuildInfo(message)?.songs;
    const spotifyLink = play.sp_validate(args.join(" "));
    if (!spotifyLink || spotifyLink === "search") {
      console.log("youtube");
      const searchedByQuery: any = await play.search(`${args.join(" ")}`, {
        limit: 1,
      });
      if (!searchedByQuery[0]?.url) return await message.channel.send("Song not found");

      serverSongs?.push({
        title: searchedByQuery[0].title,
        url: searchedByQuery[0].url,
        thumbnail: searchedByQuery[0].thumbnail.url,
      });

      if (playTop && message.guild?.id && this.getGuildInfo(message)?.songs && serverSongs && serverSongs?.length > 1) {
        // PlayTop
        this.getGuildInfo(message)?.songs?.splice(1, 0, serverSongs.pop()!);
      }

      await message.channel.send({
        embeds: [
          {
            description: `Added **${searchedByQuery[0].title}** to the ${playTop ? "top of the " : ""}queue`,
          },
        ],
      });
    } else if (spotifyLink === "track") {
      try {
        const metadata: any = await play.spotify(args.join(" ")); // get info from spotify
        const songName = metadata.name + " - " + metadata.artists[0].name;

        const song: Song = {
          title: songName,
          url: metadata.url,
          thumbnail: metadata.thumbnail.url ?? "",
        };
        if (serverSongs) {
          serverSongs.push(song);
          if (playTop && serverSongs.length > 1) {
            // PlayTop
            serverSongs.splice(1, 0, serverSongs.pop()!);
          }
        }
        await message.channel.send({
          embeds: [
            {
              description: `Added **${song.title}** to the ${playTop ? "top of the " : ""}queue`,
            },
          ],
        });
      } catch (err) {
        console.log("err", err);
      }
    } else if (spotifyLink === "playlist") {
      if (playTop)
        return await message.channel.send({
          embeds: [
            {
              description: `You cannot add a playlist to the top of the queue dude, that's rude...\nType \`!help\` to get some help`,
              color: 0xef0101,
            },
          ],
        });

      const metadata: any = await play.spotify(args[0]);

      await metadata.fetch();
      const playlist = await metadata.page(1);

      const currentQueue = serverSongs;
      for (let i = 1; i <= playlist.length - 1; i++) {
        // verkar behöva starta på 1.
        try {
          const songName = playlist[i].name + " - " + playlist[i].artists[0].name;

          currentQueue?.push({
            title: songName,
            url: playlist[i].url,
            thumbnail: playlist[i].thumbnail.url ?? "",
          });
        } catch (err) {
          console.log("playlist err:", err);
        }
      }
      const songInfo = new MessageEmbed()
        .addField(`Playlist`, metadata.name)
        .addField("Songs", `Added **${playlist.length}** tracks from playlist`)
        .setTimestamp()
        .setFooter(`Playlist by: ${metadata.owner.name}`, logoPng);
      if (metadata.thumbnail) songInfo.setThumbnail(metadata.thumbnail.url);
      await message.channel.send({ embeds: [songInfo] });
    } else if (spotifyLink === "album") {
      const metadata = (await play.spotify(args[0])) as SpotifyPlaylist;

      await metadata.fetch();
      const album = metadata.page(1);

      if (!album) return await message.channel.send("Album not found");

      const currentQueue = serverSongs;
      for (let i = 1; i <= album.length - 1; i++) {
        // verkar behöva starta på 1.
        try {
          const songName = album[i].name + " - " + album[i].artists[0].name;

          currentQueue?.push({
            title: songName,
            url: album[i].url,
            thumbnail: album[i].thumbnail?.url ?? "",
          });
        } catch (err) {
          console.log("playlist err:", err);
        }
      }
      const songInfo = new MessageEmbed()
        .addField(`Album`, metadata.name)
        .addField("Songs", `Added **${album.length}** tracks from album`)
        .setTimestamp()
        .setFooter(``, logoPng);
      if (metadata.thumbnail) songInfo.setThumbnail(metadata.thumbnail.url);
      await message.channel.send({ embeds: [songInfo] });
    }

    // Join channel

    if (message.guild && message.member.voice.channel) {
      if (!this.getGuildInfo(message)?.connection) {
        try {
          const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
          });
          const x = this.getGuildInfo(message);
          if (x) {
            x.connection = connection;
          } else {
            console.log("Couldn't connect to channel!");
          }
        } catch (err) {
          console.log("ERR", err);
        }
      }
    } else {
      await message.channel.send("You are not connected to the bots voice channel.");
    }

    if (this.getGuildInfo(message)?.audioPlayer?.state.status !== AudioPlayerStatus.Playing) {
      return await this.player(message, message.guild!.id);
    }
    return;
  };

  player = async (message: Message, guildId: string) => {
    const server: Queue | undefined = this.getGuildInfo(message);
    if (!server) return await message.channel.send("No queue found.");
    if (server.voiceChannel.members.size === 1 && server.voiceChannel.members.first()?.user.bot) {
      this.getGuildInfo(message)?.connection?.destroy();
      queue.delete(guildId);
      return await message.channel.send({
        embeds: [
          {
            color: 0xff0000,
            description: "Not enough people in the voice channel to play music. Leaving.",
          },
        ],
      });
    }
    if (!server.audioPlayer) {
      server.audioPlayer = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Play,
        },
      });
    }

    server.audioPlayer.removeAllListeners();
    server.audioPlayer.once(AudioPlayerStatus.Idle, async () => {
      console.log("⏭");
      const songList = this.getGuildInfo(message)?.songs;
      songList?.shift();
      if (songList?.length) {
        await this.player(message, guildId);
      }
    });

    if (this.getGuildInfo(message)?.songs?.length) {
      this.getGuildInfo(message)?.connection?.destroy();
      queue.delete(guildId);
      return await message.channel.send("Queue is empty. Destroying voice connection.");
    }

    if (server.audioPlayer?.state.status === AudioPlayerStatus.Idle || server.audioPlayer?.state.status === AudioPlayerStatus.Paused) {
      const nextSong = server.songs;

      if (!nextSong && !nextSong?.[0]) return;
      if (play.is_expired()) {
        await play.refreshToken();
      }

      const isSpotify = play.sp_validate(nextSong[0].url);
      let searchType: string = !!isSpotify ? nextSong[0].title : nextSong[0].url;

      let foundTrack: any = await play.search(`${searchType}`, {
        limit: 1,
      });

      if (!foundTrack?.[0]?.url) {
        // fallback to searching, only needed for spotify links..
        console.log("Couldn't find song, using fallback.");
        foundTrack = await play.search(`${nextSong[0].title}`, {
          limit: 1,
        });
      }

      if (!foundTrack?.[0]?.url) {
        // give up, go to next song.
        server.songs.shift();
        server.audioPlayer.state.status = AudioPlayerStatus.Idle;
        setTimeout(() => console.log("Couldn't find song...", foundTrack), 200);
        await this.player(message, guildId);
        return await message.channel.send({
          embeds: [
            {
              color: 0xff0000,
              description: "Song not found, skipping to next one.",
            },
          ],
        });
      }

      if (server.audioStream) (await server.audioStream).stream.destroy();
      server.audioStream = await play.stream(foundTrack[0].url);

      let resource = createAudioResource(server.audioStream.stream, {
        inputType: server.audioStream.type,
      });
      server.audioPlayer.play(resource);
      server.connection?.subscribe(server.audioPlayer);

      const songInfo = new MessageEmbed()
        .addField("Now Playing:", foundTrack[0].title)
        .addField("Requested:", nextSong[0].title)
        .setTimestamp()
        .setFooter(`Duration: ${foundTrack[0].durationRaw}`, logoPng);
      if (nextSong[0].thumbnail) songInfo.setThumbnail(nextSong[0].thumbnail);
      return await message.channel.send({ embeds: [songInfo] });
    }
    return await message.channel.send("Something went wrong...");
  };

  skip = async (message: Message, args: string[]) => {
    if (!(await this.isInVoiceChannel(message))) return;
    const audioPlayer = this.getGuildInfo(message)?.audioPlayer;
    if (!audioPlayer) return await message.channel.send("No audioPlayer found.");
    if (audioPlayer?.state.status !== AudioPlayerStatus.Playing) {
      await message.channel.send("Yikes, something is wrong, use `!leave` if this doesn't work...");
    }
    audioPlayer.state.status = AudioPlayerStatus.Idle; // DO NOT DELETE!
    try {
      const q = queue.get(message.guild!.id);
      if (q && q.songs) {
        if (!q.songs.length) {
          return await message.channel.send("Skipping song, that was the end of the queue... Bye :eyes:");
        }
        const multiple = Number(args.join("")) ?? false;
        if (multiple) {
          for (let i = 0; i < multiple; i++) {
            if (q.songs.length > multiple) q.songs.shift();
          }
        }
        q.songs.shift();
        audioPlayer.stop();
        await message.channel.send({
          embeds: [{ description: `Skipping ${multiple ? multiple + " songs" : "song"}... :next_track:` }],
        });
        return await this.player(message, message.guild!.id);
      } else {
        return await message.channel.send("Nothing to skip :eyes:");
      }
    } catch (err) {
      console.log("error skipping ", err);
    }
    return await message.channel.send("ERROR SKIPPING");
  };

  skipMultiple = async (message: Message) => {
    if (!(await this.isInVoiceChannel(message))) return;
    const audioPlayer = this.getGuildInfo(message)?.audioPlayer;
    if (!audioPlayer) return await message.channel.send("No audioPlayer found.");
    if (audioPlayer?.state.status !== AudioPlayerStatus.Playing) {
      await message.channel.send("Yikes, something is wrong, use `!leave` if this doesn't work...");
    }
    audioPlayer.state.status = AudioPlayerStatus.Idle; // DO NOT DELETE!
    try {
      const q = this.getGuildInfo(message);
      if (q && q.songs) {
        if (!q.songs.length) {
          return await message.channel.send("Skipping song, that was the end of the queue... Bye :eyes:");
        }
        q.songs.shift();
        audioPlayer.stop();
        await message.channel.send({
          embeds: [{ description: "Skipping song... :next_track:" }],
        });
        return await this.player(message, message.guild!.id);
      } else {
        return await message.channel.send("Nothing to skip :eyes:");
      }
    } catch (err) {
      console.log("error skipping ", err);
    }
    return await message.channel.send("ERROR SKIPPING");
  };

  queue = async (message: Message) => {
    const q = queue.get(message.guild!.id);

    const qMsg = new MessageEmbed()
      .setAuthor("Music Queue:")
      .setDescription("Select the queue page you want to look at")
      .setColor(0x05c7e9)
      .setTimestamp()
      .setFooter("Mufasa", logoPng);

    const row = new MessageActionRow();
    const menu = new MessageSelectMenu().setCustomId("queue_menu").setPlaceholder("Select Queue Page");
    const qPages = Math.ceil((q?.songs?.length ?? 1) / 10);
    for (let i = 0; i < qPages; i++) {
      menu.addOptions([
        {
          label: `Page ${i + 1}`,
          description: `${i + 1}. Songs ${i * 10} - ${i * 10 + 10} of the current queue`,
          value: `${i}`,
        },
      ]);
    }

    await message.channel.sendTyping();
    row.addComponents(menu); // add menu
    await message.channel.send({ embeds: [qMsg], components: [row] });
    const collector = message.channel.createMessageComponentCollector({
      componentType: "SELECT_MENU",
      time: 30000,
      max: 9,
    });

    collector.on("collect", async (i) => {
      if (i.user.id === message?.member?.id) {
        try {
          if (q && q.songs) {
            let msg = "";
            qMsg.description = "";
            const userResponseAmount = parseInt(((await i.toJSON()) as any).values[0]);
            q.songs.forEach((song, index) => {
              if (index >= userResponseAmount * 10 && index <= (userResponseAmount + 1) * 10) {
                if (index === 0) {
                  msg += `▶️ **${song.title}**.`;
                  if (song.thumbnail) qMsg.setThumbnail(song.thumbnail);
                } else {
                  msg += `\n${index}. **${song.title}**.`;
                }
              }
            });
            qMsg.setDescription(msg);
          }
        } catch (err) {
          await i.reply({
            embeds: [
              {
                description: `Something went wrong...`,
                color: 0xef0101,
              },
            ],
          });
          console.log("err in queue", err);
        }

        await i.update({ embeds: [qMsg], fetchReply: true });
      } else {
        await i.reply({
          content: `This menu isn't meant for you! Ask @${message?.member?.user.username}!`,
          ephemeral: true,
        });
      }
    });

    collector.on("dispose", async (i) => {
      await i.update({ components: [] });
    });
  };

  shuffle = async (message: Message) => {
    const q = queue.get(message.guild!.id);

    const shuffleArray = (array: Song[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    if (q && q.songs) {
      q.songs = shuffleArray(q.songs);
      return await message.channel.send({
        embeds: [
          {
            description: `:arrows_counterclockwise: Shuffled ${q.songs.length} songs`,
          },
        ],
      });
    }
    return;
  };

  leave = async (message: Message) => {
    if (!(await this.isInVoiceChannel(message))) return;
    await message.channel.send({
      embeds: [{ description: ":wave:", color: 0x05c7e9 }],
    });
    queue.get(message.guild!.id)?.connection?.destroy();
    queue.delete(message.guild!.id);
    return;
  };

  getGuildInfo = (message: Message) => {
    const guildId = message.guild?.id;
    if (!guildId) return;
    const serverInfo = queue.get(guildId);
    if (!serverInfo) return;
    return serverInfo;
  };
}
// TODO: bryt ut menu-command.
// TODO: bryta ut funktioner.
// TODO: fixa felhantering, crashar den, gör det möjligt att inte behöva starta om hela node-processen.
// TODO: testa youtube-länkar. // implementera annars.
// TODO: skapa en mediaplayer för varje kanal.
