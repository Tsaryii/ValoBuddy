// File: src/utils/queueUtils.js

const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');

// Define a single, consistent path for user.json
const usersFilePath = path.resolve(__dirname, '../../user.json');

module.exports = {

  /**
   * Prompt the user to select their preferences.
   * @param {Interaction} interaction - The interaction object.
   * @param {Client} client - The Discord client.
   * @param {Boolean} initial - Whether this is the initial prompt.
   */
  async promptForPreference(interaction, client, initial = true) {
    const userId = interaction.user.id;
    const userSetup = client.usersInSetup[userId];
    const { preferences, currentPrefStep } = userSetup;

    const preferencesList = [
      {
        name: 'Party Size',
        options: ['Duo', 'Trio', '5-Stack'],
        customId: 'party-size',
      },
      {
        name: 'Game Mode',
        options: ['Unrated', 'Competitive'],
        customId: 'game-mode',
      },
    ];

    if (currentPrefStep >= preferencesList.length) {
      // All preferences collected, proceed to create the party
      await this.createParty(interaction, client);
      return;
    }

    const pref = preferencesList[currentPrefStep];

    // Create buttons for the current preference
    const buttons = new ActionRowBuilder().addComponents(
      pref.options.map(option => 
        new ButtonBuilder()
          .setCustomId(`${pref.customId}_${option}`)
          .setLabel(option)
          .setStyle(ButtonStyle.Primary)
      )
    );

    const embed = new EmbedBuilder()
      .setTitle(`Select Your ${pref.name}`)
      .setDescription(`Please select your preferred ${pref.name.toLowerCase()}.`)
      .setColor('#00AAFF');

    if (initial) {
      await interaction.reply({
        embeds: [embed],
        components: [buttons],
        ephemeral: true,
      });
    } else {
      await interaction.update({
        embeds: [embed],
        components: [buttons],
      });
    }
  },

  /**
   * Create the party after collecting preferences.
   * @param {Interaction} interaction - The interaction object.
   * @param {Client} client - The Discord client.
   */
  async createParty(interaction, client) {
    const userId = interaction.user.id;
    const userSetup = client.usersInSetup[userId];
    const { preferences } = userSetup;

    // Implement your party creation logic here
    // For example: Create channels, assign roles, etc.

    // Example: Send a confirmation message
    const embed = new EmbedBuilder()
      .setTitle('Party Created!')
      .setDescription(`Your party has been created with the following preferences:\n\n**Party Size:** ${preferences['Party Size']}\n**Game Mode:** ${preferences['Game Mode']}`)
      .setColor('#00FF00');
    const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('exit-queue')
      .setLabel('Exit Queue')
      .setStyle(ButtonStyle.Danger),
  );

    // Use deferUpdate to acknowledge the interaction before sending follow-up
    await interaction.deferUpdate();
    await interaction.followUp({
      embeds: [embed],
      components: [buttons],
      ephemeral: true,
    });

    // Create a category for the party
    const guild = interaction.guild;
    const partySize = preferences['Party Size'];
    const gameMode = preferences['Game Mode'];                      
    const channelName = `${interaction.user.username}'s Party - ${partySize} - ${gameMode}`;
    const everyoneRole = guild.roles.cache.find(r => r.name === '@everyone');         
    let UserCat; 
    let applicationsChannel;
    let partyVC;

    try {
      UserCat = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: everyoneRole.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel]
          },
        ],
      });

      console.log("UserCat created: ", UserCat);

      // Create an applications channel for the party
      applicationsChannel = await guild.channels.create({
        name: 'applications',
        type: ChannelType.GuildText,
        parent: UserCat.id,
        permissionOverwrites: [
          {
            id: everyoneRole.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel]
          },
        ],
      });


      // Create a voice channel for the party
      // set a limit of 5 users for the voice channel
      partyVC = await guild.channels.create({
        name: 'Party VC',
        type: ChannelType.GuildVoice,
        parent: UserCat.id,
        permissionOverwrites: [
          {
            id: everyoneRole.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel]
          },
        ],
      });

      // dm the user and tell them where they can join the voice
      try{
        await interaction.user.send(`👋 Your party has been created, join the vc here: ${partyVC} \n\n 📋 You can view all applications here: ${applicationsChannel}`);

      }catch(error){console.log("Error moving user to voice channel: ", error);}

      applicationsChannel.send(`${interaction.user.username} you can view all the applications to your party here.`);

      console.log("Applications channel created: ", applicationsChannel);
    } catch (error) {
      console.error("Error creating channels:", error);
    }

    // Load users.json
    let users = {};
    if (fs.existsSync(usersFilePath)) {
      try {
        const data = fs.readFileSync(usersFilePath, 'utf8');
        users = JSON.parse(data);
      } catch (error) {
        console.error("Error reading user.json:", error);
        await interaction.followUp({
          content: 'There was an error accessing your user data. Please contact an administrator.',
          ephemeral: true,
        });
        return;
      }
    } else {
      console.log("user.json does not exist. Creating a new one.");
      users = {};
    }

    // Ensure user entry exists
    if (!users[userId]) {
      console.log("User not found in user.json. Creating a new entry.");
      users[userId] = {}; // Initialize user data
    }

    // Update user data
    users[userId].InQueue = true;
    users[userId].PartyCategory = UserCat.id;
    users[userId].ApplicationsChannel = applicationsChannel.id;
    users[userId].PartyVC = partyVC.id;
    users[userId].QueueEntryTime = new Date().toISOString();

    // Write back to user.json
    try {
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
      console.log(`Updated user.json for user ${userId}`);
    } catch (error) {
      console.error("Error writing to user.json:", error);
      await interaction.followUp({
        content: 'There was an error saving your party data. Please contact an administrator.',
        ephemeral: true,
      });
      return;
    }

    // Clean up the user setup
    delete client.usersInSetup[userId];
  },
};
