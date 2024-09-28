// File: src/components/selectMenus/roleSelect.js

const queueUtils = require('../../utils/queueUtils');

module.exports = {
  data: {
    name: 'role-select',
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

    const { rolesToSelect, initConfig, currentStep } = userSetup;
    const category = rolesToSelect[currentStep];
    const selectedOption = interaction.values[0];
    const roleId = initConfig[category][selectedOption];

    // Assign the role
    try {
      // Remove existing roles in the category
      const rolesToRemove = Object.values(initConfig[category]);
      await interaction.member.roles.remove(rolesToRemove);

      // Add the new role
      await interaction.member.roles.add(roleId);

      await interaction.update({
        content: `You have been assigned the ${category}: ${selectedOption} role.`,
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
    } catch (error) {
      console.error('Error assigning role:', error);
      await interaction.update({
        content: `There was an error assigning your ${category} role. Please try again later.`,
        components: [],
        embeds: [],
        ephemeral: true,
      });
    }

    // Proceed to the next role selection
    userSetup.currentStep += 1;
    await queueUtils.promptForRole(interaction, client, false); // Pass initial = false
  },
};
