import { Component, ViewChild, ElementRef, NgModule, Injectable } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { FirebaseProvider } from './../../providers/firebase/firebase';
import { AngularFireList } from 'angularfire2/database';
import { NativeGeocoder, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';

declare var google;

export interface PlaceData {
  name: string,
  address: string
}
export interface Coordinates {
  lat: number,
  lng: number
}

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

  placesItems: any;
  newItem = '';
  map: any;
  markers: any;

  constructor(public firebaseProvider: FirebaseProvider, public navCtrl: NavController, public geolocation: Geolocation, public nativeGeocoder: NativeGeocoder) {
    this.placesItems = this.firebaseProvider.getPlacesItems();
  }

  getObjectWithoutKnowingKey(data) {
    let objects = [];

    for (var propName in data) {
        if (data.hasOwnProperty(propName)) {
            objects.push(data[propName]);
        }
    }

    return objects;
  }

  addItem() {
    this.firebaseProvider.addItem(this.newItem);
  }

  removeItem(id) {
    this.firebaseProvider.removeItem(id);
  }

  ionViewDidLoad() {
    this.loadMap();
  }

  addMarkerWithPlace(place: PlaceData) {
    this.getCoordinatesFromAdress(place.address).then((coord) => {
      this.addMarker(coord);
    }, (err) => {
      console.log('Error at HomePage.addMarkerWithPlace() : ' + err)
    });
  }

  slideChanged() {
    let currentIndex = this.slides.getActiveIndex();
    let array = this.getObjectWithoutKnowingKey(this.placesItems);
    this.addMarkerWithPlace(array[currentIndex]);
  }

  loadMap() : void {
    this.geolocation.getCurrentPosition().then((position) => {
      this.createMap(position.coords.latitude, position.coords.longitude);
    }, (err) => {
      this.createMap(43.697233, 7.27023650000001);
    })
  }

  createMap(lat: number, lng: number) : void {
    let latLng = new google.maps.LatLng(lat, lng);

    let mapOptions = {
      center: latLng,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

  getCoordinatesFromAdress(address: string) : Promise<any> {
    return new Promise((resolve, reject) => {
      this.nativeGeocoder.forwardGeocode(address)
      .then((coordinates: NativeGeocoderForwardResult) => {
        resolve({
          lat: coordinates[0].latitude,
          lng: coordinates[0].longitude
        })
      })
      .catch((error: any) => {
        reject(error)
      });
    });
  }

  addMarker(coord: Coordinates) : void {
    if (coord === undefined) {
      let val1 = Math.floor(Math.random()*90);
      let val2 = Math.floor(Math.random()*90);

      coord = {
        lat: val1,
        lng: val2
      }
    }

    var myLatLng = new google.maps.LatLng(coord.lat, coord.lng)

    if (this.markers === undefined) {
      this.markers = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: myLatLng
      });
    }
    else {
      this.markers.setPosition(myLatLng);
    }
  }
}
