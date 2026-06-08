import fs from 'fs';
import path from 'path';

const searchDir = path.join(__dirname, 'src');

const replacements = [
  { regex: /TrangThaiDonHang\s*:\s*['"`]COMPLETED['"`]/g, replacement: "TrangThaiDonHang: 'Hoàn tất'" },
  { regex: /TrangThaiDonHang\s*===?\s*['"`]COMPLETED['"`]/g, replacement: "TrangThaiDonHang === 'Hoàn tất'" },
  { regex: /TrangThaiDonHang\s*:\s*['"`]CANCELLED['"`]/g, replacement: "TrangThaiDonHang: 'Đã hủy'" },
  { regex: /TrangThaiDonHang\s*===?\s*['"`]CANCELLED['"`]/g, replacement: "TrangThaiDonHang === 'Đã hủy'" },
];

function processDirectory(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(searchDir);
console.log('Replacement 2 complete.');
