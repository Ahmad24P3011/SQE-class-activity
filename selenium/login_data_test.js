// A3 - Data-driven login tests. Reusable logic: each JSON case = {id,username,password,expected}.
// expected = flash message text, or "required" for an HTML5 validation block.
const {By,BASE,newDriver,login,flashText,Suite}=require('./common');
const fs=require('fs');const path=require('path');
const casesFile=process.argv[2]||path.join(__dirname,'login_cases.json');
const cases=JSON.parse(fs.readFileSync(casesFile,'utf8'));

async function runLoginCase(driver,t){
  await driver.manage().deleteAllCookies();
  await driver.get(BASE+'/login');
  if(t.username)await driver.findElement(By.id('username')).sendKeys(t.username);
  if(t.password)await driver.findElement(By.id('password')).sendKeys(t.password);
  await driver.findElement(By.id('loginBtn')).click();
  if(t.expected==='required'){
    const invalid=await driver.executeScript('return !document.getElementById("loginForm").checkValidity()');
    return {expected:'required',actual:invalid?'required':'form accepted',ok:invalid};
  }
  const actual=await flashText(driver);
  return {expected:t.expected,actual,ok:actual.includes(t.expected)};
}
(async()=>{
 const d=await newDriver();const s=new Suite('A3_data_driven_login');
 try{
  for(const t of cases)
    await s.run(d,t.id,`user="${t.username}" pass="${t.password?'*'.repeat(t.password.length):''}"`,()=>runLoginCase(d,t),
      {shot:t.id==='TC02'?'A3_TC02_wrong_username_NEGATIVE':undefined});
 } finally {await d.quit();}
 s.save();
})().catch(e=>{console.error(e);process.exitCode=1;});
