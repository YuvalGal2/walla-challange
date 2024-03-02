import { Injectable, NotFoundException } from '@nestjs/common';
import { DnsLookupService } from './dns-lookup-service';
import * as dotenv from 'dotenv';
import { UrlEntity } from '../entities/url.entity';
import * as url from 'url';
dotenv.config();

@Injectable()
export class UrlService {
  private linkMap = new Map();
  constructor(private readonly dnsLookupService: DnsLookupService) {}

  /*
   this function is responsible for creating the short link
   is has a basic "caching system" using maps, and double checking in the database
  */
  async shortenUrl(url: string): Promise<{ shortenUrl: string }> {
    if (!url) {
      throw new NotFoundException('Invalid URL');
    }
    const isValid = await this.isValidUrl(url);
    if (!isValid) {
      throw new NotFoundException('Invalid URL');
    }
    const existingLink = await this.isLinkExisting(url);
    if (existingLink) {
      return { shortenUrl: `http://${process.env.DOMAIN}/${existingLink}` };
    }
    const shortId: string = await this.generateShortId();
    const shortUrl: string = `http://${process.env.DOMAIN}/${shortId}`;
    await UrlEntity.insert({
      generatedId: shortId,
      originalUrl: url,
    });
    return { shortenUrl: shortUrl };
  }

  /* validation function for the database to check if link is not already existing */
  private async isLinkExisting(link: string) {
    if (this.linkMap.has(url)) {
      return this.linkMap.get(url);
    }
    const res: UrlEntity = await UrlEntity.findOneBy({ originalUrl: link });
    if (!res) {
      return false;
    }
    return res.generatedId;
  }

  /* given a id / full shorten url .. it's returning the orginal url */
  async expandUrl(shortUrl: string): Promise<{ originalUrl: string }> {
    if (!shortUrl) {
      throw new NotFoundException('Invalid URL');
    }
    const parsedUrl: url.UrlWithStringQuery = url.parse(shortUrl);
    const path: string = parsedUrl.pathname;
    const segments: string[] = path.split('/');
    if (segments.length === 0) {
      throw new NotFoundException('URL is invalid');
    }
    const linkId: string = segments[segments.length - 1];
    const res: UrlEntity = await UrlEntity.findOneBy({ generatedId: linkId });
    if (!res) {
      throw new NotFoundException('Short URL not found');
    }
    // to make sure im returning it the correct way.
    const prefixedLink =
      res.originalUrl.startsWith('http://') ||
      res.originalUrl.startsWith('https://')
        ? res.originalUrl
        : `http://${res.originalUrl}`;
    return { originalUrl: prefixedLink };
  }

  async isValidUrl(url: string): Promise<boolean> {
    // Perform Regex validation first (saving time)
    const regexValid = this.validateUrl(url);
    // prepare for dns look up (add missing https://)
    url = this.prepareForLookup(url);
    // Perform DNS lookup to check if the URL is valid
    if (regexValid) {
      if (await this.dnsLookupService.lookup(url)) {
        return true;
      }
    }
    return false; // not even a valid url by the regex. no need to do a dns lookup
  }

  private prepareForLookup(url: string): string {
    // If no protocol is specified, add "http://"
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = 'http://' + url;
    }
    return url;
  }
  private validateUrl(url: string) {
    const pattern: RegExp = new RegExp(
      '^([a-zA-Z]+:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', // fragment locator
      'i',
    );
    return pattern.test(url);
  }
  private async generateShortId(): Promise<string> {
    // double check - check the database to make sure no other links has the same id.
    // Convert timestamp to base36 string - should make it shorter
    const timestamp: string = Date.now().toString(36);
    const randomDigit: number = Math.floor(Math.random() * 9) + 1;
    const shortId: string = timestamp + randomDigit.toString();
    const res: UrlEntity = await UrlEntity.findOneBy({ generatedId: shortId });
    if (!res) {
      return shortId;
    }
    return this.generateShortId();
  }
}
