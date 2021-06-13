import { IUrlWithStatusCode } from './interfaces';
import puppeteer, { Browser, Page } from 'puppeteer';
import { asyncForEach } from './helper/asyncForEach';
import { getOriginfromUrl, isValidUrl } from './helper/url';

let findedUrlsWithStatusCodes: IUrlWithStatusCode[] = [];


const scrapRecursive = async (page: Page, url: string):Promise<void> => {
    const origin = getOriginfromUrl(url)
    try {
        const newPage = await page.goto(url);
        findedUrlsWithStatusCodes.push({
            url,
            status: newPage.status()
        });
        console.log(`url ${url} with status ${newPage.status()}`);
        let links = await page.$$eval('a', ((elements: any[]) => {
            return elements.filter(e => {
                //Somehow imported <isValidUrl> function is undefined here..thats why again I created it here.
                const isValidUrl = (str: string) => {
                    const expression = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
                    return expression.test(str)
                }
                if (isValidUrl(e) && new URL(e).origin == origin) {
                    return true;
                } else {
                    return false;
                }
            }).map((element: any) => element.href);
        }));
        links = links.filter((e: string)=> e != url && `${e}/` != url && !e.includes("#") && isValidUrl(e));
        //we must exclude dublicates from list, check if url is valid and then continue scraping
        links = [...new Set(links)];
        if (links.length > 1) {
            await asyncForEach(links, async(item: string) => {
                if (!findedUrlsWithStatusCodes.find(e=> e.url == item || e.url == `${item}/` || `${e.url}/` == item)) {
                    await scrapRecursive(page, item);
                }
            });
        } else if (links[0] && !findedUrlsWithStatusCodes.find(e=> e.url == links[0] || e.url == `${links[0]}/` || `${e.url}/` == links[0])) {
            await scrapRecursive(page, links[0])
        } else {
            return;
        }
    } catch (error) {
        findedUrlsWithStatusCodes.push({
            url,
            status: 501
        });
    }

}

export const startScraping = async (url: string):Promise<IUrlWithStatusCode[]> => {
    const browser: Browser = await puppeteer.launch();
    const page: Page = await browser.newPage();
    findedUrlsWithStatusCodes = [];
    if (isValidUrl(url)) {
       await scrapRecursive(page, url);
    }
    await browser.close();
    console.log(`Total urls ${findedUrlsWithStatusCodes.length}`)
    return findedUrlsWithStatusCodes;
}
