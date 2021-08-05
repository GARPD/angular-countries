import { Injectable } from '@angular/core';
declare var db: any;

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  dbNameStorage = 'countries';

  constructor() {}

  getAllIDB(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (db) {
        const request = db
          .transaction([this.dbNameStorage], 'readonly')
          .objectStore(this.dbNameStorage)
          .getAll();

        request.onsuccess = await function (e: any) {
          if (e.target.result) {
            resolve(e.target.result);
          } else {
            resolve(false);
          }
        };
        request.onerror = (e: any) => reject(e.target.error.message);
      } else {
        reject('indexedDB is undefined');
      }
    });
  }

  getByIdIDB(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (db && key) {
        const request = db
          .transaction([this.dbNameStorage], 'readonly')
          .objectStore(this.dbNameStorage)
          .get(key);

        request.onsuccess = (e: any) => {
          if (e.target.result) {
            resolve(e.target.result);
          } else {
            resolve(false);
          }
        };
        request.onerror = (e: any) => reject(e.target.error.message);
      } else {
        reject(`${db ? 'Key item' : 'IndexedDB'} is undefined`);
      }
    });
  }

  addIDB(value: any, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (db && value) {
        const request = db
          .transaction([this.dbNameStorage], 'readwrite')
          .objectStore(this.dbNameStorage)
          .add(value, key);

        request.onsuccess = (e: any) => {
          if (e.target.result) {
            this.setItemLocalStorage(value);
            resolve('success');
          } else {
            resolve(false);
          }
        };
        request.onerror = (e: any) => {
          reject(e.target.error.message);
        };
      } else {
        reject(`${db ? 'Item' : 'IndexedDB'} is undefined`);
      }
    });
  }

  removeIDB(value: any, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (db) {
        this.getByIdIDB(key).then(
          (resp) => {
            if (typeof resp == 'undefined') {
              // 'No matching record found'
              resolve(false);
            }

            const request = db
              .transaction([this.dbNameStorage], 'readwrite')
              .objectStore(this.dbNameStorage)
              .delete(key);

            request.onsuccess = (e: any) => {
              this.setItemLocalStorage(value);
              resolve('success');
            };
            request.onerror = (e: any) => reject(e.target.error.message);
          },
          (err) => {
            reject(err.message);
          }
        );
      } else {
        reject('indexedDB is undefined');
      }
    });
  }

  /**
   * Set value item in localstorage favoriteCountries key
   */
  setItemLocalStorage(value: any) {
    try {
      window.localStorage.setItem('favoriteCountries', JSON.stringify(value));
    } catch (error) {}
  }
}
