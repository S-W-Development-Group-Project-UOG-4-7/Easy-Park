const { spawn } = require('child_process'); 
const port = 3101; 
const proc = spawn('npm', ['run', 'dev', '--', '--port', String(port)], { shell: true, stdio: ['ignore', 'pipe', 'pipe'] }); 
let ready = false; 
let all = ''; 
function log(s){ process.stdout.write(s); all += s; } 
proc.stdout.on('data', d => { const s=d.toString(); log(s); if (!ready && s.toLowerCase().includes('ready')) run().catch(fail); }); 
proc.stderr.on('data', d => log(d.toString())); 
proc.on('exit', c => { if (!ready) { console.log('\nDEV_EXIT_BEFORE_READY', c); process.exit(1); } }); 
async function run(){ ready = true; await new Promise(r => setTimeout(r, 1200)); const email = `e2e_${Date.now()}@example.com`; const password='Temp1234!'; 
const signUpRes = await fetch(`http://localhost:${port}/api/auth/sign-up`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ fullName:'E2E User', email, password })}); 
const signUpJson = await signUpRes.json().catch(()=>({})); console.log('SIGNUP', signUpRes.status, signUpJson); 
const mixed = email.replace('e2e_','E2E_'); 
const signInRes = await fetch(`http://localhost:${port}/api/auth/sign-in`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ email:mixed, password })}); 
const signInJson = await signInRes.json().catch(()=>({})); console.log('SIGNIN', signInRes.status, signInJson); 
cleanup(signInRes.status === 200 && signUpRes.status === 200 ? 0 : 2); } 
function fail(e){ console.error('E2E_ERR', e); cleanup(3); } 
function cleanup(code){ try{ proc.kill(); }catch{} setTimeout(() => process.exit(code), 500); } 
