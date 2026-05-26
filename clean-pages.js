const fs = require('fs');
const path = require('path');
const pagesDir = './Customer/src/app/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const p = path.join(pagesDir, file);
  let content = fs.readFileSync(p, 'utf8');
  
  // Remove Navbar imports
  content = content.replace(/import \{ Navbar \} from ['"].*?['"];\n?/g, '');
  // Remove Footer imports
  content = content.replace(/import \{ Footer \} from ['"].*?['"];\n?/g, '');
  
  // Remove <Navbar ... /> tags (including self-closing)
  content = content.replace(/<Navbar[^>]*\/>\n?/g, '');
  
  // Remove <Footer ... /> tags
  content = content.replace(/<Footer[^>]*\/>\n?/g, '');
  
  fs.writeFileSync(p, content);
  console.log('Stripped layouts from ' + file);
});
