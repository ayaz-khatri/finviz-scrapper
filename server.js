import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* REQUIRED ROOT ROUTE */
app.get('/', (req, res) => {
    res.send('Finviz Scraper API is running');
});

/* HEALTH CHECK */
app.get('/health', (req, res) => {
    res.json({ status: 'OK', time: new Date().toISOString() });
});

app.post('/scrape', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL required' });
    }

    let browser;

    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--no-zygote",
                "--single-process"
            ]
        });

        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
        );

        await page.setDefaultNavigationTimeout(60000);
        await page.setDefaultTimeout(60000);

        // ✅ Safer navigation for Finviz
        await page.goto(url, {
            waitUntil: 'domcontentloaded'
        });

        // ✅ Extra wait to allow table rendering
        await page.waitForFunction(
            () => document.querySelectorAll('.styled-table-new tr').length > 1,
            { timeout: 30000 }
        );

        const data = await page.evaluate(() => {
            const rows = document.querySelectorAll('.styled-table-new tr');
            return Array.from(rows).slice(1).map(row => {
                const cols = row.querySelectorAll('td');
                if (cols.length < 11) return null;

                return {
                    ticker: cols[1].innerText.trim(),
                    company: cols[2].innerText.trim(),
                    sector: cols[3].innerText.trim(),
                    industry: cols[4].innerText.trim(),
                    country: cols[5].innerText.trim(),
                    marketCap: cols[6].innerText.trim(),
                    pe: cols[7].innerText.trim(),
                    price: cols[8].innerText.trim(),
                    change: cols[9].innerText.trim(),
                    volume: cols[10].innerText.trim()
                };
            }).filter(Boolean);
        });

        res.json({ success: true, count: data.length, data });

    } catch (err) {
        console.error('SCRAPE ERROR:', err.message);
        res.status(500).json({
            success: false,
            error: err.message
        });
    } finally {
        if (browser) await browser.close();
    }
});


/* THIS IS CRITICAL */
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on ${PORT}`);
});
