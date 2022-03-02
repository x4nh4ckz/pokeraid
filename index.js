import fs from 'fs';
import fetch from 'node-fetch';
import querySelector from 'query-selector';
import jsdom from 'jsdom';
import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  // set cookies to authorize
  const cookies = fs.readFileSync('cookies.json', 'utf8');
  const deserializedCookies = JSON.parse(cookies);
  await page.setCookie(...deserializedCookies);
  // let's go
  await page.goto(`https://www.twitch.tv/popout/${process.env.STREAMER_ID}/chat`); // goryachiisahar
  await page.waitForSelector('textarea[data-a-target=chat-input]');
  await parse2(page);
  await browser.close();
})();

async function parse2(page) {
  for(let x = 1; x <= 36; x++) {
    await fetch(`https://pokemonov.net/pokedex/page/${x}`).then(resp => resp.text()).then(async loaded => {
      // let outerParser = new DOMParser();
      let outerParser = new jsdom.JSDOM(loaded);
      let docc = outerParser.window.document;
      // docc = outerParser.parseFromString(loaded, 'text/html');
      await parsePokemon(page, docc, 2);
    });
  }
};

async function parsePokemon(page, docc, i) {
  let link = docc.querySelector(`#maincontent > ul > li:nth-child(${i}) > span:nth-child(1) > a`).href;
  await fetch(link).then(async resp => {
    let data = await resp.text();
    let parser = new jsdom.JSDOM(data);
    let htmlDoc = parser.window.document;
    let text = '';
    for(let j = 2; j <= 3; j++) {
      text += ' ' + htmlDoc.querySelector(`#maincontent > div.pokemoninfo > p:nth-child(${j})`).innerHTML;
    }
    await page.focus('textarea[data-a-target=chat-input]');
    await page.type('textarea[data-a-target=chat-input]', text);
    await page.keyboard.press('Enter');
    if(i < 20) await parsePokemon(page, docc, i+1);
  });
};


