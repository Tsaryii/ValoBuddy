// File: src/components/buttons/editPreferences.js

const queueUtils = require('../../utils/queueUtils');

module.exports = {
  data: {
    name: 'edit-preferences',
  },
  async execute(interaction, client) {
    // Start the preference selection process again
    client.usersInSetup = client.usersInSetup || {};
    client.usersInSetup[interaction.user.id] = {
      preferences: {},
      currentPrefStep: 0,
    };

    // Defer the interaction update to acknowledge it
    await interaction.deferUpdate();

    // Proceed to prompt for preferences
    await queueUtils.promptForPreference(interaction, client, false);
  },
};
