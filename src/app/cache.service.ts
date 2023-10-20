import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  constructor() { }

  cacheDataAndTimestamp(dataKey: string, timestampKey: string, data: string): void {
    // caching data
    localStorage.setItem(dataKey, data);
    // cahe current timestamp
    localStorage.setItem(timestampKey, String(new Date().valueOf()));

  }

  remove(...keys): void {
    for (let key of keys)
      localStorage.removeItem(key);
  }

  isCached(key: string): boolean {
    if (localStorage.getItem(key)) {
      return true;
    }
    return false
  }

  isNotCached(key: string): boolean {
    return !this.isCached(key);
  }

  isExpired(key: string, timeout: number): boolean {
    return (new Date().valueOf() - (+localStorage.getItem(key))) >= timeout
  }

  isNotExpired(key: string, timeout: number): boolean {
    return !this.isExpired(key, timeout);
  }


  getCacheData(key: string) {
    return localStorage.getItem(key);
  }

  cacheData(key: string, data: string) {
    localStorage.setItem(key, data);
  }

}
