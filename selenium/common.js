// Shared helpers: driver creation, assertions, PASS/FAIL logging, screenshots.
const {Builder,Browser,By,until}=require('selenium-webdriver');
const fs=require('fs');const path=require('path');
const BASE='http://127.0.0.1:5000';
const LOGS=path.join(__dirname,'logs'),SHOTS=path.join(__dirname,'screenshots');
fs.mkdirSync(LOGS,{recursive:true});fs.mkdirSync(SHOTS,{recursive:true});

// Chrome shows a "password found in a data breach" popup for the demo passwords, which can swallow clicks.
// Disable the password manager / leak detection so the popup never appears during automation.
async function newDriver(){
  const chrome=require('selenium-webdriver/chrome');
  const opts=new chrome.Options();
  opts.setUserPreferences({credentials_enable_service:false,'profile.password_manager_enabled':false,
    'profile.password_manager_leak_detection':false});
  opts.addArguments('--disable-features=PasswordLeakDetection,PasswordCheck,SafetyCheckPasswordsModule','--disable-save-password-bubble','--no-first-run');
  return new Builder().forBrowser(Browser.CHROME).setChromeOptions(opts).build();
}
async function shot(driver,name){
  fs.writeFileSync(path.join(SHOTS,name+'.png'),await driver.takeScreenshot(),'base64');}
async function login(driver,u,p){
  await driver.get(BASE+'/login');
  await driver.findElement(By.id('username')).sendKeys(u);
  await driver.findElement(By.id('password')).sendKeys(p);
  await driver.findElement(By.id('loginBtn')).click();
}
async function flashText(driver){
  const el=await driver.wait(until.elementLocated(By.id('flash')),5000);
  return (await el.getText()).trim();
}
async function apiCopies(id){const r=await fetch(`${BASE}/api/books/${id}`);return (await r.json()).copies;}

// Runs one test: fn returns {expected,actual,ok}. Records PASS/FAIL; screenshot on request or on failure.
class Suite{
  constructor(name){this.name=name;this.rows=[];}
  async run(driver,id,desc,fn,opts={}){
    let expected='',actual='',ok=false;
    try{({expected,actual,ok}=await fn());}
    catch(e){expected=expected||'(no exception)';actual='Exception: '+e.message.split('\n')[0];ok=false;}
    const status=ok?'PASS':'FAIL';
    console.log(`${id} ${status} | ${desc} | expected="${expected}" actual="${actual}"`);
    this.rows.push([id,desc,expected,actual,status]);
    if(opts.shot||!ok){try{await shot(driver,opts.shot||(id+'_FAIL'));}catch(_){}}
  }
  save(){
    const esc=x=>'"'+String(x).replace(/"/g,'""')+'"';
    fs.writeFileSync(path.join(LOGS,this.name+'_results.csv'),
      'Test ID,Description,Expected,Actual,Status\n'+this.rows.map(r=>r.map(esc).join(',')).join('\n')+'\n');
    const pass=this.rows.filter(r=>r[4]==='PASS').length;
    fs.writeFileSync(path.join(LOGS,this.name+'_results.txt'),
      this.rows.map(r=>`${r[0]}\t${r[4]}\t${r[1]}\texpected=${r[2]}\tactual=${r[3]}`).join('\n')+
      `\nSUMMARY: ${pass}/${this.rows.length} PASS\n`);
    console.log(`${this.name}: ${pass}/${this.rows.length} PASS -> logs/${this.name}_results.csv`);
    if(pass!==this.rows.length)process.exitCode=1;
  }
}
module.exports={By,until,BASE,newDriver,shot,login,flashText,apiCopies,Suite};
