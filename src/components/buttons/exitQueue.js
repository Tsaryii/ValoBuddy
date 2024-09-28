// File: src/components/buttons/exitQueue.js

const fs = require('fs');
const path = require('path');
const { ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
  data: {
    name: 'exit-queue',
  },
  async execute(interaction, client) {
    const usersFilePath = path.resolve(__dirname, '../../../user.json');
    let users = {};

    if (fs.existsSync(usersFilePath)) {
      users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    }

    const userId = interaction.user.id;

    //delete the category and applications channel from the user


    let applicationsChannelId = users[userId].ApplicationsChannel;
    let PartyCategoryId = users[userId].PartyCategory;
    let VCId = users[userId].PartyVC;


    console.log("applicationsChannelId: ", applicationsChannelId);
    console.log("PartyCategoryId: ", PartyCategoryId);
    console.log("VCId: ", VCId);

    let PartyCategory = interaction.guild.channels.cache.find(c => c.id === PartyCategoryId);
    let applicationsChannel = interaction.guild.channels.cache.find((c) => c.id === applicationsChannelId);
    let VC = interaction.guild.channels.cache.find((c) => c.id === VCId);

    console.log("PartyCategory: ", PartyCategory);
    console.log("applicationsChannel: ", applicationsChannel);
    console.log("VC: ", VC);

    try{
    await PartyCategory.delete();
    await applicationsChannel.delete();
    await VC.delete();
    }catch(error){
      console.error("Error deleting channels:", error);
    }



    if (users[userId]) {
      users[userId].InQueue = false;
      users[userId].QueueEntryTime = null;
      users[userId].PartyCategory = null;
      users[userId].PartyVC = null;
      users[userId].ApplicationsChannel = null;
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    }
    



    await interaction.update({
      content: 'You have exited the queue.',
      embeds: [],
      components: [],
      ephemeral: true,
    });
  },
};
