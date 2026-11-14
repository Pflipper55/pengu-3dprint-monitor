import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MenuItem } from '@openng/optimus-ui/api';
import { MenuModule } from '@openng/optimus-ui/menu';
import { TabsModule } from '@openng/optimus-ui/tabs';
import { filter } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuModule, RouterLink, RouterOutlet, TabsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class Home {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly activeTab = signal(this.currentRoute());

  protected readonly navigationItems: MenuItem[] = [
    { label: 'Hardware', icon: 'pi pi-cog', routerLink: '/' },
  ];

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.activeTab.set(this.currentRoute()));
  }

  private currentRoute(): string {
    return this.router.url.split('?')[0].split('/').filter(Boolean).pop() || 'printers';
  }
}
