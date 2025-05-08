import puppeteer from 'puppeteer'

(async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({headless: "new", args: ['--no-sandbox']});
    const page = await browser.newPage();

    // Navigate to dev server
    await page.goto('http://localhost:5173/');

    // Set screen size
    await page.setViewport({width: 1080, height: 1024});

    const menuOpenerSelector = "#file-menu-opener"
    await page.waitForSelector(menuOpenerSelector);
    await page.click(menuOpenerSelector);

    // Wait for drawer to be visible
    await page.waitForTimeout(1000)

    // Open file chooser
    const projectLoadSelector = "div.n-menu-item:nth-child(3) > div:nth-child(1) > div:nth-child(1)"
    await page.waitForSelector(projectLoadSelector);

    const [fileChooser] = await Promise.all([
        page.waitForFileChooser({timeout: 3000}),
        page.click(projectLoadSelector),
    ]);

    // Load Lonewolf.lwp project file
    await fileChooser.accept([process.argv[2]]);

    // Wait for project to be loaded
    //  await page.waitForSelector("div.list-lane");

    // Wait for drawer to be hidden
    await page.waitForTimeout(1000)

    // Do some DOM manipulation for print
    await page.evaluate(() => {
    // Remove hight limitation so that lists display all cards
        const viewPort = document.querySelector('.full-height');
        viewPort.className = ""

        // Remove "new Card" inputs
        document.querySelectorAll("div.list-lane > div:nth-child(2) > div:nth-child(2)").forEach(element => {
            element.style.display = "none"
        });
    });

    // Take screenshot
    await page.screenshot({
        path: process.argv[3],
        fullPage: true
    });

    await browser.close();
})();
