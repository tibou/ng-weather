import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConditionsAndZip } from 'app/conditions-and-zip.type';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent<T extends { title: string }> {


  @Input()
  elements: T[];

  @Output()
  onTabChange: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  onTabRemove: EventEmitter<number> = new EventEmitter<number>();

  activatedTab: number = 0;


  setTab(index: number) {
    this.activatedTab = index;
    this.onTabChange.emit(this.activatedTab);
  }

  removeTab(index: number) {
    this.onTabRemove.emit(index);
  }

}
