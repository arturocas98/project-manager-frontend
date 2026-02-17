import { Component, Input } from "@angular/core";
import { Project } from "src/app/shared/models/project";
import { AvatarModule } from "primeng/avatar";
import { CardModule } from "primeng/card";

@Component({
  selector: "app-project-card",
  standalone: true,
  imports: [CardModule, AvatarModule],
  templateUrl: "./project-card.component.html",
  styleUrls: ["./project-card.component.scss"],
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: Project;
}
