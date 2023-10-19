import { Injectable, OnInit, Signal, computed, effect, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { CurrentConditions } from './current-conditions/current-conditions.type';
import { ConditionsAndZip } from './conditions-and-zip.type';
import { Forecast } from './forecasts-list/forecast.type';
import { LocationService } from './location.service';

export const CONDITIONS_SUFFIX: string = "con";
export const FORECAST_SUFFIX: string = "for";
export const TIME_SUFFIX: string = "timestamp";
export const CACHE_TIMEOUT: string = "cachetimeout";

@Injectable()
export class WeatherService {

  static URL = 'http://api.openweathermap.org/data/2.5';
  static APPID = '5a4b2d457ecbef9eb2a71e480b947604';
  static ICON_URL = 'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';
  private currentConditions = signal<ConditionsAndZip[]>([]);
  private cacheForecast: Forecast;
  private timeout;
  timeout$ = new BehaviorSubject<string>('');

  locationService = inject(LocationService);


  constructor(private http: HttpClient) {

    this.locationService.locations$.subscribe(
      (data) => {
        let index = data.slice(0, 1);
        if (index !== '-') { // It is not a deletion
          this.addCurrentConditions(data);
        } else {
          this.removeCurrentConditions(data.slice(1));
        }
      }
    );

    this.timeout$.subscribe(data => {
      this.timeout = +data * 1000
      localStorage.setItem(CACHE_TIMEOUT, data);
    })

    //this.timeout = +localStorage.getItem(CACHE_TIMEOUT) * 1000;
  }

  addCurrentConditions(zipcode: string): void {

    if (!localStorage.getItem(`${zipcode}_${CONDITIONS_SUFFIX}`) ||
      ((new Date().valueOf() - (+localStorage.getItem(`${zipcode}_${CONDITIONS_SUFFIX}_${TIME_SUFFIX}`))) >= this.timeout
      )) {
      // Here we make a request to get the current conditions data from the API. Note the use of backticks and an expression to insert the zipcode
      this.http.get<CurrentConditions>(`${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`)
        .subscribe(data => {

          this.currentConditions.mutate(conditions => {
            let temoin: boolean = false;
            for (let i in conditions) {
              if (conditions[i].zip == zipcode) {
                temoin = true;
                conditions[i] = { zip: zipcode, data };
                localStorage.removeItem(`${zipcode}_${CONDITIONS_SUFFIX}`);
                localStorage.removeItem(`${zipcode}_${CONDITIONS_SUFFIX}_${TIME_SUFFIX}`);
              }
            }
            if (temoin === false) {
              conditions.push({ zip: zipcode, data });
            }

            // caching data
            localStorage.setItem(`${zipcode}_${CONDITIONS_SUFFIX}`, JSON.stringify(data));
            // cahe current timestamp
            localStorage.setItem(`${zipcode}_${CONDITIONS_SUFFIX}_${TIME_SUFFIX}`, String(new Date().valueOf()));
          });
        });
    } else {
      let cacheCondition: CurrentConditions = JSON.parse(localStorage.getItem(`${zipcode}_${CONDITIONS_SUFFIX}`));
      this.currentConditions.mutate(conditions => {
        let temoin: boolean = false;
        for (let i in conditions) {
          if (conditions[i].zip == zipcode) {
            temoin = true;
          }
        }
        if (temoin === false) {
          conditions.push({ zip: zipcode, data: cacheCondition })
        }

      });

    }

  }

  removeCurrentConditions(zipcode: string) {
    this.currentConditions.mutate(conditions => {
      for (let i in conditions) {
        if (conditions[i].zip == zipcode) {
          conditions.splice(+i, 1);
          localStorage.removeItem(`${zipcode}_${CONDITIONS_SUFFIX}`);
          localStorage.removeItem(`${zipcode}_${CONDITIONS_SUFFIX}_${TIME_SUFFIX}`);
          localStorage.removeItem(`${zipcode}_${FORECAST_SUFFIX}`);
          localStorage.removeItem(`${zipcode}_${FORECAST_SUFFIX}_${TIME_SUFFIX}`);
        }
      }
    })
  }

  getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  getForecast(zipcode: string): Observable<Forecast> {

    // Check cache
    let cacheForecastString = localStorage.getItem(`${zipcode}_${FORECAST_SUFFIX}`);
    if (localStorage.getItem(`${zipcode}_${FORECAST_SUFFIX}`) &&
      (new Date().valueOf() - (+localStorage.getItem(`${zipcode}_${FORECAST_SUFFIX}_${TIME_SUFFIX}`))) < this.timeout
    ) {
      let cacheForecast: Forecast = JSON.parse(cacheForecastString);
      return of(cacheForecast)
    }
    // Here we make a request to get the forecast data from the API. Note the use of backticks and an expression to insert the zipcode
    return this.http.get<Forecast>(`${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`)
      .pipe(tap((data: Forecast) => {
        localStorage.removeItem(`${zipcode}_${FORECAST_SUFFIX}`);
        localStorage.removeItem(`${zipcode}_${FORECAST_SUFFIX}_${TIME_SUFFIX}`);

        localStorage.setItem(`${zipcode}_${FORECAST_SUFFIX}`, JSON.stringify(data));  // cache forecast
        localStorage.setItem(`${zipcode}_${FORECAST_SUFFIX}_${TIME_SUFFIX}`, String(new Date().valueOf())); // cahe current timestamp
      }));

  }

  getWeatherIcon(id): string {
    if (id >= 200 && id <= 232)
      return WeatherService.ICON_URL + "art_storm.png";
    else if (id >= 501 && id <= 511)
      return WeatherService.ICON_URL + "art_rain.png";
    else if (id === 500 || (id >= 520 && id <= 531))
      return WeatherService.ICON_URL + "art_light_rain.png";
    else if (id >= 600 && id <= 622)
      return WeatherService.ICON_URL + "art_snow.png";
    else if (id >= 801 && id <= 804)
      return WeatherService.ICON_URL + "art_clouds.png";
    else if (id === 741 || id === 761)
      return WeatherService.ICON_URL + "art_fog.png";
    else
      return WeatherService.ICON_URL + "art_clear.png";
  }

}

