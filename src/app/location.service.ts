import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

export const LOCATIONS: string = "locations";

@Injectable()
export class LocationService {

  locations$ = new ReplaySubject<string>(100); // Only replay up to last one hundred cached elements

  constructor() {
    let locString = localStorage.getItem(LOCATIONS);
    if (locString) {
      let lcodes: string[] = JSON.parse(locString);
      for (let loc of lcodes)
        this.locations$.next(loc)
    }
  }

  addLocation(zipcode: string) {
    let locString = localStorage.getItem(LOCATIONS);

    if (locString) {
      let oldLocString: string[] = JSON.parse(locString);
      let index = oldLocString.indexOf(zipcode);
      if (index < 0) {
        oldLocString.push(zipcode);
        localStorage.setItem(LOCATIONS, JSON.stringify(oldLocString));
      }

    } else {
      let locations = [];
      locations.push(zipcode);
      localStorage.setItem(LOCATIONS, JSON.stringify(locations));
    }
    this.locations$.next(zipcode)
  }

  removeLocation(zipcode: string) {
    let locations = JSON.parse(localStorage.getItem(LOCATIONS));

    let index = locations.indexOf(zipcode);
    if (index !== -1) {
      locations.splice(index, 1);
      this.locations$.next(`-${zipcode}`);   // add a dash at front of the code mark that it is for deletion
    }

    localStorage.setItem(LOCATIONS, JSON.stringify(locations));

  }
}
