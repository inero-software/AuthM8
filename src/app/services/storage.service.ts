import {Injectable} from '@angular/core';
import {SecureStorage} from '@aparajita/capacitor-secure-storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  async get(key: string): Promise<string | null> {
    try {
      return await SecureStorage.get(key) as string;
    }
    catch (error) {
      return Promise.resolve(null);
    }
  }

  async set(key: string, value: string) {
    try {
      await SecureStorage.set(key, value);
      return true;
    }
    catch (error) {
      return Promise.resolve(false);
    }
  }
}
