const puppeteer = require('puppeteer');

async function simulateAccess(userAgent, viewport) {
    console.log('Starting the browser...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Setzen Sie den User-Agent und den Viewport
    console.log('Setting the user agent and viewport...');
    await page.setUserAgent(userAgent);
    await page.setViewport(viewport);

    // Greifen Sie auf die Webseite zu
    console.log('Accessing the website...');
    await page.goto('http://localhost:3000');

    console.log('Closing the browser...');
    await browser.close();

    console.log('Done.');
}

// Verwenden Sie die Funktion, um einen Zugriff mit verschiedenen Parametern zu simulieren
simulateAccess(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537',
    {width: 1280, height: 800}
);