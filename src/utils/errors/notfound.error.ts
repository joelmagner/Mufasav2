import { MediaType } from "../../types/media.type";

export const errorNotFound = (mediaType: MediaType) => {
  return {
    embeds: [{ color: 0xff0000, description: `Not ${mediaType} found` }],
  };
};
