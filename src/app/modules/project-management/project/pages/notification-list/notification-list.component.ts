import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject, takeUntil} from "rxjs";
import {ProjectService} from "../../../../../core/service/project.service";
import {Router} from "@angular/router";
import {Notification} from "../../../../../shared/models/notification-models/Notification-model";
import {CommonModule, NgForOf, NgIf, SlicePipe, NgClass} from "@angular/common";
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgForOf,
    NgClass,
    ButtonModule,
    RippleModule,
    SlicePipe
  ],
  templateUrl: './notification-list.component.html',
})
export class NotificationListComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading: boolean = false;
  selectedNotification: Notification | null = null;
  showDetails: boolean = false;
  detailLoading: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  get isMobile(): boolean {
    return window.innerWidth < 768;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.loading = true;
    this.projectService.getAllNotification()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.notifications = data;
          console.log(this.notifications);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          this.loading = false;
        }
      });
  }

  openNotification(notification: Notification, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.selectedNotification = notification;
    this.showDetails = true;

    this.loadNotificationDetails(notification);
  }

  loadNotificationDetails(notification: Notification): void {
    const notificationId = (notification as any).id;

    if (!notificationId) {
      console.warn('Notification ID not found');
      return;
    }

    this.detailLoading = true;
    this.projectService.getNotification(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detailedNotification) => {
          this.selectedNotification = detailedNotification;
          this.detailLoading = false;

          this.markAsRead(notificationId);

        },
        error: (error) => {
          console.error('Error loading notification details:', error);
          this.detailLoading = false;
        }
      });
  }

  markAsRead(notificationId: number): void {
    this.projectService.UpdateNotification(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const index = this.notifications.findIndex(n => (n as any).id === notificationId);
          if (index !== -1) {
          }
          this.loadNotifications();
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
  }

  navigateToLink(notification: Notification, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (notification.link) {
      this.router.navigate([notification.link]);
      this.closeDetails();
    }
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedNotification = null;
  }

  getTimeAgo(date?: Date | string | number): string {
    if (!date) return 'Recientemente';

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return 'Recientemente';

    const now = new Date();
    const diffMs = now.getTime() - parsedDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return parsedDate.toLocaleDateString();
  }
}
