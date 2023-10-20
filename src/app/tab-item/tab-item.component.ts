import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConditionsAndZip } from 'app/conditions-and-zip.type';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tab-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tab-item.component.html',
  styleUrls: ['./tab-item.component.css']
})
export class TabItemComponent {

  @Input()
  public item: ConditionsAndZip;

  @Input()
  public srcUrl: string;

  @Output()
  public show = new EventEmitter<string>();

  showForecast() {
    this.show.emit(this.item.zip)
  }

}
