import { chromium } from 'playwright';
const b = await chromium.launch();
const pages = [['home','/'],['implant','/treatments/implant'],['doctors','/doctors'],['faq','/faq']];
for (const [name,path] of pages){
  const p = await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('http://localhost:3000'+path,{waitUntil:'networkidle',timeout:30000});
  await p.waitForTimeout(2200);
  await p.screenshot({path:`/tmp/shots/v2-${name}.png`,fullPage:true});
  console.log('shot',name);
  await p.close();
}
await b.close();
