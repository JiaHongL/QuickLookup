import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UniqueIdService {
  private idCounter = 0;
  generateUniqueId(prefix: string): string {
    return `${prefix}-${this.idCounter++}`;
  }
}
