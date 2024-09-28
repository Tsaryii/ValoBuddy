// File: src/components/buttons/hostQueue.js

const path = require('path'); // Import path
const fs = require('fs'); // Import fs
const queueUtils = require('../../utils/queueUtils'); // Import queueUtils

const usersFilePath = path.resolve(__dirname, '../../../user.json');
const initConfigPath = path.resolve(__dirname, '../../../initConfig.json');

module.exports = {
  data: {
    name: 'host-queue', // Ensure this matches the customId of the button
  },
  async execute(interaction, client) {
    const userId = interaction.user.id;

    // get the command queue.js from the client
    const command = client.commands.get('queue');
    command.execute(interaction, client);
  },
};
