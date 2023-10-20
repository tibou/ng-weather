import { Injectable, Signal, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { CurrentConditions } from './current-conditions/current-conditions.type';
import { ConditionsAndZip } from './conditions-and-zip.type';
import { Forecast } from './forecasts-list/forecast.type';
import { LocationService } from './location.service';
import { CacheService } from './cache.service';

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
  private timeout;
  timeout$ = new BehaviorSubject<string>('');

  constructor(private http: HttpClient, private locationService: LocationService, private cacheService: CacheService) {

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
      this.cacheService.cacheData(CACHE_TIMEOUT, data);
    })

  }

  addCurrentConditions(zipcode: string): void {

    if (this.cacheService.isNotCached(`${zipcode}_${CONDITIONS_SUFFIX}`) ||
      this.cacheService.isExpired(`${zipcode}_${CONDITIONS_SUFFIX}_${TIME_SUFFIX}`, this.timeout)
    ) {
      // Here we make a request to get the current conditions data from the API. Note the use of backticks and an expression to insert the zipcode
      this.http.get<CurrentConditions>(`${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`)
        .subscribe(data => {

          this.currentConditions.mutate(conditions => {
            let exists: boolean = false;
            for (let i in conditions) {
              if (conditions[i].zip == zipcode) {
                exists = true;
                conditions[i] = { zip: zipcode, data };
                //remove cache
                this.cacheService.remove(`${zipcode}_${CONDITIONS_SUFFIX}`, `${zipcode}_${CONDITIONS_SUFFIX}_${TIME_SUFFIX}`);
              }
            }
            if (!exists) {
              conditions.push({ zip: zipcode, data });
            }

            // cache data
            this.cacheService.cacheDataAndTimestamp(`${zipcode}_${CONDITIONS_SUFFIX}`, `${zipcode}_${CONDITIONS_SUFFIX}_${TIME_SUFFIX}`, JSON.stringify(data))
          });
        });
    } else {
      let cacheCondition: CurrentConditions = JSON.parse(this.cacheService.getCacheData(`${zipcode}_${CONDITIONS_SUFFIX}`));
      this.currentConditions.mutate(conditions => {
        let exists: boolean = false;
        for (let i in conditions) {
          if (conditions[i].zip == zipcode) {
            exists = true;
          }
        }
        if (!exists) {
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
          // remove cached data
          this.cacheService.remove(`${zipcode}_${CONDITIONS_SUFFIX}`, `${zipcode}_${CONDITIONS_SUFFIX}_${TIME_SUFFIX}`, `${zipcode}_${FORECAST_SUFFIX}`, `${zipcode}_${FORECAST_SUFFIX}_${TIME_SUFFIX}`);
        }
      }
    })
  }

  getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  getForecast(zipcode: string): Observable<Forecast> {

    // Check cache
    if (this.cacheService.isCached(`${zipcode}_${FORECAST_SUFFIX}`) && this.cacheService.isNotExpired(`${zipcode}_${FORECAST_SUFFIX}_${TIME_SUFFIX}`, this.timeout)) {
      let cacheForecast: Forecast = JSON.parse(this.cacheService.getCacheData(`${zipcode}_${FORECAST_SUFFIX}`));
      return of(cacheForecast)
    }
    // Here we make a request to get the forecast data from the API. Note the use of backticks and an expression to insert the zipcode
    return this.http.get<Forecast>(`${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`)
      .pipe(tap((data: Forecast) => {
        this.cacheService.remove(`${zipcode}_${FORECAST_SUFFIX}`, `${zipcode}_${FORECAST_SUFFIX}_${TIME_SUFFIX}`); // remove old cache
        this.cacheService.cacheDataAndTimestamp(`${zipcode}_${FORECAST_SUFFIX}`, `${zipcode}_${FORECAST_SUFFIX}_${TIME_SUFFIX}`, JSON.stringify(data)); // cache forecast
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

