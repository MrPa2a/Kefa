import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the ElementPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-element',
  templateUrl: 'element.html',
})
export class ElementPage {
  place: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.place = navParams.get('place');

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
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ElementPage');
  }

}
