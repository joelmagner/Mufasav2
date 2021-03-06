import * as play from "play-dl";

import { Song } from "../../../types/song.type";
import { YouTubeVideo } from "play-dl/dist/YouTube/classes/Video";

export const youtube = async (args: string): Promise<Song | null> => {
  const songs = (await play.search(args, {
    limit: 1,
  })) as YouTubeVideo[];

  if (songs?.length) {
    return {
      title: songs[0].title ?? "",
      url: songs[0].url,
      thumbnail: songs[0].thumbnail?.url,
    };
  }
  return null;
};
