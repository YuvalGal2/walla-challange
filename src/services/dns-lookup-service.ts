// dns-lookup.service.ts
import { Injectable } from '@nestjs/common';
import * as dns from 'dns';

@Injectable()
export class DnsLookupService {
  async lookup(url: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const domain = new URL(url).hostname;
      dns.lookup(domain, (err) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
