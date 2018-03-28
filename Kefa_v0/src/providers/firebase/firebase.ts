import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class FirebaseProvider {

  constructor(public afd: AngularFireDatabase) { }

  getPlacesItems() {
    return this.afd.list<any>('/placesItems/').valueChanges();
  }

  getUserAccounts() {
    return this.afd.list<any>('/userAccounts/').valueChanges();
  }

  registerUser(id, userData) {
    return this.afd.database.ref().child('userAccounts').child(id).set(userData)
  }

  addComment(id, newId, comment) {
    this.afd.database.ref().child('placesItems').child(id).child('opinions').child(newId).set(comment)
  }

  addItem(name) {
    this.afd.list('/placesItems/').push(name);
  }

  removeItem(id) {
    this.afd.list('/placesItems/').remove(id);
  }
}
