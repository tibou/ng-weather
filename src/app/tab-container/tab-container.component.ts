import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConditionsAndZip } from 'app/conditions-and-zip.type';

@Component({
  selector: 'app-tab-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-container.component.html',
  styleUrls: ['./tab-container.component.css']
})
export class TabContainerComponent<T> {

  @Input()
  data: T;

  @Input()
  contentRef: TemplateRef<any>;

}
