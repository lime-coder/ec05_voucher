const fs = require('fs');
['Admin', 'Customer', 'Partner'].forEach(app => {
  const file = './' + app + '/src/styles/theme.css';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('@source')) {
      content = '@source "../../packages/ui/src";\n' + content;
      fs.writeFileSync(file, content);
      console.log('Added @source to ' + file);
    }
  }
});
