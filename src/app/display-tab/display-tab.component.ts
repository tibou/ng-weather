import { Component, Signal, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from 'app/weather.service';
import { Router, RouterModule } from '@angular/router';
import { ConditionsAndZip } from 'app/conditions-and-zip.type';
import { TabItemComponent } from 'app/tab-item/tab-item.component';
import { LocationService } from 'app/location.service';
import { TabsComponent } from 'app/tabs/tabs.component';
import { TabContainerComponent } from 'app/tab-container/tab-container.component';

@Component({
  selector: 'app-display-tab',
  standalone: true,
  imports: [CommonModule, RouterModule, TabItemComponent, TabsComponent, TabContainerComponent],
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

  showForecast() {
    this.router.navigate(['/forecast', this.location().zip])
  }

  // this function is to create title propertie in conditions data to make them compliant with the TabsComponent
  tabsElements() {
    let arr = [];
    this.currentConditionsByZip().forEach(c => {
      arr.push({ ...c, 'title': `${c.data.name + ' (' + c.zip + ')'}` })
    });
    return arr;
  }

  changeTab(index: number) {
    this.location = signal(this.currentConditionsByZip()[index])
  }

  removeTab(index: number) {
    this.locationService.removeLocation(this.currentConditionsByZip()[index].zip);
  }
}

