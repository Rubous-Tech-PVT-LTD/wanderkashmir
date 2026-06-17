const fs = require('fs');
const file = 'c:/Users/hp/.gemini/antigravity-ide/scratch/wanderkashmir/src/app/wander-admin/AdminDashboardClient.tsx';
let content = fs.readFileSync(file, 'utf8');
const startIdx = content.indexOf("const w = window.open('', '_blank');");
const endIdx = content.indexOf("setTimeout(() => w.print(), 500);");
if (startIdx !== -1 && endIdx !== -1) {
  const before = content.substring(0, startIdx);
  const target = content.substring(startIdx, endIdx);
  const after = content.substring(endIdx);
  const fixedTarget = target.replace(/\\\$\{/g, '${');
  fs.writeFileSync(file, before + fixedTarget + after);
  console.log('Fixed interpolation strings.');
} else {
  console.log('Indices not found.');
}
