import express, { Request, Response, Express } from 'express';
import { startScraping } from './scraper';
import { isValidUrl } from './helper/url'
import { IUrlWithStatusCode } from './interfaces';
const app: Express = express();
const cors = require('cors');
app.use(cors());

app.get("/scrap", async(req: Request, res: Response): Promise<void> => {
    const { link } = req.query;
    //we must check if url is valid and then send all finded urls from that website to client.
    if (!isValidUrl(String(link))) {
        res.status(200).json({ 
            errorMessage: 'Please send a valid url', 
            statusCode: "ERROR" 
        })
    } else {
        const findedUrlsWithStatusCodes: IUrlWithStatusCode[] = await startScraping(String(link));
        res.status(200).json({
            findedUrlsWithStatusCodes,
            total: findedUrlsWithStatusCodes.length,
            statusCode: "OK"
        });
    }
})


app.listen(5000, () => {
    console.log("Listening on port 5000")
})