import { Component, inject, signal, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, NgClass } from '@angular/common'; // 👈 Añadido NgClass por si acaso
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field'; // 👈 FALTABA
import { MatInputModule } from '@angular/material/input'; // 👈 FALTABA

import { debounceTime, distinctUntilChanged, switchMap, startWith, of } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { GlobalSearchService, SearchResult } from '../../core/services/global-search.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    NgClass,
    MatIconModule, 
    MatButtonModule, 
    MatMenuModule, 
    MatDividerModule, 
    MatTooltipModule,
    MatAutocompleteModule,
    MatFormFieldModule, // 👈 Añadido
    MatInputModule,     // 👈 Añadido
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private searchService = inject(GlobalSearchService);
  
  user = this.authService.getUser();
  isDarkMode = signal(false);

  // Lógica del buscador
  searchControl = new FormControl('');
  searchResults$ = this.searchControl.valueChanges.pipe(
    startWith(''),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => this.searchService.search(query || ''))
  );

  @Output() toggleSidebar = new EventEmitter<void>();

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    this.setDarkMode(savedTheme === 'dark');
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
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

  onSelectResult(result: SearchResult) {
    this.router.navigateByUrl(result.route);
    this.searchControl.setValue('', { emitEvent: false });
  }

  initials(): string {
    const name = this.user?.name || 'U';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  logout() {
    this.authService.logout();
  }
}