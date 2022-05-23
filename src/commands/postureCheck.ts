import { Client, Message, TextChannel } from "discord.js";

const postureImages = [
  "https://preview.redd.it/dg7bp13xzc871.jpg?width=640&crop=smart&auto=webp&s=2404de7110ff19c45539e1bce3b849670657a517",
  "http://www.quickmeme.com/img/f4/f49d49471ecb1704c95f607f79a428b201b37176fd9441252fde24cd4dd12674.jpg",
  "https://preview.redd.it/4bkje8amisu61.png?width=960&crop=smart&auto=webp&s=57252524cf1022af9387ebf918219a74912100e4",
  "https://cloud2.spineuniverse.com/sites/default/files/imagecache/large-content/wysiwyg_imageupload/3998/2018/02/01/13328067_ML_edited.jpg",
];

const isWithinOpeningHours = () => {
  const start = 10 * 60 + 15;
  const end = 16 * 60 + 45;
  const now = new Date();
  const time = now.getHours() * 60 + now.getMinutes();
  const weekday = now.getDay() !== 6 && now.getDay() !== 0;
  console.log(
    "isWithinOpeningHours",
    weekday && time >= start && time < end,
    new Date(Date.now()).toLocaleTimeString()
  );
  return weekday && time >= start && time < end;
};

const postureInfo = async (message: Message) => {
  message.reply({
    embeds: [
      {
        fields: [
          {
            name: "Get reminded about your posture",
            value: "Opt in by typing `!posture`.",
          },
          {
            name: "Reminders are sent Mon-Fri 10:15-16:45",
            value:
              "Occurs with a 2-4h irregular interval. Opt out `!badposture`.",
          },
        ],
      },
    ],
  });
};
//
const createChannelAndRole = async (message: Message) => {
  // create channel
  await message.guild?.channels.create("posturecheck", { type: "GUILD_TEXT" });
  // create role
  await message.guild?.roles.create({
    name: "posture",
    mentionable: true,
    reason: "Created the `posture` role!",
  });

  return message.reply({
    embeds: [
      {
        description: `<@${message?.member?.user.id}> initiated posture checks on this server!`,
        fields: [
          {
            name: "You can now type `!posture` to opt in.",
            value: "Type `!postureinfo` for more info.",
          },
        ],
        color: 0xff0000,
      },
    ],
  });
};

const addMemberToPostureRole = async (message: Message, optOut?: boolean) => {
  const desiredRole = message.member?.roles.cache.find(
    (role) => role.name === "posture"
  );
  const roles = await message.guild?.roles.fetch();
  const postureRoleInGuild = roles?.find((role) => role.name === "posture");

  if (!postureRoleInGuild) {
    return await createChannelAndRole(message);
  }

  if (!desiredRole) {
    if (postureRoleInGuild) {
      await message.member?.roles.add(postureRoleInGuild);
      return message.reply({
        embeds: [
          {
            description: `<@${message?.member?.user.id}> was added to the role <@&${postureRoleInGuild.id}>!`,
            color: 0x00ff00,
          },
        ],
      });
    }
  } else if (optOut === true && postureRoleInGuild) {
    await message.member?.roles.remove(postureRoleInGuild);
    return await message.reply({
      embeds: [
        {
          description: `<@${message?.member?.user.id}> was removed from posture check!\nEnjoy your bad posture :shrimp: :rofl:`,
          color: 0xff0000,
        },
      ],
    });
  }
  return await message.reply({
    embeds: [
      {
        description: `<@${message?.member?.user.id}> you already have the role! Type \`!postureinfo\``,
        color: 0xff0000,
      },
    ],
  });
};

const postureCommand = async (client: Client) => {
  const guilds = await client.guilds.fetch();
  if (!guilds) return;
  guilds.forEach(async (guild) => {
    const g = await guild.fetch();
    g.channels.cache.forEach(async (channel) => {
      if (
        channel.type === "GUILD_TEXT" &&
        (channel as TextChannel).name.toLowerCase() === "posturecheck"
      ) {
        const roles = await g.roles.fetch();
        const postureRole = roles.find((role) => role.name === "posture");
        if (!postureRole?.id) return;
        console.log("posturerole", postureRole?.name);
        await (channel as TextChannel).send({
          embeds: [
            {
              title: `Posture Check Reminder 🪑!`,
              description: `It's time to check your <@&${postureRole?.id}>!`,
              color: 0xffa500,
              fields: [
                {
                  name: "Get reminded about your posture",
                  value: "Opt in by typing `!posture`.",
                },
                {
                  name: "Reminders are sent Mon-Fri 10:15-16:45",
                  value:
                    "Occurs with a 2-4h irregular interval.\nOpt out `!badposture`.",
                },
              ],
              image: {
                url: postureImages[
                  Math.floor(Math.random() * postureImages.length)
                ],
              },
            },
          ],
        });
      }
    });
  });

  // add randomized interval
  // post img with picture
  // make sure it doesn't post before and after workhours. maybe do @here
};

export {
  postureCommand,
  isWithinOpeningHours,
  addMemberToPostureRole,
  postureInfo,
};
