export interface ProductionMetrics {
  date: string;
  volume: number;
  orders: number;
  onTimeDelivery: number;
  qualityRate: number;
  plantUtilization: number;
}

export interface QualityAnalytics {
  grade: string;
  passed: number;
  failed: number;
  total: number;
  passRate: number;
}

export interface ClientAnalytics {
  name: string;
  orderCount: number;
  totalVolume: number;
  percentage: number;
  avgOrderSize: number;
}

export interface KPISummary {
  totalVolume: number;
  totalOrders: number;
  avgDeliveryTime: number;
  qualityRate: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  onTimeDeliveryRate: number;
  plantUtilization: number;
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  period: '24hours' | '7days' | '30days' | '90days' | 'custom';
  metric: 'volume' | 'orders' | 'onTime' | 'quality';
  clientFilter?: string;
  gradeFilter?: string;
}

class AnalyticsService {
  private readonly baseUrl = '/api/analytics'; // Mock API endpoint

  /**
   * Get production metrics for the specified period
   */
  async getProductionMetrics(filters: ReportFilters): Promise<ProductionMetrics[]> {
    // Mock data - replace with actual API call
    const mockData: ProductionMetrics[] = [
      { date: '2024-01-01', volume: 85, orders: 12, onTimeDelivery: 92, qualityRate: 96, plantUtilization: 68 },
      { date: '2024-01-02', volume: 92, orders: 15, onTimeDelivery: 88, qualityRate: 94, plantUtilization: 73 },
      { date: '2024-01-03', volume: 78, orders: 10, onTimeDelivery: 95, qualityRate: 98, plantUtilization: 62 },
      { date: '2024-01-04', volume: 105, orders: 18, onTimeDelivery: 90, qualityRate: 93, plantUtilization: 84 },
      { date: '2024-01-05', volume: 88, orders: 14, onTimeDelivery: 93, qualityRate: 97, plantUtilization: 70 },
      { date: '2024-01-06', volume: 96, orders: 16, onTimeDelivery: 87, qualityRate: 95, plantUtilization: 76 },
      { date: '2024-01-07', volume: 112, orders: 20, onTimeDelivery: 94, qualityRate: 96, plantUtilization: 89 }
    ];

    // Apply date filtering
    const filteredData = mockData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= filters.startDate && itemDate <= filters.endDate;
    });

    return filteredData;
  }

  /**
   * Get quality analytics by concrete grade
   */
  async getQualityAnalytics(filters: ReportFilters): Promise<QualityAnalytics[]> {
    const mockData: QualityAnalytics[] = [
      { grade: '20MPa', passed: 45, failed: 2, total: 47, passRate: 95.7 },
      { grade: '25MPa', passed: 38, failed: 1, total: 39, passRate: 97.4 },
      { grade: '30MPa', passed: 32, failed: 3, total: 35, passRate: 91.4 },
      { grade: '35MPa', passed: 28, failed: 1, total: 29, passRate: 96.6 },
      { grade: '40MPa', passed: 15, failed: 0, total: 15, passRate: 100.0 }
    ];

    if (filters.gradeFilter) {
      return mockData.filter(item => item.grade === filters.gradeFilter);
    }

    return mockData;
  }

  /**
   * Get client analytics and distribution
   */
  async getClientAnalytics(filters: ReportFilters): Promise<ClientAnalytics[]> {
    const mockData: ClientAnalytics[] = [
      { name: 'Housing Projects', orderCount: 28, totalVolume: 450, percentage: 35, avgOrderSize: 16.1 },
      { name: 'Commercial Buildings', orderCount: 22, totalVolume: 380, percentage: 28, avgOrderSize: 17.3 },
      { name: 'Infrastructure', orderCount: 18, totalVolume: 290, percentage: 22, avgOrderSize: 16.1 },
      { name: 'Residential Private', orderCount: 12, totalVolume: 180, percentage: 15, avgOrderSize: 15.0 }
    ];

    if (filters.clientFilter) {
      return mockData.filter(item => 
        item.name.toLowerCase().includes(filters.clientFilter!.toLowerCase())
      );
    }

    return mockData;
  }

  /**
   * Get KPI summary for dashboard
   */
  async getKPISummary(filters: ReportFilters): Promise<KPISummary> {
    const productionData = await this.getProductionMetrics(filters);
    
    const totalVolume = productionData.reduce((sum, item) => sum + item.volume, 0);
    const totalOrders = productionData.reduce((sum, item) => sum + item.orders, 0);
    const avgQualityRate = productionData.reduce((sum, item) => sum + item.qualityRate, 0) / productionData.length;
    const avgOnTimeRate = productionData.reduce((sum, item) => sum + item.onTimeDelivery, 0) / productionData.length;
    const avgUtilization = productionData.reduce((sum, item) => sum + item.plantUtilization, 0) / productionData.length;

    return {
      totalVolume,
      totalOrders,
      avgDeliveryTime: 2.3, // Mock value
      qualityRate: avgQualityRate,
      weeklyGrowth: 8.5, // Mock calculation
      monthlyGrowth: 12.3, // Mock calculation
      onTimeDeliveryRate: avgOnTimeRate,
      plantUtilization: avgUtilization
    };
  }

  /**
   * Export report data
   */
  async exportReport(
    format: 'pdf' | 'excel' | 'csv',
    filters: ReportFilters,
    includeCharts: boolean = true
  ): Promise<Blob> {
    // Mock implementation - in real app would generate actual files
    const data = {
      production: await this.getProductionMetrics(filters),
      quality: await this.getQualityAnalytics(filters),
      clients: await this.getClientAnalytics(filters),
      kpis: await this.getKPISummary(filters)
    };

    // Create mock export data
    let exportContent = '';
    
    switch (format) {
      case 'csv':
        exportContent = this.generateCSV(data);
        break;
      case 'excel':
        exportContent = JSON.stringify(data, null, 2);
        break;
      case 'pdf':
        exportContent = this.generatePDFContent(data);
        break;
    }

    return new Blob([exportContent], { 
      type: format === 'csv' ? 'text/csv' : 'application/octet-stream' 
    });
  }

  /**
   * Generate CSV content
   */
  private generateCSV(data: {
    production: ProductionMetrics[];
    quality: QualityAnalytics[];
    clients: ClientAnalytics[];
    kpis: KPISummary;
  }): string {
    let csv = 'ConcreTek Analytics Report\n\n';
    
    // Production data
    csv += 'Production Metrics\n';
    csv += 'Date,Volume (m³),Orders,On-Time %,Quality %,Plant Utilization %\n';
    data.production.forEach((item: ProductionMetrics) => {
      csv += `${item.date},${item.volume},${item.orders},${item.onTimeDelivery},${item.qualityRate},${item.plantUtilization}\n`;
    });
    
    csv += '\nQuality Analytics\n';
    csv += 'Grade,Passed,Failed,Total,Pass Rate %\n';
    data.quality.forEach((item: QualityAnalytics) => {
      csv += `${item.grade},${item.passed},${item.failed},${item.total},${item.passRate}\n`;
    });
    
    return csv;
  }

  /**
   * Generate PDF content (mock)
   */
  private generatePDFContent(data: {
    production: ProductionMetrics[];
    quality: QualityAnalytics[];
    clients: ClientAnalytics[];
    kpis: KPISummary;
  }): string {
    return `
ConcreTek Analytics Report
Generated: ${new Date().toISOString()}

EXECUTIVE SUMMARY
================
Total Volume: ${data.kpis.totalVolume}m³
Total Orders: ${data.kpis.totalOrders}
Quality Rate: ${data.kpis.qualityRate.toFixed(1)}%
On-Time Delivery: ${data.kpis.onTimeDeliveryRate.toFixed(1)}%

PRODUCTION ANALYSIS
==================
${data.production.map((item: ProductionMetrics) => 
  `${item.date}: ${item.volume}m³ (${item.orders} orders)`
).join('\n')}

QUALITY ANALYSIS
===============
${data.quality.map((item: QualityAnalytics) => 
  `${item.grade}: ${item.passRate.toFixed(1)}% pass rate (${item.passed}/${item.total})`
).join('\n')}
    `.trim();
  }

  /**
   * Get real-time production updates
   */
  async getRealTimeMetrics(): Promise<{
    currentVolume: number;
    ordersInProgress: number;
    plantUtilization: number;
    qualityAlerts: number;
  }> {
    // Mock real-time data
    return {
      currentVolume: 23.5,
      ordersInProgress: 7,
      plantUtilization: 78,
      qualityAlerts: 1
    };
  }

  /**
   * Get trend analysis
   */
  async getTrendAnalysis(metric: string, period: number): Promise<{
    trend: 'up' | 'down' | 'stable';
    changePercentage: number;
    prediction: number;
  }> {
    // Mock trend analysis
    const trends = {
      volume: { trend: 'up' as const, changePercentage: 8.5, prediction: 125 },
      orders: { trend: 'up' as const, changePercentage: 12.3, prediction: 18 },
      quality: { trend: 'stable' as const, changePercentage: 1.2, prediction: 96 },
      onTime: { trend: 'down' as const, changePercentage: -2.1, prediction: 89 }
    };

    return trends[metric as keyof typeof trends] || trends.volume;
  }
}

export const analyticsService = new AnalyticsService();