import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {ProjectListComponent} from "../../modules/project-management/project/pages/list/project-list.component";
import {CardModule} from "primeng/card";
import {AvatarModule} from "primeng/avatar";

@Component({
    templateUrl: './dashboard.component.html',
    standalone: true,
  imports: [CommonModule, ProjectListComponent, CardModule, AvatarModule],
})
export class DashboardComponent {

}
