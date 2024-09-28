// File: src/commands/tools/queue.js

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const queueUtils = require('../../utils/queueUtils');

const usersFilePath = path.resolve(__dirname, '../../../user.json');
const initConfigPath = path.resolve(__dirname, '../../../initConfig.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription("Enter into the user's queue"),

  async execute(interaction, client) {
    const guild = interaction.guild;
    const member = interaction.member;

    // Load the initConfig.json file
    if (!fs.existsSync(initConfigPath)) {
      return interaction.reply({
        content: 'The bot has not been initialized. Please run /init first.',
        ephemeral: true,
      });
    }
    const initConfig = JSON.parse(fs.readFileSync(initConfigPath, 'utf8'));

    // Load users.json
    let users = {};
    if (fs.existsSync(usersFilePath)) {
      users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    }

    const userId = interaction.user.id;

    // Check if user is already in queue
    if (users[userId] && users[userId].InQueue) {
      // User is already in queue
      await showInQueueEmbed(interaction, client, users[userId]);
      return;
    }

    // Categories to check: Region, Age, Gender
    const categories = ['Region', 'Age', 'Gender'];

    // Roles that the user needs to select
    const rolesToSelect = [];

    for (const category of categories) {
      const hasRole = member.roles.cache.some(role =>
        Object.values(initConfig[category]).includes(role.id)
      );
      if (!hasRole) {
        rolesToSelect.push(category);
      }
    }

    if (rolesToSelect.length > 0) {
      // Start the role selection process
      client.usersInSetup = client.usersInSetup || {};
      client.usersInSetup[interaction.user.id] = {
        rolesToSelect,
        initConfig,
        currentStep: 0,
      };

      await queueUtils.promptForRole(interaction, client, true); // initial = true
    } else {
      // Proceed to temporary preferences
      client.usersInSetup = client.usersInSetup || {};
      client.usersInSetup[interaction.user.id] = {
        preferences: {},
        currentPrefStep: 0,
      };

      await queueUtils.promptForPreference(interaction, client, true);
    }
  },
};

async function showInQueueEmbed(interaction, client, userData) {
  const queueEntryTime = userData.QueueEntryTime;
  const timeInQueue = `<t:${queueEntryTime}:R>`;

  const embed = new EmbedBuilder()
    .setTitle('You are already in the queue')
    .setDescription('Would you like to exit the queue or edit your preferences?')
    .addFields(
      { name: 'Your Data', value: formatData(userData.UserData), inline: true },
      {
        name: 'Your Preferences',
        value: formatData(userData.currentQueue.QueueSettings),
        inline: true,
      }
    )
    .setColor('#FFA500');

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('exit-queue')
      .setLabel('Exit Queue')
      .setStyle(ButtonStyle.Danger),
  );

  await interaction.reply({
    embeds: [embed],
    components: [buttons],
    ephemeral: true,
  });
}

function formatData(data) {
  return Object.entries(data)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `**${key}**: ${value.join(', ')}`;
      } else {
        return `**${key}**: ${value}`;
      }
    })
    .join('\n');
}
