import { Pipe, PipeTransform } from '@angular/core';
import { KanbanColumn } from '../models/kanban.models';

@Pipe({
  standalone: true,
  name: 'totalTasks'
})
export class TotalTasksPipe implements PipeTransform {
  transform(columns: KanbanColumn[]): number {
    return columns?.reduce((total, column) => total + column.tasks.length, 0) || 0;
  }
}
