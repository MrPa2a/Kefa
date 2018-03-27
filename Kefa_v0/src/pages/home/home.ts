import { Component, ViewChild, ElementRef, Injectable } from '@angular/core';
import { NavController, NavParams, Events, Slides } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { FirebaseProvider } from './../../providers/firebase/firebase';
import { NativeGeocoder, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';
import { ElementPage } from "../element/element";
import { FilterPage } from "../filter/filter";

declare var google;

export interface Coordinates {
  lat: number,
  lng: number
}

export interface FilterData {
  range: number,
  price: number,
  activities: Array<string>
}

@Injectable()
@Component({
  selector: 'home-page',
  templateUrl: 'home.html',
  providers: [
    NativeGeocoder
  ]
})
export class HomePage {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild(Slides) slides: Slides;

  elementPage = ElementPage;

  placesItems: any;
  tempPlacesItems: any;
  map: any;
  userMarker: any;
  marker: any;
  circle: any;
  userPosition: Coordinates;
  range: number = undefined;
  currentIndex: number = 0;
  filter: FilterData;

  readonly DEFAULT_RANGE: number = 0;
  readonly DEFAULT_PRICE: number = 50;

  readonly DEFAULT_COORDINATES: Coordinates = {
    lat: 43.697233,
    lng: 7.27023650000001
  };

  readonly possibleActivies: Array<string> = [
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

  constructor(public events: Events, public navParams: NavParams, public firebaseProvider: FirebaseProvider, public navCtrl: NavController, public geolocation: Geolocation, public nativeGeocoder: NativeGeocoder) {
    this.filter = {
      range: this.DEFAULT_RANGE,
      price: this.DEFAULT_PRICE,
      activities: this.possibleActivies.slice()
    }
  }

  ionViewDidEnter() {
    if (this.navParams.get('filters')) {
      this.filter = this.navParams.get('filters')
    }
  }

  ionViewDidLoad() {
    this.userPosition = this.DEFAULT_COORDINATES;
    this.loadMap();
    this.firebaseProvider.getPlacesItems().subscribe(res => {
      this.placesItems = res;
      this.computeAverageNote();
      this.addMarkerWithPlace(this.placesItems[0]);
      this.filterByDistance();
    }, err => {
      console.log("Error at HomePage.ionViewDidLoad() : " + err);
    });
  }

  filterByDistance() : void {
    if (!this.circle) {
      this.circle = new google.maps.Circle({
            strokeColor: '#536DFE',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#536DFE',
            fillOpacity: 0.35,
            map: this.map,
            center: this.userPosition,
            radius: this.filter.range
          });
    }
    else {
      this.circle.setCenter(this.userPosition)
      this.circle.setRadius(this.filter.range);
    }

    this.tempPlacesItems = new Array();

    if (!this.filter.range || this.filter.range === 0) {
      this.tempPlacesItems = this.placesItems
    }
    else {
      for (let place of this.placesItems) {
        this.getCoordinatesFromAdress(place.address).then((position) => {
          console.log('Distance between ' + position + ' : ' + this.distanceOnMap(this.userPosition, position))
          if (this.distanceOnMap(this.userPosition, position) > this.filter.range / 1000) {
            this.tempPlacesItems.splice(this.tempPlacesItems.indexOf(place), 1)
          }
        }, (err) => {
          console.log("Error at HomePage.filterByDistance() : " + err)
        });
      }
    }

    var copyTemp = Array<Object>()
    for (let place of this.tempPlacesItems) {
      let index = this.filter.activities.indexOf(place.type);

      if (index >= 0) {
        copyTemp.push(place)
      }
    }

    this.tempPlacesItems = copyTemp

    copyTemp = Array<Object>()

    for (let place of this.tempPlacesItems) {
      if (place.price === "Gratuit" || place.price.match(/\d+/g) <= this.filter.price) {
        copyTemp.push(place)
      }
    }

    this.tempPlacesItems = copyTemp

    if (this.tempPlacesItems.length === 0) {
      this.tempPlacesItems = undefined
    }
  }

  showElement(place) : void {
    this.navCtrl.push(ElementPage, {
      place: place,
      index: this.currentIndex
    });
  }

  showFilter() : void {
    this.events.subscribe('custom-user-events', (paramsVar) => {
      this.filter = paramsVar;
      this.filterByDistance();
      this.events.unsubscribe('custom-user-events');
    });

    this.navCtrl.push(FilterPage, {
      filter: this.filter
    });
  }

  addMarkerWithPlace(place) : void {
    this.getCoordinatesFromAdress(place.address).then((coord) => {
      this.addMarker(coord)
      this.map.panTo(new google.maps.LatLng(coord.lat, coord.lng))
    }, (err) => {
      console.log('Error at HomePage.addMarkerWithPlace() : ' + err)
    });
  }

  computeAverageNote() : void {
    for (let element of this.placesItems) {
      if (!isNaN(Number(element.price))) {
        element.price = element.price + "€"
      }

      if (!element.opinions) {
        element['averageNote'] = "Pas de notes"
        element['sumOpinions'] = "0"
      }
      else {
        let sum = 0

        for (let opinion of element.opinions) {
          sum += +opinion.note;
        }

        element['averageNote'] = +Math.round(sum / element.opinions.length)
        element['sumOpinions'] = element.opinions.length
      }
    }
  }

  slideChanged() : void {
    this.currentIndex = this.slides.getActiveIndex();
    this.addMarkerWithPlace(this.tempPlacesItems[this.currentIndex]);
  }

  loadMap() : void {
    this.geolocation.getCurrentPosition().then((position) => {
      let coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      this.userPosition = coordinates
      this.createMap(coordinates);
    }, (err) => {
      console.log('Error at HomePage.loadMap() : ' + err)
      this.createMap(this.DEFAULT_COORDINATES);
    })
  }

  createMap(coordinates: Coordinates) : void {
    let latLng = new google.maps.LatLng(coordinates.lat, coordinates.lng);

    let mapOptions = {
      center: latLng,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });

    this.userMarker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });
  }

  degreeToRad(input) : number {
    return (Math.PI * input) / 180;
  }

  distanceOnMap(position1: Coordinates, position2: Coordinates) {
    var R = 6371; // Radius of the earth in km
    let lat1 = position1.lat;
    let lon1 = position1.lng;
    let lat2 = position2.lat;
    let lon2 = position2.lng;
    var dLat = this.degreeToRad(lat2-lat1);  // deg2rad below
    var dLon = this.degreeToRad(lon2-lon1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.degreeToRad(lat1)) * Math.cos(this.degreeToRad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
  }

  /*distanceOnMap(position1: Coordinates, position2: Coordinates) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    let lat1 = position1.lat;
    let lon1 = position1.lng;
    let lat2 = position2.lat;
    let lon2 = position2.lng;
    var a = 0.5 - c((lat2 - lat1) * p)/2 +
            c(lat1 * p) * c(lat2 * p) *
            (1 - c((lon2 - lon1) * p))/2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }

  /*distanceOnMap(position1: Coordinates, position2: Coordinates) : number {
    let R = 6378000

    let lat_a = this.degreeToRad(position1.lat);
    let lon_a = this.degreeToRad(position1.lng);
    let lat_b = this.degreeToRad(position2.lat);
    let lon_b = this.degreeToRad(position2.lng);

    return R * (Math.PI/2 - Math.asin( Math.sin(lat_b) * Math.sin(lat_a) + Math.cos(lon_b - lon_a) * Math.cos(lat_b) * Math.cos(lat_a)))
  }*/

  getCoordinatesFromAdress(address: string) : Promise<any> {
    return new Promise((resolve, reject) => {
      this.nativeGeocoder.forwardGeocode(address)
      .then((coordinates: NativeGeocoderForwardResult) => {
        resolve({
          lat: coordinates[0].latitude,
          lng: coordinates[0].longitude
        })
      })
      .catch((err: any) => {
        console.log('Error at HomePage.getCoordinatesFromAdress() : ' + err)
        reject(err)
      });
    });
  }

  addMarker(coord: Coordinates) : void {
    var latLng = new google.maps.LatLng(coord.lat, coord.lng)

    this.marker.setPosition(latLng);
  }
}
