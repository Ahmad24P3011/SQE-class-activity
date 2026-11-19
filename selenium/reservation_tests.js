// A2 - Search and reservation tests. Completes reservation_starter.js TODO 1-6.
// Requires a freshly reset app (python app.py --reset) so inventory is the seed data.
const {By,until,BASE,newDriver,login,flashText,apiCopies,Suite}=require('./common');
const T=id=>By.css(`[data-testid="${id}"]`);
async function search(d,q){
  await d.get(BASE+'/books');
  await d.findElement(By.id('search')).sendKeys(q);
  await d.findElement(By.id('searchBtn')).click();
  await d.wait(until.urlContains('q='),5000);   // wait for the results page to load
}
async function submitPhone(d,phone,bypassClientValidation=false){
  const f=await d.findElement(By.id('phone'));await f.clear();await f.sendKeys(phone);
  if(bypassClientValidation)await d.executeScript('document.getElementById("reserveForm").noValidate=true');
  await d.findElement(By.id('reserveBtn')).click();
}
(async()=>{
 const d=await newDriver();const s=new Suite('A2_reservations');
 try{
  await login(d,'student1','Library@123');await flashText(d);
  await s.run(d,'A2-01','Search existing book "Software Testing"',async()=>{
    await search(d,'Software Testing');
    const titles=await Promise.all((await d.findElements(T('book-title'))).map(e=>e.getText()));
    return {expected:'1 result: Software Testing',actual:JSON.stringify(titles),ok:titles.length===1&&titles[0]==='Software Testing'};},{shot:'A2-01_search_existing'});
  await s.run(d,'A2-02','Search missing book "nonsense-title-xyz"',async()=>{
    await search(d,'nonsense-title-xyz');
    const cards=(await d.findElements(T('book-card'))).length;
    const msg=await d.findElement(T('no-results')).getText();
    return {expected:'0 cards, "No matching books found"',actual:`${cards} cards, "${msg}"`,ok:cards===0&&msg==='No matching books found'};},{shot:'A2-02_search_missing_NEGATIVE'});
  await s.run(d,'A2-03','Reserve available book 1 with valid phone',async()=>{
    const before=await apiCopies(1);
    await d.get(BASE+'/reserve/1');await submitPhone(d,'03123456789');
    const msg=await flashText(d);const after=await apiCopies(1);const url=await d.getCurrentUrl();
    return {expected:`Reservation successful, copies ${before}->${before-1}, redirected to /books`,
      actual:`${msg}, copies ${before}->${after}, ${url.replace(BASE,'')}`,
      ok:msg==='Reservation successful'&&after===before-1&&url.endsWith('/books')};},{shot:'A2-03_reservation_success'});
  await s.run(d,'A2-04','Reserve unavailable book 3 (0 copies)',async()=>{
    await d.get(BASE+'/reserve/3');
    const msg=await d.findElement(T('reservation-error')).getText();
    const forms=(await d.findElements(By.id('reserveForm'))).length;
    return {expected:'"Book is unavailable", no reservation form',actual:`"${msg}", forms=${forms}`,ok:msg==='Book is unavailable'&&forms===0};},{shot:'A2-04_unavailable_NEGATIVE'});
  await s.run(d,'A2-05a','Invalid phone (letters/short) blocked by browser validation',async()=>{
    await d.get(BASE+'/reserve/2');await submitPhone(d,'12345');
    const invalid=await d.executeScript('return !document.getElementById("reserveForm").checkValidity()');
    const url=await d.getCurrentUrl();const copies=await apiCopies(2);
    return {expected:'Form invalid, still on /reserve/2, copies=2',actual:`invalid=${invalid}, ${url.replace(BASE,'')}, copies=${copies}`,
      ok:invalid&&url.endsWith('/reserve/2')&&copies===2};});
  await s.run(d,'A2-05b','Invalid phone rejected by SERVER (client validation bypassed)',async()=>{
    await d.get(BASE+'/reserve/2');await submitPhone(d,'12345',true);
    const msg=await flashText(d);const copies=await apiCopies(2);
    return {expected:'"Phone number must contain exactly 11 digits", copies unchanged=2',actual:`"${msg}", copies=${copies}`,
      ok:msg==='Phone number must contain exactly 11 digits'&&copies===2};},{shot:'A2-05b_invalid_phone_NEGATIVE'});
  await s.run(d,'A2-05c','12-digit phone rejected by server',async()=>{
    await d.get(BASE+'/reserve/2');await submitPhone(d,'031234567890',true);
    const msg=await flashText(d);const copies=await apiCopies(2);
    return {expected:'Phone validation error, copies=2',actual:`"${msg}", copies=${copies}`,
      ok:msg==='Phone number must contain exactly 11 digits'&&copies===2};});
  await s.run(d,'A2-06','Duplicate reservation of book 1 by same user',async()=>{
    const before=await apiCopies(1);
    await d.get(BASE+'/reserve/1');await submitPhone(d,'03123456789');
    const msg=await flashText(d);const after=await apiCopies(1);
    return {expected:`"You already reserved this book", copies unchanged=${before}`,actual:`"${msg}", copies=${after}`,
      ok:msg==='You already reserved this book'&&after===before};},{shot:'A2-06_duplicate_NEGATIVE'});
  await s.run(d,'A2-07','Different user (student2) can reserve same book 1',async()=>{
    await d.findElement(By.id('logoutBtn')).click();await flashText(d);
    await login(d,'student2','Library@456');await flashText(d);
    const before=await apiCopies(1);
    await d.get(BASE+'/reserve/1');await submitPhone(d,'03001234567');
    const msg=await flashText(d);const after=await apiCopies(1);
    return {expected:`Reservation successful, copies ${before}->${before-1}`,actual:`${msg}, copies ${before}->${after}`,
      ok:msg==='Reservation successful'&&after===before-1};});
 } finally {await d.quit();}
 s.save();
})().catch(e=>{console.error(e);process.exitCode=1;});
