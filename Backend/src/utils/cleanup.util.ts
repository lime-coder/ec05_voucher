import fs from 'fs';
import path from 'path';

export const cleanupTempUploads = () => {
  const tempDir = path.join(process.cwd(), 'uploads', 'temp');
  
  if (!fs.existsSync(tempDir)) {
    return;
  }

  // 2 hours in milliseconds
  const MAX_AGE = 2 * 60 * 60 * 1000;
  const now = Date.now();

  fs.readdir(tempDir, (err, files) => {
    if (err) {
      console.error('Error reading temp uploads directory:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(tempDir, file);
      
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats for file ${file}:`, err);
          return;
        }

        const age = now - stats.mtimeMs;
        if (age > MAX_AGE) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error deleting old temp file ${file}:`, err);
            } else {
              console.log(`Deleted orphaned temp file: ${file}`);
            }
          });
        }
      });
    });
  });
};
