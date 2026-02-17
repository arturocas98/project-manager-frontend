import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotfoundRoutingModule } from './notfound-routing.module';
import { NotfoundComponent } from './notfound.component';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        NotfoundRoutingModule,
        ButtonModule,
        TranslateModule,
    ],
    declarations: [NotfoundComponent]
})
export class NotfoundModule { }
