export const trackMessage = (title: string, url: string, playTop: boolean) => {
  return {
    embeds: [
      {
        color: 0x0099ff,
        description: `Added **[${title}](${url})** to the ${playTop ? "**top** of the " : ""}queue`,
      },
    ],
  };
};
