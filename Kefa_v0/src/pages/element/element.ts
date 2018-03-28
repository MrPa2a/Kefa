import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from './../../providers/firebase/firebase';
import { UserData } from '../home/home';

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
  user: UserData;
  isAbleToComment: boolean = true;

  constructor(public firebaseProvider: FirebaseProvider, public navCtrl: NavController, public navParams: NavParams) {
    this.place = this.navParams.get('place')
    this.index = this.navParams.get('index')
    this.user = this.navParams.get('user')

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

        if (this.user != undefined && opinion.person === this.user.firstName + " " + this.user.lastName) {
          this.isAbleToComment = false;
        }
      }
    }

    this.form = new FormData();
  }

  ionViewDidLoad() {

  }

  logForm() {
    let size = (this.place.opinions) ? this.place.opinions.length : 0

    if (this.form != undefined && this.form.comment != undefined && this.form.note != undefined) {
      this.firebaseProvider.addComment(this.index, size, {
        person: this.user.firstName + " " + this.user.lastName,
        description: this.form.comment,
        note: this.form.note
      })
      this.navCtrl.pop();
    }
  }
}
