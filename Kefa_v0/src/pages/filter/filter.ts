import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-filter',
  templateUrl: 'filter.html',
})
export class FilterPage {
  filter: any
  possibleActivies: Array<string> = [
    "leaf",
    "color-palette",
    "walk",
    "football",
    "basketball",
    "shirt",
    "water",
    "book",
    "bicycle",
    "car"
  ]

  constructor(public events: Events, public navCtrl: NavController, public navParams: NavParams) {
    this.filter = this.navParams.get('filter')
  }

  ionViewDidLoad() {

  }

  validateFilters() {
    this.navCtrl.pop().then(() => {
        this.events.publish('custom-user-events', this.filter);
    });
  }

  isActivitySelected(activity: string) : boolean {
    let index = this.filter.activities.indexOf(activity)

    if (index >= 0) {
      return true
    }
    else {
      return false
    }
  }

  removeItem(id: string) : void {
    this.filter.activities.splice(this.filter.activities.indexOf(id), 1)
  }

  toggleActivity(activity: string) {
    if (this.isActivitySelected(activity)) {
      this.removeItem(activity)
    }
    else {
      this.filter.activities.push(activity)
    }

    console.log(this.filter.activities)
  }

  setColor(activity: string) : string {
    if (this.isActivitySelected(activity)) {
      return "white"
    }
    else {
      return "grey"
    }
  }

  setButtonColor(activity: string) : string {
    if (this.isActivitySelected(activity)) {
      return "#3798B5"
    }
    else {
      return "white"
    }
  }

}
