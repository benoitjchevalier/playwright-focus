const playwright = require("playwright");
const path = require("path");
const { cwd, exit } = require("process");
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");

// allow await
(async () => {
  const options = {
    headless: true,
  };

  const chrome = await playwright["chromium"].launch(options),
    ff = await playwright["firefox"].launch(options),
    webkit = await playwright["webkit"].launch(options);

  const newPage = async (browser) => {
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
      }),
      page = await context.newPage();
    return page;
  };

  const run = async (browser, browserType, index) => {
    console.log(`run ${browserType}${index}`);
    return newPage(browser).then(async (page) => {
      await page.goto("https://developer.mozilla.org/en-US/");
      const divHandle = await page.$("div > a");
      await divHandle.focus();

      // get some padding to see focus ring
      const bb = await divHandle.boundingBox();
      bb.x -= 5;
      bb.y -= 5;
      bb.width += 10;
      bb.height += 10;

      const dest = path.join(
        process.cwd(),
        "screenshots",
        `${browserType}_${index}.png`
      );
      console.log(`take screenshot ${dest}`);
      await page.screenshot({
        path: dest,
        clip: bb,
      });
    });
  };

  let allProm = [],
    index = 0;

  // // This is ok
  allProm.push(run(chrome, "chrome", index));
  allProm.push(run(ff, "firefox", index));
  allProm.push(run(webkit, "webkit", index));
  await Promise.all(allProm);

  allProm = [];
  // when doing // execution FF will struggle to keep the focus ring on every screenshot
  index++;
  allProm.push(run(chrome, "chrome", index));
  allProm.push(run(ff, "firefox", index));
  allProm.push(run(webkit, "webkit", index));
  index++;
  allProm.push(run(chrome, "chrome", index));
  allProm.push(run(ff, "firefox", index));
  allProm.push(run(webkit, "webkit", index));
  index++;
  allProm.push(run(chrome, "chrome", index));
  allProm.push(run(ff, "firefox", index));
  allProm.push(run(webkit, "webkit", index));
  await Promise.all(allProm);

  exit();
})();
