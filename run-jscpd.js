import { execSync } from 'child_process';
try {
  console.log(execSync('npx jscpd Frontend/src/app --threshold 20 --reporters console', { encoding: 'utf8' }));
} catch (e) {
  console.log(e.stdout);
  console.error(e.stderr);
}
