// File: src/components/buttons/skipPreference.js

const queueUtils = require('../../utils/queueUtils');

module.exports = {
  data: {
    name: 'skip-preference',
  },
  async execute(interaction, client) {
    const userId = interaction.user.id;
    const userSetup = client.usersInSetup[userId];

    if (!userSetup) {
      return interaction.reply({
        content: 'Session expired. Please run /queue again.',
        ephemeral: true,
      });
    }

    const { preferences, currentPrefStep } = userSetup;

    // Get options using functions
    const serverOptions = queueUtils.getServerOptions(interaction.member);
    const ageOptions = queueUtils.getAgeOptions();
    const genderOptions = queueUtils.getGenderOptions();
    const partySizeOptions = queueUtils.getPartySizeOptions();

    const preferencesList = [
      {
        name: 'Server',
        options: serverOptions,
        minValues: 1,
        maxValues: serverOptions.length,
      },
      {
        name: 'Party Size',
        options: partySizeOptions,
        minValues: 1,
        maxValues: partySizeOptions.length,
      },
    ];

    const pref = preferencesList[currentPrefStep];

    // Select all options for the current preference
    preferences[pref.name] = pref.options;

    // Update the interaction
    await interaction.update({
      content: `You have selected all options for ${pref.name}.`,
      components: [],
      embeds: [],
      ephemeral: true,
    });

    // Set a timeout to edit the reply and remove the content after 1 second
    setTimeout(async () => {
        try {
        await interaction.deleteReply();
        } catch (error) {
        console.error('Error editing reply:', error);
        }
    }, 2000);
    
    // Proceed to the next preference
    userSetup.currentPrefStep += 1;
    await queueUtils.promptForPreference(interaction, client, false);
  },
};
