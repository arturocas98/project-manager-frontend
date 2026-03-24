import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Client, ClientRequest } from 'src/app/shared/models/client.model';
import { LocateResponse } from 'src/app/shared/models/locate.response';
import { AuthService } from 'src/app/core/service/auth.service';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ConfirmDialogModule,
    DropdownModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {
  clients = signal<Client[]>([]);
  loading = signal<boolean>(false);
  clientDialog = signal<boolean>(false);
  
  client: ClientRequest = this.getEmptyClient();
  selectedClientId: number | null = null;
  submitted = signal<boolean>(false);

  locations: LocateResponse[] = [];
  provinces: any[] = [];
  cantons: any[] = [];

  constructor(
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadLocations();
  }

  loadLocations() {
    this.authService.getLocations().subscribe({
      next: (res) => {
        // the API returns { "data": [...] } but ApiService & our map might unwrap it.
        this.locations = Array.isArray(res) ? res : (res as any).data || [];
        
        // Extract unique provinces
        const uniqueProvinces = [...new Set(this.locations.map(loc => loc.name_provinces))];
        this.provinces = uniqueProvinces.map(p => ({ label: p, value: p }));
      },
      error: () => console.error('Error loading locations')
    });
  }

  onProvinceChange() {
    // Re-calculate cantons when province changes
    if (!this.client.Provincia) {
      this.cantons = [];
      this.client.Canton = '';
      return;
    }
    
    // reset Canton if it doesn't belong to the new province
    this.client.Canton = '';
    
    const filteredCantons = this.locations
      .filter(loc => loc.name_provinces === this.client.Provincia)
      .map(loc => loc.name_canton);
      
    this.cantons = [...new Set(filteredCantons)].map(c => ({ label: c, value: c }));
  }

  loadClients() {
    this.loading.set(true);
    // The index returns a collection of resources, which might be in response.data or just an array directly based on AuthService implementation
    this.authService.getClients().subscribe({
      next: (res: any) => {
        // Handle Laravel JsonResource pagination or wrapping if necessary based on service definition
        if (res.data) {
          this.clients.set(res.data);
        } else if (Array.isArray(res)) {
           // sometimes AuthService returns an array directly because of map
           let mapped = res.map((item: any) => item.data ? item.data : item);
           this.clients.set(mapped);
        } else {
           this.clients.set([]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load clients', life: 3000 });
        this.loading.set(false);
      }
    });
  }

  getEmptyClient(): ClientRequest {
    return {
      Ruc: '',
      Nombre: '',
      Correo: '',
      Provincia: '',
      Canton: '',
      Telefono: ''
    };
  }

  openNew() {
    this.client = this.getEmptyClient();
    this.selectedClientId = null;
    this.submitted.set(false);
    this.clientDialog.set(true);
  }

  editClient(clientVar: Client) {
    this.client = {
      Ruc: clientVar.Ruc,
      Nombre: clientVar.Nombre,
      Correo: clientVar.Correo,
      Provincia: clientVar.Provincia,
      Canton: clientVar.Canton,
      Telefono: clientVar.Telefono
    };
    this.selectedClientId = clientVar.id;
    
    // Load cantons for the selected client's province
    if (this.client.Provincia) {
       const filteredCantons = this.locations
        .filter(loc => loc.name_provinces === this.client.Provincia)
        .map(loc => loc.name_canton);
       this.cantons = [...new Set(filteredCantons)].map(c => ({ label: c, value: c }));
    } else {
       this.cantons = [];
    }
    
    this.clientDialog.set(true);
  }

  deleteClient(clientVar: Client) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + clientVar.Nombre + '?',
      header: 'Confirm',
      icon: 'ph ph-warning',
      accept: () => {
        this.authService.deleteClient(clientVar.id).subscribe({
          next: () => {
            this.clients.update(clients => clients.filter(c => c.id !== clientVar.id));
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Client Deleted', life: 3000 });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete client', life: 3000 });
          }
        });
      }
    });
  }

  hideDialog() {
    this.clientDialog.set(false);
    this.submitted.set(false);
  }

  saveClient() {
    this.submitted.set(true);

    const isValid = this.client.Nombre?.trim() && 
                    this.client.Ruc?.trim() && 
                    this.client.Correo?.trim() && 
                    this.client.Telefono?.trim() && 
                    this.client.Provincia?.trim() && 
                    this.client.Canton?.trim();

    if (isValid) {
      if (this.selectedClientId) {
        this.authService.updateClient(this.selectedClientId, this.client).subscribe({
          next: (res: any) => {
            let updated = res.data ? res.data : res;
            this.clients.update(clients => {
              const index = clients.findIndex(c => c.id === this.selectedClientId);
              if (index !== -1) {
                const newArr = [...clients];
                newArr[index] = updated;
                return newArr;
              }
              return clients;
            });
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Client Updated', life: 3000 });
            this.clients.set([...this.clients()]); // trigger change detection if needed
            this.clientDialog.set(false);
            this.client = this.getEmptyClient();
          },
          error: () => {
             this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not update client', life: 3000 });
          }
        });
      } else {
        this.authService.createClient(this.client).subscribe({
          next: (res: any) => {
            let created = res.data ? res.data : res;
            this.clients.update(clients => [...clients, created]);
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Client Created', life: 3000 });
            this.clientDialog.set(false);
            this.client = this.getEmptyClient();
          },
          error: () => {
             this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not create client', life: 3000 });
          }
        });
      }
    }
  }
}
