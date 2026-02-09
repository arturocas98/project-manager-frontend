import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToastModule} from "primeng/toast";
import {DialogModule} from "primeng/dialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {ModalAuthComponent} from "../auth/modal-auth/modal-auth.component";



@NgModule({
    declarations: [ModalAuthComponent],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        ConfirmDialogModule,
        ToastModule,
        DialogModule
    ],
    exports: [
        ModalAuthComponent
    ],
    providers: [
        ConfirmationService,
        MessageService,
    ]
})
export class ModalModule { }
