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

  placeName: null;
  placeImage: null;
  placeDescription: null;
  placeAddress: null;
  placeNote: null;
  placeOpinion: null;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.placeName = navParams.get('placeName');
    this.placeImage = navParams.get('placeImage');
    this.placeDescription = navParams.get('placeDescription');
    this.placeAddress = navParams.get('placeAddress');
    this.placeNote = navParams.get('placeNote');
    this.placeOpinion = navParams.get('placeOpinion');

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ElementPage');
  }

}
