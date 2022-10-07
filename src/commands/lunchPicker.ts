import { Message } from "discord.js";

const lunchPicker = async (message: Message, args: string[]) => {
  if (args?.length) {
    return await message.channel.send({
      embeds: [
        {
          title: args[Math.floor(Math.random() * Object.keys(args).length)],
          description: "Will choose the lunch place for today.",
          color: 0x05c7e9,
        },
      ],
    });
  }

  const lunchPlaces: { name: string; location: string }[] = [
    {
      name: "Lux",
      location:
        "https://www.google.se/maps/place/Lux+Dag+f%C3%B6r+Dag/@59.324432,18.0031497,16.44z/data=!4m5!3m4!1s0x0:0x299dcbdb7c86a4b9!8m2!3d59.3229846!4d18.007207",
    },
    {
      name: "Mumbai Garden",
      location:
        "https://www.google.se/maps/place/Mumbai+Garden/@59.328453,18.0192362,17.22z/data=!4m5!3m4!1s0x465f77d4be8048d1:0x122e98c90a2c533d!8m2!3d59.3286346!4d18.0192211",
    },
    {
      name: "Dallas Pizza & Burgare",
      location:
        "https://www.google.se/maps/place/Dallas+Pizza+och+Burgare/@59.328812,18.0071892,16.44z/data=!4m5!3m4!1s0x465f762c11aada53:0xcc44fefc7fd1de28!8m2!3d59.3282111!4d18.0079885",
    },
    {
      name: "Essinge Tapas",
      location:
        "https://www.google.se/maps/place/Essinge+Tapas/@59.324925,18.0060011,16.44z/data=!4m5!3m4!1s0x0:0xf9d8c96ae5bb116c!8m2!3d59.3246494!4d18.0075355",
    },
    {
      name: "Wang Asia",
      location:
        "https://www.google.se/maps/place/Wang+Asia/@59.3256119,18.0080446,16.44z/data=!4m5!3m4!1s0x0:0x29cc6216afd501be!8m2!3d59.3252607!4d18.0082325",
    },
    {
      name: "Rai Sushi",
      location:
        "https://www.google.se/maps/place/Rai+Sushi/@59.3280148,18.0134488,18.33z/data=!4m5!3m4!1s0x465f77c9ad4d6bb1:0xe9c3ea0bf14e08db!8m2!3d59.3282994!4d18.0127342",
    },
    {
      name: "The Kulture",
      location:
        "https://www.google.se/maps/place/The+Kulture/@59.3302285,18.0226751,16z/data=!4m5!3m4!1s0x465f77fd47b5edbb:0xe9d340213966d70!8m2!3d59.3302282!4d18.0262551",
    },
    {
      name: "Segenäs Matsal",
      location:
        "https://www.google.se/maps/place/Segen%C3%A4s+Matsal/@59.3286344,18.0173705,17z/data=!4m5!3m4!1s0x465f77d4cfca8c5f:0xe480397bd8dfbed1!8m2!3d59.3297342!4d18.018761",
    },
    {
      name: "Restaurang Pontus",
      location:
        "https://www.google.se/maps/place/Tidningshuset+by+Pontus/@59.3272225,18.0154844,19.33z/data=!4m5!3m4!1s0x0:0xc12235f46d6e6a31!8m2!3d59.3271751!4d18.0153598",
    },
    {
      name: "Hot Sweet Thai Wok (kekabthai:en)",
      location:
        "https://www.google.se/maps/place/Hot+Sweet+Thai+Wok/@59.3254058,18.0088235,20.2z/data=!4m5!3m4!1s0x465f77dd5dc4ddfd:0x9867fe1aeda2eeeb!8m2!3d59.3254635!4d18.0089189",
    },
  ];

  const winner = lunchPlaces[Math.floor(Math.random() * Object.keys(lunchPlaces).length)];

  return await message.channel.send({
    embeds: [{ title: winner.name, description: `Today's lunch is going to be here`, url: winner.location, color: 0x05c7e9 }],
  });
};

export default lunchPicker;
