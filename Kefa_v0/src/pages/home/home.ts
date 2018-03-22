import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { FirebaseProvider } from './../../providers/firebase/firebase';
import { NativeGeocoder, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';

declare var google;

export interface PlaceData {
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
  map: any;
  marker: any;

  constructor(public firebaseProvider: FirebaseProvider, public navCtrl: NavController, public geolocation: Geolocation, public nativeGeocoder: NativeGeocoder) {
    this.firebaseProvider.getPlacesItems().subscribe(res => {
      this.placesItems = res
      console.log(this.placesItems)
      this.computeAverageNote();
      this.addMarkerWithPlace(this.placesItems[0]);

    }, err => {
      console.log("ERROR : " + err);
    });
  }

  ionViewDidLoad() {
    this.loadMap();
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
    console.log('compute ...')

    for (let element of this.placesItems) {
      element['averageNote'] = "Pas de notes"
      element['sumOpinions'] = "0"

      if (element.opinions != undefined) {
        let sum = 0

        for (let opinion of element.opinions) {
          sum += +opinion.note;
        }

        element['averageNote'] = sum / element.opinions.length
        element['sumOpinions'] = element.opinions.length
      }
    }
  }

  slideChanged() {
    let currentIndex = this.slides.getActiveIndex();
    this.addMarkerWithPlace(this.placesItems[currentIndex]);
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

    this.marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });
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
    var latLng = new google.maps.LatLng(coord.lat, coord.lng)

    this.marker.setPosition(latLng);
  }
}
