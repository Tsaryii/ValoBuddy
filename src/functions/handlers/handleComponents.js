const { readdirSync } = require('fs');
module.exports = (client) => {
  client.handleComponents = async () => {
    const componentFolders = readdirSync(`./src/components`);
    for (const folder of componentFolders) {
      const componentFiles = readdirSync(`./src/components/${folder}`).filter(
        (file) => file.endsWith('.js')
      );
      const { buttons, selectMenus } = client;
      switch (folder) {
        case 'buttons':
          for (const file of componentFiles) {
            const button = require(`../../components/${folder}/${file}`);
            console.log(`Loading button: ${file}`, button); // Add this line
            if (!button.data || !button.data.name) {
              console.error(
                `Button ${file} is missing a 'data' property or 'data.name'`
              );
              continue; // Skip this button
            }
            buttons.set(button.data.name, button);
          }
          break;
        case 'selectMenus':
          for (const file of componentFiles) {
            const menu = require(`../../components/${folder}/${file}`);
            console.log(`Loading select menu: ${file}`, menu); // Add this line
            if (!menu.data || !menu.data.name) {
              console.error(
                `Select menu ${file} is missing a 'data' property or 'data.name'`
              );
              continue; // Skip this menu
            }
            selectMenus.set(menu.data.name, menu);
          }
          break;
        default:
          break;
      }
    }
  };
};
