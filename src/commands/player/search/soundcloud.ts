import * as play from "play-dl";

import { Song } from "../../../types/song.type";
import { SoundCloudTrack } from "play-dl/dist/SoundCloud/classes";
import { refreshSoundcloudToken } from "../../../utils/sessions/soundcloud.session";

export const soundcloud = async (args: string): Promise<Song | null> => {
  await refreshSoundcloudToken();
  const soundcloud = await play.so_validate(args);
  if (soundcloud === "track") {
    const { name, url, thumbnail } = (await play.soundcloud(args)) as SoundCloudTrack;
    return {
      title: name,
      url,
      thumbnail,
    };
  }

  return null;
};
