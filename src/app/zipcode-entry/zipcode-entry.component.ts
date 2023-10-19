import { Component } from '@angular/core';
import { LocationService } from "../location.service";
import { CACHE_TIMEOUT, WeatherService } from 'app/weather.service';

@Component({
  selector: 'app-zipcode-entry',
  templateUrl: './zipcode-entry.component.html'
})
export class ZipcodeEntryComponent {

  timeout = '7200';


  constructor(private service: LocationService, private weatherService: WeatherService) {
    if (localStorage.getItem(CACHE_TIMEOUT)) {
      this.weatherService.timeout$.next(localStorage.getItem(CACHE_TIMEOUT))
      this.timeout = localStorage.getItem(CACHE_TIMEOUT);
    } else {
      this.weatherService.timeout$.next(String(this.timeout));
    }
  }

  addLocation(zipcode: string) {
    this.service.addLocation(zipcode);
  }

  saveTimeout(event: any) {
    //localStorage.setItem(CACHE_TIMEOUT, event.target.value);
    this.weatherService.timeout$.next(event.target.value)
  }
}
