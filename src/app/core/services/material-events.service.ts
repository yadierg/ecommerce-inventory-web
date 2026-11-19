import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MaterialEventsService {
  private materialCreatedSource = new Subject<void>();
  materialCreated$ = this.materialCreatedSource.asObservable();

  notifyMaterialCreated() {
    this.materialCreatedSource.next();
  }
}