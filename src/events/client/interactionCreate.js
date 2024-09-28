// File: src/events/client/interactionCreate.js

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      // Handle slash commands
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        await interaction.reply({
          content: 'There was an error executing that command.',
          ephemeral: true,
        });
      }
    } else if (interaction.isButton()) {
      // Handle button interactions
      const [handlerName] = interaction.customId.split('_'); // e.g., 'host', 'party-size', 'game-mode'

      let button = client.buttons.get(handlerName);

      // Special handling for 'host-queue' as the entire customId is 'host-queue'
      if (!button && interaction.customId === 'host-queue') {
        button = client.buttons.get('host-queue');
      }

      // If not found yet, and handlerName matches a category, map to 'preference-select'
      if (!button && ['party-size', 'game-mode'].includes(handlerName)) {
        button = client.buttons.get('preference-select');
      }

      if (!button) {
        console.error(`No button handler found for customId: ${interaction.customId}`);
        await interaction.reply({
          content: 'An error occurred while processing your selection.',
          ephemeral: true,
        });
        return;
      }

      try {
        await button.execute(interaction, client);
      } catch (error) {
        console.error('Error executing button interaction:', error);
        await interaction.reply({
          content: 'An error occurred while executing the button action.',
          ephemeral: true,
        });
      }
    } else if (interaction.isStringSelectMenu()) {
      // Handle select menu interactions (if any)
      const menu = client.selectMenus.get(interaction.customId);
      if (!menu) {
        console.error(`No select menu handler found for customId: ${interaction.customId}`);
        return;
      }

      try {
        await menu.execute(interaction, client);
      } catch (error) {
        console.error('Error executing select menu interaction:', error);
        await interaction.reply({
          content: 'An error occurred while executing the select menu action.',
          ephemeral: true,
        });
      }
    }
    // Handle other interaction types if necessary
  },
};
