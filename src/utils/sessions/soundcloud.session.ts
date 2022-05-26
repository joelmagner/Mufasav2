import * as play from "play-dl";
export const refreshSoundcloudToken = async () => {
  const soClient = await play.getFreeClientID();
  play.setToken({ soundcloud: { client_id: soClient } });
};
