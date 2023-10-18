import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConditionsAndZip } from 'app/conditions-and-zip.type';

@Component({
  selector: 'app-tab-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-item.component.html',
  styleUrls: ['./tab-item.component.css']
})
export class TabItemComponent {

  @Input()
  private item: ConditionsAndZip;

  @Output()
  private show = new EventEmitter<string>();

  @Output()
  private remove= new EventEmitter<string>();



}
