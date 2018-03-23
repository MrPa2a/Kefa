import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class FirebaseProvider {

  constructor(public afd: AngularFireDatabase) { }

  getPlacesItems() {
    return this.afd.list<any>('/placesItems/').valueChanges();
  }

  addComment(id, newId, comment) {
    this.afd.list('/placesItems/' + id + '/opinions/' + newId).push(comment);
  }

  addItem(name) {
    this.afd.list('/placesItems/').push(name);
  }

  removeItem(id) {
    this.afd.list('/placesItems/').remove(id);
  }
}
