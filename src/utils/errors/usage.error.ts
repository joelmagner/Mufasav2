import { MediaType } from "../../types/media.type";

export const errorTopOfQueue = (mediaType: MediaType) => {
  return {
    embeds: [
      {
        color: 0xef0101,
        description: `You cannot add a ${mediaType} to the top of the queue dude, that's rude...\nType \`!help\` to get some help`,
      },
    ],
  };
};
