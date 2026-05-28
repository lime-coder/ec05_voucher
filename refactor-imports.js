const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('Frontend/src/app');

let totalReplaced = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Match `import { A, B } from "../components/ui/xyz"`
  // or `import { A } from "@/app/admin/components/ui/xyz"`
  const regex = /import\s+({[^}]+})\s+from\s+['"](?:[.\/]|@\/).*?components\/ui\/[^'"]+['"];?/g;
  
  if (regex.test(content)) {
    const newContent = content.replace(regex, 'import $1 from "@voucherhub/ui";');
    fs.writeFileSync(file, newContent, 'utf8');
    totalReplaced++;
  }
});

console.log(`Updated imports in ${totalReplaced} files.`);
