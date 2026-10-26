import { Component, inject, signal, OnInit, EventEmitter, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // 👈 Añadir Router
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule, MatTooltipModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  user = this.authService.getUser();
  isDarkMode = signal(false);

  @Output() dateRangeChanged = new EventEmitter<string>();

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    this.setDarkMode(savedTheme === 'dark');
  }

  toggleTheme() {
    this.setDarkMode(!this.isDarkMode());
  }

  private setDarkMode(isDark: boolean) {
    this.isDarkMode.set(isDark);
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  onDateFilter(range: string) {
    this.dateRangeChanged.emit(range);
  }

  initials(): string {
    const name = this.user?.name || 'U';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  logout() {
    this.authService.logout();
  }
}