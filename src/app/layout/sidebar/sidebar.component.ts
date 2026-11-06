import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  // Controla qué submenús están abiertos
  expandedMenus = signal<Set<string>>(new Set(['Catálogo'])); // Abrimos Catálogo por defecto

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'space_dashboard', route: '/dashboard' },
    {
      label: 'Catálogo',
      icon: 'inventory_2',
      children: [
        { label: 'Categorías', icon: 'grid_view', route: '/categories' },
        { label: 'Tipos de Producto', icon: 'category', route: '/product-types' },
        { label: 'Materiales', icon: 'construction', route: '/materials' },
        { label: 'Productos', icon: 'shopping_bag', route: '/products' },
      ]
    },
    {
      label: 'Inventario',
      icon: 'warehouse',
      children: [
        { label: 'Almacenes', icon: 'store', route: '/warehouses' },
        { label: 'Stock', icon: 'inventory', route: '/stocks' },
        { label: 'Movimientos', icon: 'swap_horiz', route: '/movements' },
      ]
    },
    {
      label: 'Compras',
      icon: 'shopping_cart',
      children: [
        { label: 'Proveedores', icon: 'business', route: '/suppliers' },
        { label: 'Órdenes de Compra', icon: 'receipt_long', route: '/purchase-orders' },
      ]
    }
  ];

  toggleMenu(label: string) {
    this.expandedMenus.update(menus => {
      const newMenus = new Set(menus);
      if (newMenus.has(label)) {
        newMenus.delete(label);
      } else {
        newMenus.add(label);
      }
      return newMenus;
    });
  }

  isExpanded(label: string): boolean {
    return this.expandedMenus().has(label);
  }
}