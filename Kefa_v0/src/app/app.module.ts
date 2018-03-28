import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { ElementPage } from "../pages/element/element";
import { FilterPage } from "../pages/filter/filter";
import { ConnectionPage } from "../pages/connection/connection";

import { Geolocation } from '@ionic-native/geolocation';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HttpModule } from '@angular/http';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import { FirebaseProvider } from './../providers/firebase/firebase';

const firebaseConfig = {
  apiKey: "AIzaSyAuTBzOtByEI3L4QLBFJiRr0kD2MXD5X9w",
  authDomain: "kefa-123.firebaseapp.com",
  databaseURL: "https://kefa-123.firebaseio.com",
  projectId: "kefa-123",
  storageBucket: "kefa-123.appspot.com",
  messagingSenderId: "799945490873"
}

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    ElementPage,
    FilterPage,
    ConnectionPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(firebaseConfig),
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    ElementPage,
    FilterPage,
    ConnectionPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    HomePage,
    Geolocation,
    FirebaseProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
  ]
})
export class AppModule {}
