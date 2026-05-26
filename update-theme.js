const fs = require('fs');

const apps = ['Admin', 'Customer', 'Partner'];
apps.forEach(app => {
  const themePath = `./${app}/src/styles/theme.css`;
  if (fs.existsSync(themePath)) {
    let content = fs.readFileSync(themePath, 'utf8');
    
    // Replace light mode primary
    content = content.replace(/--primary:.*?;/g, '--primary: #eab308;');
    content = content.replace(/--primary-foreground:.*?;/g, '--primary-foreground: #ffffff;');
    
    fs.writeFileSync(themePath, content);
    console.log('Updated theme in ' + app);
  }
});
