import { Component } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass} from "@angular/common";
import {DropdownModule} from "primeng/dropdown";
import {ButtonModule} from "primeng/button";
import {ChipsModule} from "primeng/chips";
import {InputTextareaModule} from "primeng/inputtextarea";

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    DropdownModule,
    ButtonModule,
    ChipsModule,
    InputTextareaModule
  ],
  templateUrl: './task-create.component.html',
})
export class TaskCreateComponent {
  loading = false;

  priorities = [
    { label: 'Alta', value: 'high' },
    { label: 'Media', value: 'medium' },
    { label: 'Baja', value: 'low' }
  ];

  types = [
    { label: 'Epic', value: 'epic' },
    { label: 'History', value: 'history' },
    { label: 'Task', value: 'task' },
    { label: 'Subtask', value: 'subtask' }
  ];

  taskForm = this.fb.group({
    name: ['', Validators.required],
    title: ['', Validators.required],
    description: ['', Validators.required],
    priority: [null, Validators.required],
    type: [null, Validators.required]
  });

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    console.log(this.taskForm.value);

    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
}
