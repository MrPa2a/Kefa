import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from './../../providers/firebase/firebase';

/**
 * Generated class for the ElementPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 export interface FormData {
   note: string,
   comment: string
 }

@IonicPage()
@Component({
  selector: 'page-element',
  templateUrl: 'element.html',
})
export class ElementPage {
  place: any;
  index: number;
  form: any;

  constructor(public firebaseProvider: FirebaseProvider, public navCtrl: NavController, public navParams: NavParams) {
    this.place = this.navParams.get('place')
    this.index = this.navParams.get('index')

    if (this.place.opinions != undefined) {
      for (let opinion of this.place.opinions) {
        opinion['numberOfStars'] = new Array<number>();
        opinion['numberOfEmptyStars'] = new Array<number>();

        for (let i = 0; i < opinion['note']; i++) {
          opinion['numberOfStars'].push(i);
        }
        for (let i = 0; i < 5 - opinion['note']; i++) {
          opinion['numberOfEmptyStars'].push(i);
        }
      }
    }

    this.form = new FormData();
  }

  ionViewDidLoad() {

  }

  logForm() {
    console.log('INDEX : ' + this.index)
    let size = (this.place.opinions) ? this.place.opinions.length : 0

    if (this.form != undefined && this.form.comment != undefined && this.form.note != undefined) {
      this.firebaseProvider.addComment(this.index, size, {
        person: "Vincent Creusy",
        description: this.form.comment,
        note: this.form.note
      })
    }
    else {
      console.log('Il y a une erreur ...')
    }
  }
}
