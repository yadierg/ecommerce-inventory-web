import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe, NgClass, UpperCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu'; // 👈 IMPORTACIÓN CLAVE
import { MatButtonModule } from '@angular/material/button'; // 👈 NECESARIO PARA EL BOTÓN
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

import { WarehousesService } from '../../core/services/warehouses.service';
import { StocksService } from '../../core/services/stocks.service';
import { MovementsService } from '../../core/services/movements.service';
import { SuppliersService } from '../../core/services/suppliers.service';
import { PurchaseOrdersService } from '../../core/services/purchase-orders.service';
import { Movement } from '../../core/models/movement.model';
import { Stock } from '../../core/models/stock.model';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
  change?: number;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatMenuModule,      // 👈 AÑADIDO
    MatButtonModule,    // 👈 AÑADIDO
    DecimalPipe,
    DatePipe,
    NgClass,
    UpperCasePipe,
    BaseChartDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private warehousesSvc = inject(WarehousesService);
  private stocksSvc = inject(StocksService);
  private movementsSvc = inject(MovementsService);
  private suppliersSvc = inject(SuppliersService);
  private purchaseOrdersSvc = inject(PurchaseOrdersService);

  loading = signal(true);
  cards = signal<StatCard[]>([]);
  recentMovements = signal<Movement[]>([]);
  lowStockAlerts = signal<Stock[]>([]);
  
  // Filtro de fechas
  currentRange = signal('30d');
  currentRangeLabel = signal('Últimos 30 días');

  movementColumns = ['type', 'product', 'quantity', 'date'];

  // Configuración del Gráfico de Líneas
  public lineChartData = signal<ChartData<'line'>>({
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Movimientos',
        borderColor: '#C91147',
        backgroundColor: 'rgba(201, 17, 71, 0.1)',
        pointBackgroundColor: '#C91147',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#C91147',
        fill: 'origin',
        tension: 0.4,
      }
    ]
  });

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
      y: { 
        border: { display: false }, 
        grid: { color: '#f3f4f6' }, 
        ticks: { color: '#9ca3af' } 
      }
    }
  };

  // Configuración del Gráfico Donut
  public donutChartData = signal<ChartData<'doughnut'>>({
    labels: ['Disponible', 'Stock Bajo', 'Agotado'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  });

  public donutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        cornerRadius: 8,
      }
    }
  };

  ngOnInit() {
    this.loadData();
  }

  setRange(range: string) {
    this.currentRange.set(range);
    const labels: any = { '7d': 'Últimos 7 días', '30d': 'Últimos 30 días', '90d': 'Últimos 90 días' };
    this.currentRangeLabel.set(labels[range]);
    // Aquí podrías recargar los datos si el backend soportara filtros de fecha
    // this.loadData(range);
  }

  loadData() {
    const safe = <T>(obs: any) => obs.pipe(catchError(() => of(null)));

    forkJoin({
      warehouses: safe(this.warehousesSvc.stats()),
      stocks: safe(this.stocksSvc.stats()),
      movements: safe(this.movementsSvc.stats()),
      suppliers: safe(this.suppliersSvc.stats()),
      purchaseOrders: safe(this.purchaseOrdersSvc.stats()),
      recentMovements: safe(this.movementsSvc.findAll()),
      allStocks: safe(this.stocksSvc.findAll({ limit: 1000 } as any)), 
    }).subscribe({
      next: (r: any) => {
        this.cards.set([
          {
            label: 'Almacenes',
            value: r.warehouses?.total ?? 0,
            icon: 'warehouse',
            color: '#3b82f6',
            route: '/warehouses',
          },
          {
            label: 'Productos en stock',
            value: r.stocks?.total ?? 0,
            icon: 'inventory',
            color: '#10b981',
            route: '/stocks',
          },
          {
            label: 'Movimientos',
            value: r.movements?.total ?? 0,
            icon: 'swap_horiz',
            color: '#C91147',
            route: '/movements',
          },
          {
            label: 'Proveedores',
            value: r.suppliers?.total ?? 0,
            icon: 'business',
            color: '#8b5cf6',
            route: '/suppliers',
          },
        ]);

        // Gráfico Donut
        if (r.allStocks && r.allStocks.data) {
          const stocks = r.allStocks.data;
          let outOfStock = 0;
          let lowStock = 0;
          let available = 0;

          stocks.forEach((s: any) => {
            if (s.quantity === 0) {
              outOfStock++;
            } else if (s.minStock && s.minStock > 0 && s.quantity <= s.minStock) {
              lowStock++;
            } else {
              available++;
            }
          });

          this.donutChartData.update(data => {
            data.datasets[0].data = [available, lowStock, outOfStock];
            return { ...data };
          });
        }

        // Movimientos recientes
        if (r.recentMovements) {
          if (Array.isArray(r.recentMovements)) {
            this.recentMovements.set(r.recentMovements.slice(0, 5));
          } else if (r.recentMovements.data) {
            this.recentMovements.set(r.recentMovements.data.slice(0, 5));
          }
        }

        // Alertas de bajo stock
        if (r.allStocks && r.allStocks.data) {
          const alerts = r.allStocks.data.filter((s: any) => {
            return s.quantity === 0 || (s.minStock && s.minStock > 0 && s.quantity <= s.minStock);
          }).sort((a: any, b: any) => a.quantity - b.quantity);
          
          this.lowStockAlerts.set(alerts.slice(0, 4));
        }

        this.generateMockLineChart();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private generateMockLineChart() {
    const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const data = [12, 19, 15, 25, 22, 30, 28];
    
    this.lineChartData.update(chart => {
      chart.labels = labels;
      chart.datasets[0].data = data;
      return { ...chart };
    });
  }
}