module.exports = {
  data: {
    name: `region`,
  },
  async execute(interaction, client) {
    console.log("Region Button  Clicked");
    await interaction.reply({
      content: "Input REgion Data here",
    });
  },
};
