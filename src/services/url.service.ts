import { Injectable, NotFoundException } from '@nestjs/common';
import { DnsLookupService } from './dns-lookup-service';
import * as dotenv from 'dotenv';
import { UrlEntity } from '../entities/url.entity';
import * as url from "url";
dotenv.config();

@Injectable()
export class UrlService {
  constructor(private readonly dnsLookupService: DnsLookupService) {}
  async shortenUrl(url: string): Promise<string> {
    const isValid = await this.isValidUrl(url);
    if (!isValid) {
      throw new NotFoundException('Invalid URL');
    }

    const shortId = await this.generateShortId();
    const shortUrl = `http://${process.env.DOMAIN}/${shortId}`;
    await UrlEntity.insert({
      generatedId: shortId,
      originalUrl: url,
    });
    return shortUrl;
  }

  async expandUrl(shortUrl: string){
    const parsedUrl = url.parse(shortUrl);
    const path = parsedUrl.pathname;
    const segments = path.split('/');
    if (segments.length === 0) {
      throw new NotFoundException('URL is invalid');
    }
    const linkId = segments[segments.length - 1];
    const res = await UrlEntity.findOneBy({ generatedId: linkId });
    if (!res) {
      throw new NotFoundException('Short URL not found');
    }
    return res.originalUrl;
  }

  async isValidUrl(url: string): Promise<boolean> {
    // Perform Regex validation first (saving time)
    const regexValid = this.validateUrl(url);
    // prepare for dns look up (add missing https://)
    url = this.prepareForLookup(url);
    // Perform DNS lookup to check if the URL is valid
    if (regexValid) {
      if (this.dnsLookupService.lookup(url)) {
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
    const pattern = new RegExp(
      "^([a-zA-Z]+:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR IP (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$", // fragment locator
      "i"
    );
    return pattern.test(url);
  }
  private async generateShortId() {
    // double check - check the database to make sure no other links has the same id.
    // Convert timestamp to base36 string - should make it shorter
    const timestamp = Date.now().toString(36);
    const randomDigit = Math.floor(Math.random() * 9) + 1;
    const shortId = timestamp + randomDigit.toString();
    const res = await UrlEntity.findOneBy({ generatedId: shortId });
    if (!res) {
      return shortId;
    }
    return this.generateShortId();
  }
}
