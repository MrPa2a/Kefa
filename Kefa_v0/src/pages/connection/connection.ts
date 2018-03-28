import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { UserData } from '../home/home';
import { FirebaseProvider } from './../../providers/firebase/firebase';

@IonicPage()
@Component({
  selector: 'page-connection',
  templateUrl: 'connection.html',
})
export class ConnectionPage {
  user: UserData;
  users: any;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  errorMessage: string;
  registration: boolean = false;

  constructor(public firebaseProvider: FirebaseProvider, public navCtrl: NavController, public navParams: NavParams, public events: Events) {
    this.user = this.navParams.get('user');
    this.firebaseProvider.getUserAccounts().subscribe(res => {
      this.users = res;
    }, err => {
      console.log("Error at ConnectionPage.constructor() : " + err);
    });
  }

  ionViewDidLoad() {

  }

  connectUser() {
    for (let user of this.users) {
      if (user.email === this.email && user.password === this.password) {
        this.user = user;

        this.navCtrl.pop().then(() => {
            this.events.publish('user-event', this.user);
        });
      }
      else {
        this.errorMessage = "Désolé, mais les informations ne correspondent à aucun compte."
      }
    }
  }

  registerUser() {
    let canRegister: boolean = true;
    let pattern: string = "[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})";

    if (this.email && this.firstName && this.lastName && this.password) {
      for (let user of this.users) {
        if (user.firstName === this.firstName && user.lastName === this.lastName) {
          this.errorMessage = "Cette combinaison prénom / nom est déjà utilisée.";
          canRegister = false;
        }
        if (user.email === this.email) {
          this.errorMessage = "Cette adresse mail est déjà utilisée.";
          canRegister = false;
        }
        if (!new RegExp(pattern).test(this.email)) {
          this.errorMessage = "Votre saisie n'est pas une adresse mail valide.";
          canRegister = false;
        }
      }

      if (this.password.length < 6) {
        this.errorMessage = "Votre mot de passe doit faire au moins 6 caractères.";
        canRegister = false;
      }

      if (canRegister) {
        let newUser: UserData = {
          email: this.email,
          firstName: this.firstName,
          lastName: this.lastName,
          password: this.password
        }

        this.firebaseProvider.registerUser(this.users.length, newUser).then(res => {
          this.navCtrl.pop().then(() => {
              this.events.publish('user-event', newUser);
          });
        }, err => {
          console.log('Error at ConnectionPage.registerUser() ' + err);
        })
      }
    }
    else {
      this.errorMessage = "Veuillez remplir tout les champs.";
    }
  }

  disconnectUser() {
    this.user = undefined;
    this.errorMessage = "Vous vous êtes bien déconnecté.";
    this.events.publish('user-event', this.user);
  }

}
