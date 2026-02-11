const fs=require('fs'); 
const path=require('path'); 
const root=process.cwd(); 
const ex={node_modules:1,'.next':1,generated:1,'.git':1}; 
const exts={'.ts':1,'.tsx':1,'.js':1,'.jsx':1,'.mjs':1,'.cjs':1,'.prisma':1}; 
const pats=['prisma.','PrismaClient','generated/prisma','@prisma/client','db.']; 
function hasPat(c){for(let i=0;i<pats.length;i++){if(c.indexOf(pats[i])!==-1)return true;}return false;} 
function walk(d){const arr=fs.readdirSync(d,{withFileTypes:true});for(let i=0;i<arr.length;i++){const e=arr[i];if(ex[e.name])continue;const p=path.join(d,e.name);if(e.isDirectory())walk(p);else{const ext=path.extname(e.name);if(exts[ext]){const c=fs.readFileSync(p,'utf8');if(hasPat(c))console.log(path.relative(root,p));}}}} 
walk(root); 
