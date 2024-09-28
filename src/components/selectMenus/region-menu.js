module.exports = {
    data: {
      name: `region-menu`,
    },
    async execute(interaction, client) {
      console.log("Region Menu Click Detected");
  
      // Get the selected value (e.g., NA, EU, OCE)
      const selectedRegion = interaction.values[0];
  
      // Define roles based on selected region
      const roles = {
        NA: '1283888521337245780',  // Replace with the actual role ID for NA
        EU: '1283888536721821790',  // Replace with the actual role ID for EU
        OCE: '1283888553855811614', // Replace with the actual role ID for OCE
      };
  
      // Get the corresponding role ID
      const roleId = roles[selectedRegion];
  
      // Get the member from the interaction
      const member = interaction.guild.members.cache.get(interaction.user.id);
  
      // Check if the user already has any of the region roles and remove it
      const regionRoles = Object.values(roles); // Array of all region role IDs
      const memberRoles = member.roles.cache;
  
      let removedRole = null;
      
      for (const role of regionRoles) {
        if (memberRoles.has(role)) {
          // If the user has one of the region roles, remove it
          await member.roles.remove(role);
          removedRole = role; // Track which role was removed
        }
      }
  
      if (!roleId) {
        return interaction.reply({
          content: `No role found for the selected region.`,
          ephemeral: true
        });
      }
  
      // Assign the new role to the user
      try {
        await member.roles.add(roleId);
        await interaction.reply({
          content: `You have been assigned the role for the ${selectedRegion} region.` +
                   (removedRole ? ` Previous region role was removed.` : ''),
          ephemeral: true
        });
      } catch (error) {
        console.error('Error assigning role:', error);
        await interaction.reply({
          content: `There was an error assigning your role. Please try again later.`,
          ephemeral: true
        });
      }
    },
  };
  