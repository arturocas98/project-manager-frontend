import { Component } from '@angular/core';
import {AvatarModule} from "primeng/avatar";
import {MultiSelectModule} from "primeng/multiselect";
import {NgClass} from "@angular/common";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {InputTextareaModule} from "primeng/inputtextarea";
import {ChipsModule} from "primeng/chips";

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [
    AvatarModule,
    MultiSelectModule,
    NgClass,
    ReactiveFormsModule,
    ButtonModule,
    InputTextareaModule,
    ChipsModule
  ],
  templateUrl: './project-create.component.html',
})
export class ProjectCreateComponent {
  constructor(private fb: FormBuilder) {}
  loading: boolean = false;

  projectForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    members: [[]]
  });

  users = [
    { id: 1, name: 'Juan Pérez', avatar: 'assets/users/juan.jpg' },
    { id: 2, name: 'María López', avatar: 'assets/users/maria.jpg' }
  ];
  onSubmit() {
    if (this.projectForm.valid) {
      console.log(this.projectForm.value);
    }
  }
}
