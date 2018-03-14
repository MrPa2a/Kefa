import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

/*
  Generated class for the FirebaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FirebaseProvider {

  constructor(public afd: AngularFireDatabase) {
    console.log('Hello FirebaseProvider Provider');
  }

  getPlacesItems() {
    return this.afd.list('/placesItems/');
  }

  addItem(name) {
    this.afd.list('/placesItems/').push(name);
  }

  removeItem(id) {
    this.afd.list('/placesItems/').remove(id);
  }

}
