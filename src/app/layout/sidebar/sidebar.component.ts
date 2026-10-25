import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'space_dashboard', route: '/dashboard' },
    { label: 'Almacenes', icon: 'warehouse', route: '/warehouses' },
    { label: 'Stock', icon: 'inventory_2', route: '/stocks' },
    { label: 'Movimientos', icon: 'swap_horiz', route: '/movements' },
    { label: 'Proveedores', icon: 'business', route: '/suppliers' },
    { label: 'Órdenes de compra', icon: 'shopping_cart', route: '/purchase-orders' },
  ];
}