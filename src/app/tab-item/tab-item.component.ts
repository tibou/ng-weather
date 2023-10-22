import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
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
export class TabItemComponent<T> {

  @Input()
  public item: T;

  @Input()
  public templateRef: TemplateRef<any>;

}
