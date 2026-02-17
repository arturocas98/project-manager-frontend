import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UserRoutingModule } from "./user-routing.module";
import { UserListComponent } from "./pages/list/user-list.component";
import { UserCreateComponent } from "./pages/create/user-create.component";
import { UserEditComponent } from "./pages/edit/user-edit.component";

@NgModule({
  imports: [
    CommonModule,
    UserListComponent,
    UserCreateComponent,
    UserEditComponent,
    UserRoutingModule,
  ],
  declarations: [],
})
export class UserModule {}
