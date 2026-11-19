// A1 - Login tests (valid, wrong user, wrong pass, blank fields, logout + protected access)
const {By,BASE,newDriver,login,flashText,Suite}=require('./common');
(async()=>{
 const d=await newDriver();const s=new Suite('A1_login');
 try{
  await d.manage().deleteAllCookies();
  await s.run(d,'A1-01','Valid login',async()=>{
    await login(d,'student1','Library@123');
    const msg=await flashText(d);const url=await d.getCurrentUrl();
    const user=await d.findElement(By.css('[data-testid="current-user"]')).getText();
    return {expected:'Login successful, on /books, user=student1',actual:`${msg}, ${url.replace(BASE,'')}, user=${user}`,
      ok:msg==='Login successful'&&url.endsWith('/books')&&user==='student1'};},{shot:'A1-01_valid_login'});
  await d.findElement(By.id('logoutBtn')).click();
  await s.run(d,'A1-02','Incorrect username',async()=>{
    await login(d,'wronguser','Library@123');const msg=await flashText(d);
    const stillLogin=(await d.getCurrentUrl()).endsWith('/login');
    return {expected:'Invalid username or password, stays on /login',actual:`${msg}, onLogin=${stillLogin}`,ok:msg==='Invalid username or password'&&stillLogin};},{shot:'A1-02_wrong_username_NEGATIVE'});
  await s.run(d,'A1-03','Incorrect password',async()=>{
    await login(d,'student1','wrongpass');const msg=await flashText(d);
    return {expected:'Invalid username or password',actual:msg,ok:msg==='Invalid username or password'};});
  await s.run(d,'A1-04','Blank username (HTML5 required blocks submit)',async()=>{
    await d.get(BASE+'/login');await d.findElement(By.id('password')).sendKeys('Library@123');
    await d.findElement(By.id('loginBtn')).click();
    const invalid=await d.executeScript('return !document.getElementById("loginForm").checkValidity()');
    const url=await d.getCurrentUrl();
    return {expected:'Form invalid, no submission',actual:`invalid=${invalid}, url=${url.replace(BASE,'')}`,ok:invalid&&url.endsWith('/login')};});
  await s.run(d,'A1-05','Blank password (HTML5 required blocks submit)',async()=>{
    await d.get(BASE+'/login');await d.findElement(By.id('username')).sendKeys('student1');
    await d.findElement(By.id('loginBtn')).click();
    const invalid=await d.executeScript('return !document.getElementById("loginForm").checkValidity()');
    return {expected:'Form invalid, no submission',actual:`invalid=${invalid}`,ok:invalid};});
  await s.run(d,'A1-06','Both fields blank',async()=>{
    await d.get(BASE+'/login');await d.findElement(By.id('loginBtn')).click();
    const invalid=await d.executeScript('return !document.getElementById("loginForm").checkValidity()');
    return {expected:'Form invalid',actual:`invalid=${invalid}`,ok:invalid};});
  await s.run(d,'A1-07','Logout, then protected page denied',async()=>{
    await login(d,'student1','Library@123');await flashText(d);
    await d.findElement(By.id('logoutBtn')).click();
    const out=await flashText(d);
    const navLogin=(await d.findElements(By.css('[data-testid="nav-login"]'))).length===1;
    await d.get(BASE+'/reserve/1');
    const msg=await flashText(d);const url=await d.getCurrentUrl();
    return {expected:'Logged out successfully; /reserve/1 redirects to /login with "Please log in first."',
      actual:`${out}; navLogin=${navLogin}; ${msg} @ ${url.replace(BASE,'')}`,
      ok:out==='Logged out successfully'&&navLogin&&msg==='Please log in first.'&&url.endsWith('/login')};},{shot:'A1-07_protected_access_denied_NEGATIVE'});
 } finally {await d.quit();}
 s.save();
})().catch(e=>{console.error(e);process.exitCode=1;});
