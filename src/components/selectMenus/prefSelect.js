// File: src/components/selectMenus/prefSelect.js

const queueUtils = require('../../utils/queueUtils');

module.exports = {
  data: {
    name: 'pref-select',
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
        name: 'Preferred Age Range',
        options: ageOptions,
        minValues: 1,
        maxValues: ageOptions.length,
      },
      {
        name: 'Preferred Gender',
        options: genderOptions,
        minValues: 1,
        maxValues: genderOptions.length,
      },
      {
        name: 'Party Size',
        options: partySizeOptions,
        minValues: 1,
        maxValues: partySizeOptions.length,
      },
    ];

    const pref = preferencesList[currentPrefStep];
    preferences[pref.name] = interaction.values;

    await interaction.update({
      content: `You have selected: ${pref.name} - ${interaction.values.join(', ')}`,
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
