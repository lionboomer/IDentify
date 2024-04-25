const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    // Rest of your code...
}

run().catch(console.error);

function saveData(data) {
    const dataString = JSON.stringify(data, null, 2);
    fs.writeFileSync('fingerprint.log', dataString);
}

async function getWebGLData() {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto('http://localhost:3000');
    const webglData = await page.evaluate(() => {
        const gl = document.createElement('canvas').getContext('webgl');
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return {
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
        };
    });
    await browser.close();
    console.log('WebGL data collected:', webglData);
    return webglData;
}

async function getCanvasData() {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto('http://localhost:3000');
    const canvasData = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.fillText('Hello, world!', 50, 50);
        return canvas.toDataURL();
    });
    await browser.close();
    console.log('Canvas data collected:', canvasData);
    return canvasData;
}

async function collectData() {
    console.log('Starting data collection...');
    
    console.log('Collecting WebGL data...');
    const webglData = await getWebGLData();
    console.log('WebGL data collected:', webglData);

    console.log('Collecting Canvas data...');
    const canvasData = await getCanvasData();
    console.log('Canvas data collected:', canvasData);

    console.log('Collecting Browser data...');
    const browserData = await getBrowserData();
    console.log('Browser data collected:', browserData);

    const data = {webglData, canvasData, browserData};
    
    console.log('Saving data...');
    saveData(data);
    console.log('Data saved.');

    console.log('Data collection completed.');
    return data;
}

collectData().then(data => {
    console.log('Data:', data);
});
collectData().then(console.log);

