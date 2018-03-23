import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { FirebaseProvider } from './../../providers/firebase/firebase';
import { NativeGeocoder, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';
import { ElementPage } from "../element/element";

declare var google;

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

  elementPage = ElementPage;

  placesItems: any;
  tempPlacesItems: any;
  map: any;
  marker: any;
  userPosition: Coordinates;
  range: number = undefined;
  currentIndex: number = 0;

  readonly defaultCoordinates: Coordinates = {
    lat: 43.697233,
    lng: 7.27023650000001
  };

  constructor(public firebaseProvider: FirebaseProvider, public navCtrl: NavController, public geolocation: Geolocation, public nativeGeocoder: NativeGeocoder) {

  }

  ionViewDidLoad() {
    this.userPosition = this.defaultCoordinates;
    this.loadMap();
    this.firebaseProvider.getPlacesItems().subscribe(res => {
      this.placesItems = res
      console.log('REUSSI')
      this.computeAverageNote();
      console.log('REUSSI1')
      this.addMarkerWithPlace(this.placesItems[0]);
      console.log('REUSSI2')
      this.filterByDistance()
      console.log('REUSSI3')
    }, err => {
      console.log("Error at HomePage.ionViewDidLoad() : " + err);
    });
  }

  filterByDistance() : void {
    console.log('filter')
    if (this.range === undefined) {
      this.tempPlacesItems = this.placesItems
    }
    else {
      this.tempPlacesItems = new Array();

      for (let place of this.placesItems) {
        this.getCoordinatesFromAdress(place.address).then((position) => {
          if (this.distanceOnMap(this.userPosition, position) < this.range) {
            this.tempPlacesItems.push(place)
          }
        }, (err) => {
          console.log("Error at HomePage.filterByDistance() : " + err)
        });
      }
    }
  }

  showElement(place) : void {
    this.navCtrl.push(ElementPage, {
      place: place,
      index: this.currentIndex
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
      if (element.opinions === undefined) {
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
    this.addMarkerWithPlace(this.placesItems[this.currentIndex]);
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
      this.createMap(this.defaultCoordinates);
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
  }

  degreeToRad(input) : number {
    return (Math.PI * input) / 180;
  }

  distanceOnMap(position1: Coordinates, position2: Coordinates) : number {
    let R = 6378000

    let lat_a = this.degreeToRad(position1.lat);
    let lon_a = this.degreeToRad(position1.lng);
    let lat_b = this.degreeToRad(position2.lat);
    let lon_b = this.degreeToRad(position2.lng);

    return R * (Math.PI/2 - Math.asin( Math.sin(lat_b) * Math.sin(lat_a) + Math.cos(lon_b - lon_a) * Math.cos(lat_b) * Math.cos(lat_a)))
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
