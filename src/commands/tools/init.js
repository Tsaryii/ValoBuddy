// File: src/commands/init.js

const { SlashCommandBuilder, ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const initConfigPath = path.resolve(__dirname, '../../../initConfig.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('init')
    .setDescription('Initialize roles for Region, Age, Gender, and set up the Queue system'),

  async execute(interaction, client) {
    // 1. Check if the user has Administrator permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: 'You do not have permission to run this command.',
        ephemeral: true,
      });
    }

    // 2. Initialize configuration object
    let config = {};

    // 3. Load existing configuration if available
    if (fs.existsSync(initConfigPath)) {
      try {
        config = JSON.parse(fs.readFileSync(initConfigPath, 'utf8'));
        console.log('Existing configuration loaded.');
      } catch (error) {
        console.error('Error reading initConfig.json:', error);
        return interaction.reply({
          content: 'Failed to read existing configuration. Please ensure initConfig.json is valid.',
          ephemeral: true,
        });
      }
    }

    // 4. Define the role categories and their options
    const roleCategories = {
      Region: ['NA', 'EU', 'LATAM', 'BR', 'KR', 'AP'],
    };

    try {
      // 5. Create or retrieve the Category Channel
      const categoryName = 'LFG'; // Customize as needed
      let categoryChannel;

      if (config.Category) {
        // Attempt to fetch the category by ID from config
        categoryChannel = interaction.guild.channels.cache.get(config.Category);
        if (!categoryChannel || categoryChannel.type !== ChannelType.GuildCategory) {
          console.warn(`Category ID ${config.Category} not found or is not a category. Creating a new category.`);
          categoryChannel = null;
        }
      }

      if (!categoryChannel) {
        // Check if a category with the desired name already exists
        categoryChannel = interaction.guild.channels.cache.find(
          (c) => c.name === categoryName && c.type === ChannelType.GuildCategory
        );

        if (!categoryChannel) {
          // Create the category since it doesn't exist
          categoryChannel = await interaction.guild.channels.create({
            name: categoryName,
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
              {
                id: interaction.guild.id, // @everyone role
                deny: [PermissionsBitField.Flags.ViewChannel],
              },
            ],
            reason: 'Created LFG category for organizing Queue system channels.',
          });
          console.log(`Category created: ${categoryChannel.name} (${categoryChannel.id})`);
        } else {
          console.log(`Category found: ${categoryChannel.name} (${categoryChannel.id})`);
        }

        // Update the config with the category ID
        config.Category = categoryChannel.id;
      } else {
        console.log(`Using existing category: ${categoryChannel.name} (${categoryChannel.id})`);
      }

      // 6. Create or retrieve the 'looking-for-group' Channel under the Category
      const queueChannelName = 'looking-for-group';
      let queueChannel;

      if (config.QueueChannel) {
        // Attempt to fetch the queue channel by ID from config
        queueChannel = interaction.guild.channels.cache.get(config.QueueChannel);
        if (!queueChannel || queueChannel.type !== ChannelType.GuildText || queueChannel.parentId !== categoryChannel.id) {
          console.warn(`Queue Channel ID ${config.QueueChannel} not found or mismatched. Creating a new queue channel.`);
          queueChannel = null;
        }
      }

      if (!queueChannel) {
        // Check if a queue channel with the desired name already exists under the category
        queueChannel = interaction.guild.channels.cache.find(
          (c) => c.name === queueChannelName && c.parentId === categoryChannel.id && c.type === ChannelType.GuildText
        );

        if (!queueChannel) {
          // Create the queue channel since it doesn't exist
          queueChannel = await interaction.guild.channels.create({
            name: queueChannelName,
            type: ChannelType.GuildText,
            parent: categoryChannel.id,
            permissionOverwrites: [
              {
                id: interaction.guild.id, // @everyone role
                deny: [PermissionsBitField.Flags.ViewChannel],
              },
              {
                id: interaction.user.id, // Host user
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ManageChannels,
                ],
              },
            ],
            reason: 'Created looking-for-group channel under LFG category.',
          });
          console.log(`Queue channel created: ${queueChannel.name} (${queueChannel.id})`);
        } else {
          console.log(`Queue channel found: ${queueChannel.name} (${queueChannel.id})`);
        }

        // Update the config with the queue channel ID
        config.QueueChannel = queueChannel.id;
      } else {
        console.log(`Using existing queue channel: ${queueChannel.name} (${queueChannel.id})`);
      }

      // 7. Create or retrieve the 'host-a-party' Channel under the Category
      const hostChannelName = 'host-a-party';
      let hostChannel;

      if (config.HostChannel) {
        // Attempt to fetch the host channel by ID from config
        hostChannel = interaction.guild.channels.cache.get(config.HostChannel);
        if (!hostChannel || hostChannel.type !== ChannelType.GuildText || hostChannel.parentId !== categoryChannel.id) {
          console.warn(`Host Channel ID ${config.HostChannel} not found or mismatched. Creating a new host channel.`);
          hostChannel = null;
        }
      }

      if (!hostChannel) {
        // Check if a host channel with the desired name already exists under the category
        hostChannel = interaction.guild.channels.cache.find(
          (c) => c.name === hostChannelName && c.parentId === categoryChannel.id && c.type === ChannelType.GuildText
        );

        if (!hostChannel) {
          // Create the host channel since it doesn't exist
          hostChannel = await interaction.guild.channels.create({
            name: hostChannelName,
            type: ChannelType.GuildText,
            parent: categoryChannel.id,
            permissionOverwrites: [
              {
                id: interaction.guild.id, // @everyone role
                deny: [PermissionsBitField.Flags.ViewChannel],
              },
              {
                id: interaction.user.id, // Host user
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ManageChannels,
                ],
              },
            ],
            reason: 'Created host-a-party channel under LFG category.',
          });
          console.log(`Host channel created: ${hostChannel.name} (${hostChannel.id})`);
        } else {
          console.log(`Host channel found: ${hostChannel.name} (${hostChannel.id})`);
        }

        // Update the config with the host channel ID
        config.HostChannel = hostChannel.id;
      } else {
        console.log(`Using existing host channel: ${hostChannel.name} (${hostChannel.id})`);
      }

      // 8. Create or retrieve Roles for Each Category
      for (const [category, options] of Object.entries(roleCategories)) {
        config[category] = config[category] || {};

        for (const option of options) {
          if (config[category][option]) {
            // Attempt to fetch the role by ID from config
            let role = interaction.guild.roles.cache.get(config[category][option]);
            if (!role || role.name !== `${category}: ${option}`) {
              console.warn(`Role ID ${config[category][option]} for ${category}: ${option} not found or mismatched. Creating a new role.`);
              role = null;
            }

            if (!role) {
              // Check if the role with the desired name already exists
              role = interaction.guild.roles.cache.find(r => r.name === `${category}: ${option}`);
              if (!role) {
                // Create the role since it doesn't exist
                role = await interaction.guild.roles.create({
                  name: `${category}: ${option}`,
                  mentionable: false,
                  reason: `Created ${category} role for queue system`,
                });
                console.log(`Role created: ${role.name} (${role.id})`);
              } else {
                console.log(`Role found: ${role.name} (${role.id})`);
              }

              // Update the config with the role ID
              config[category][option] = role.id;
            } else {
              console.log(`Using existing role: ${role.name} (${role.id})`);
            }
          } else {
            // No role ID stored in config; attempt to find or create the role
            let role = interaction.guild.roles.cache.find(r => r.name === `${category}: ${option}`);
            if (!role) {
              // Create the role since it doesn't exist
              role = await interaction.guild.roles.create({
                name: `${category}: ${option}`,
                mentionable: false,
                reason: `Created ${category} role for queue system`,
              });
              console.log(`Role created: ${role.name} (${role.id})`);
            } else {
              console.log(`Role found: ${role.name} (${role.id})`);
            }

            // Update the config with the role ID
            config[category][option] = role.id;
          }
        }
      }

      // 9. Save the updated configuration to initConfig.json
      try {
        fs.writeFileSync(initConfigPath, JSON.stringify(config, null, 2));
        console.log('Configuration saved to initConfig.json');
      } catch (error) {
        console.error('Error writing to initConfig.json:', error);
        return interaction.reply({
          content: 'Initialization completed, but failed to save the configuration.',
          ephemeral: true,
        });
      }

      // 10. Post an Embed with the `host` Button in the 'host-a-party' Channel
      try {
        const hostEmbed = new EmbedBuilder()
          .setTitle('Host a Party')
          .setDescription('Click the button below to host a new party and enter the queue.')
          .setColor('#00AAFF');

        const hostButton = new ButtonBuilder()
          .setCustomId('host-queue')
          .setLabel('Host')
          .setStyle(ButtonStyle.Primary);

        const actionRow = new ActionRowBuilder().addComponents(hostButton);

        hostChannel.send({
          embeds: [hostEmbed],
          components: [actionRow],
        });

        console.log('Host embed with button sent to host-a-party channel.');
      } catch (error) {
        console.error('Error sending host embed:', error);
        // Optionally, notify the user but ensure only one reply is sent
        // await interaction.followUp({
        //   content: 'Initialization complete, but failed to send the host embed.',
        //   ephemeral: true,
        // });
      }

      // 11. Respond to the user with the initialization summary
      await interaction.reply({
        content: `Initialization complete.\nRoles have been created or verified, IDs stored, and Queue system set up with category <#${categoryChannel.id}> and channels <#${queueChannel.id}> and <#${hostChannel.id}>.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error during initialization:', error);
      await interaction.reply({
        content: 'An error occurred during the initialization process.',
        ephemeral: true,
      });
    }
  },
};
