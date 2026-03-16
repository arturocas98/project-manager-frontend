import { Component, ElementRef, ViewChild, computed, OnInit, OnDestroy } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { getUserInitials } from "../../shared/helpers/functions.helper";
import { AuthService } from "../../core/service/auth.service";
import { Subject, takeUntil } from "rxjs";
import { ProjectService } from "../../core/service/project.service";
import { Notification } from "../../shared/models/notification-models/Notification-model";
@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopbarComponent implements OnInit, OnDestroy {

  value3: string | undefined;
  notifications: Notification[] = [];

  @ViewChild('menubutton') menuButton!: ElementRef;
  protected readonly profile = this.authService.profile;
  userInitials = computed(() => {
    const profile = this.profile();
    return profile?.name ? getUserInitials(profile.name) : '';
  });

  get unreadCount(): number {
    return this.notifications?.filter(n => !n.read).length || 0;
  }

  constructor(
    public layoutService: LayoutService,
    private authService: AuthService,
    private projectService: ProjectService,
  ) {
    console.log("LOHHH")}

  onMenuButtonClick() {
    this.layoutService.onMenuToggle();
  }

  onProfileButtonClick() {
    this.layoutService.showProfileSidebar();
  }


  ngOnInit(): void {
    this.loadNotifications();
  }

  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  loadNotifications(): void {
    this.projectService.getAllNotification()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.notifications = data;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
        }
      });
  }


}
