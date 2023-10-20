import { Component, Signal, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from 'app/weather.service';
import { Router, RouterModule } from '@angular/router';
import { ConditionsAndZip } from 'app/conditions-and-zip.type';
import { TabItemComponent } from 'app/tab-item/tab-item.component';
import { LocationService } from 'app/location.service';

@Component({
  selector: 'app-display-tab',
  standalone: true,
  imports: [CommonModule, RouterModule, TabItemComponent],
  templateUrl: './display-tab.component.html',
  styleUrls: ['./display-tab.component.css']
})
export class DisplayTabComponent {

  private weatherService = inject(WeatherService);
  private router = inject(Router);
  protected locationService = inject(LocationService);
  protected currentConditionsByZip: Signal<ConditionsAndZip[]> = this.weatherService.getCurrentConditions();
  private location: Signal<ConditionsAndZip>; // To display just one condition

  constructor() {
    this.location = computed(() => this.currentConditionsByZip()[0]);
  }

  showForecast($event) {
    this.router.navigate(['/forecast', $event])
  }

  changeTab(zipcode: string) {
    for (let i in this.currentConditionsByZip()) {
      if (this.currentConditionsByZip()[i].zip == zipcode)
        this.location = signal(this.currentConditionsByZip()[i])
    }
  }
}

