import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValueJsonPipe } from './value-json.pipe';

@NgModule({
  declarations: [ValueJsonPipe],
  imports: [CommonModule],
  exports: [ValueJsonPipe],
})
export class PipeModule {}
