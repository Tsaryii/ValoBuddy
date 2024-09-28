// File: src/components/buttons/preferenceSelect.js

const queueUtils = require('../../utils/queueUtils');

module.exports = {
  data: {
    name: 'preference-select',
  },
  async execute(interaction, client) {
    try {
      const userId = interaction.user.id;
      const userSetup = client.usersInSetup[userId];

      if (!userSetup) {
        return interaction.reply({
          content: 'Session expired. Please start the hosting process again.',
          ephemeral: true,
        });
      }

      const [preferenceType, selectedOption] = interaction.customId.split('_');

      // Save the selected preference
      if (preferenceType === 'party-size') {
        userSetup.preferences['Party Size'] = selectedOption;
        userSetup.currentPrefStep += 1;
        // Prompt for Game Mode
        await queueUtils.promptForPreference(interaction, client, false);
      } else if (preferenceType === 'game-mode') {
        userSetup.preferences['Game Mode'] = selectedOption;
        userSetup.currentPrefStep += 1;
        // All preferences collected, create the party
        await queueUtils.createParty(interaction, client);
      }
    } catch (error) {
      console.error('Error in preference-select handler:', error);
      await interaction.reply({
        content: 'An error occurred while processing your selection.',
        ephemeral: true,
      });
    }
  },
};
