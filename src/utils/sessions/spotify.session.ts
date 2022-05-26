import * as play from "play-dl";

export const refreshSpotifyToken = async () => {
  if (play.is_expired()) {
    await play.refreshToken();
  }
};
