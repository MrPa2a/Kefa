import { Injectable } from '@angular/core';
import { AngularFireDatabase} from 'angularfire2/database';
import { PlaceData } from '../../pages/home/home';

@Injectable()
export class FirebaseProvider {

  constructor(public afd: AngularFireDatabase) { }

  getPlacesItems() {
    return this.afd.list<PlaceData>('/placesItems/').valueChanges();
  }

  addItem(name) {
    this.afd.list('/placesItems/').push(name);
  }

  removeItem(id) {
    this.afd.list('/placesItems/').remove(id);
  }
}
