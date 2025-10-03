export interface Truck {
  id: string;
  plateNumber: string;
  capacity: number;
  status: 'Available' | 'On Route' | 'Maintenance' | 'Out of Service';
  driver?: string;
  driverId?: string;
  location: string;
  lastService: string;
  nextService?: string;
  mileage?: number;
  fuelLevel?: number;
  model?: string;
  year?: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  license: string;
  licenseExpiry?: string;
  status: 'Active' | 'Off Duty' | 'On Leave' | 'Suspended';
  assignedTruck?: string;
  experience: string;
  address?: string;
  emergencyContact?: string;
  hireDate?: string;
  certifications?: string[];
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address?: string;
  category: 'Cement' | 'Aggregates' | 'Admixtures' | 'Fibers' | 'Equipment' | 'Services' | 'Other';
  status: 'Active' | 'Pending' | 'Inactive' | 'Blacklisted';
  registrationNumber?: string;
  taxNumber?: string;
  bankDetails?: string;
  paymentTerms?: string;
  creditLimit?: number;
  rating?: number;
  lastOrderDate?: string;
}

export interface FleetStatistics {
  totalTrucks: number;
  availableTrucks: number;
  trucksOnRoute: number;
  trucksInMaintenance: number;
  totalDrivers: number;
  activeDrivers: number;
  totalSuppliers: number;
  activeSuppliers: number;
  utilizationRate: number;
  maintenanceCost: number;
  fuelCost: number;
}

class FleetManagementService {
  private readonly apiUrl = '/api/fleet'; // Mock API endpoint

  /**
   * Get all trucks
   */
  async getTrucks(): Promise<Truck[]> {
    // Mock data - replace with actual API call
    return [
      {
        id: 'TRK-001',
        plateNumber: 'CA 123-456',
        capacity: 8,
        status: 'Available',
        driver: 'John Smith',
        driverId: 'DRV-001',
        location: 'Plant',
        lastService: '2024-09-15',
        nextService: '2024-12-15',
        mileage: 45000,
        fuelLevel: 85,
        model: 'Mercedes Actros',
        year: 2020
      },
      {
        id: 'TRK-002',
        plateNumber: 'CA 234-567',
        capacity: 10,
        status: 'On Route',
        driver: 'Mike Johnson',
        driverId: 'DRV-002',
        location: 'Site A',
        lastService: '2024-09-20',
        nextService: '2024-12-20',
        mileage: 52000,
        fuelLevel: 60,
        model: 'Volvo FMX',
        year: 2021
      }
    ];
  }

  /**
   * Add or update a truck
   */
  async saveTruck(truck: Truck): Promise<boolean> {
    try {
      // Mock implementation
      console.log('Saving truck:', truck);
      return true;
    } catch (error) {
      console.error('Error saving truck:', error);
      return false;
    }
  }

  /**
   * Delete a truck
   */
  async deleteTruck(truckId: string): Promise<boolean> {
    try {
      // Mock implementation
      console.log('Deleting truck:', truckId);
      return true;
    } catch (error) {
      console.error('Error deleting truck:', error);
      return false;
    }
  }

  /**
   * Get all drivers
   */
  async getDrivers(): Promise<Driver[]> {
    // Mock data
    return [
      {
        id: 'DRV-001',
        name: 'John Smith',
        phone: '+27 82 123 4567',
        email: 'john.smith@concretek.com',
        license: 'EC123456',
        licenseExpiry: '2026-05-15',
        status: 'Active',
        assignedTruck: 'TRK-001',
        experience: '5 years',
        address: '123 Main St, Cape Town',
        emergencyContact: '+27 82 999 8888',
        hireDate: '2019-03-15',
        certifications: ['Heavy Vehicle License', 'Hazmat Certified']
      },
      {
        id: 'DRV-002',
        name: 'Mike Johnson',
        phone: '+27 83 234 5678',
        email: 'mike.johnson@concretek.com',
        license: 'EC234567',
        licenseExpiry: '2025-08-20',
        status: 'Active',
        assignedTruck: 'TRK-002',
        experience: '8 years',
        address: '456 Oak Ave, Johannesburg',
        emergencyContact: '+27 83 777 6666',
        hireDate: '2016-07-10',
        certifications: ['Heavy Vehicle License', 'First Aid Certified']
      }
    ];
  }

  /**
   * Save driver
   */
  async saveDriver(driver: Driver): Promise<boolean> {
    try {
      console.log('Saving driver:', driver);
      return true;
    } catch (error) {
      console.error('Error saving driver:', error);
      return false;
    }
  }

  /**
   * Delete driver
   */
  async deleteDriver(driverId: string): Promise<boolean> {
    try {
      console.log('Deleting driver:', driverId);
      return true;
    } catch (error) {
      console.error('Error deleting driver:', error);
      return false;
    }
  }

  /**
   * Get all suppliers
   */
  async getSuppliers(): Promise<Supplier[]> {
    // Mock data
    return [
      {
        id: 'SUP-001',
        name: 'Cement Co Ltd',
        contact: 'Jane Doe',
        phone: '+27 86 567 8901',
        email: 'orders@cementco.co.za',
        address: '789 Industrial Rd, Durban',
        category: 'Cement',
        status: 'Active',
        registrationNumber: 'REG123456',
        taxNumber: 'TAX789012',
        paymentTerms: '30 days',
        creditLimit: 500000,
        rating: 4.5,
        lastOrderDate: '2024-09-28'
      },
      {
        id: 'SUP-002',
        name: 'Aggregate Supplies',
        contact: 'Tom Wilson',
        phone: '+27 87 678 9012',
        email: 'sales@aggregates.co.za',
        address: '321 Quarry Rd, Pretoria',
        category: 'Aggregates',
        status: 'Active',
        registrationNumber: 'REG234567',
        taxNumber: 'TAX890123',
        paymentTerms: '15 days',
        creditLimit: 300000,
        rating: 4.2,
        lastOrderDate: '2024-09-25'
      }
    ];
  }

  /**
   * Save supplier
   */
  async saveSupplier(supplier: Supplier): Promise<boolean> {
    try {
      console.log('Saving supplier:', supplier);
      return true;
    } catch (error) {
      console.error('Error saving supplier:', error);
      return false;
    }
  }

  /**
   * Delete supplier
   */
  async deleteSupplier(supplierId: string): Promise<boolean> {
    try {
      console.log('Deleting supplier:', supplierId);
      return true;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      return false;
    }
  }

  /**
   * Get fleet statistics
   */
  async getFleetStatistics(): Promise<FleetStatistics> {
    const trucks = await this.getTrucks();
    const drivers = await this.getDrivers();
    const suppliers = await this.getSuppliers();

    return {
      totalTrucks: trucks.length,
      availableTrucks: trucks.filter(t => t.status === 'Available').length,
      trucksOnRoute: trucks.filter(t => t.status === 'On Route').length,
      trucksInMaintenance: trucks.filter(t => t.status === 'Maintenance').length,
      totalDrivers: drivers.length,
      activeDrivers: drivers.filter(d => d.status === 'Active').length,
      totalSuppliers: suppliers.length,
      activeSuppliers: suppliers.filter(s => s.status === 'Active').length,
      utilizationRate: 78.5, // Mock calculation
      maintenanceCost: 125000, // Mock data
      fuelCost: 95000 // Mock data
    };
  }

  /**
   * Assign driver to truck
   */
  async assignDriverToTruck(driverId: string, truckId: string): Promise<boolean> {
    try {
      console.log(`Assigning driver ${driverId} to truck ${truckId}`);
      return true;
    } catch (error) {
      console.error('Error assigning driver to truck:', error);
      return false;
    }
  }

  /**
   * Unassign driver from truck
   */
  async unassignDriverFromTruck(driverId: string): Promise<boolean> {
    try {
      console.log(`Unassigning driver ${driverId} from truck`);
      return true;
    } catch (error) {
      console.error('Error unassigning driver from truck:', error);
      return false;
    }
  }

  /**
   * Update truck status
   */
  async updateTruckStatus(truckId: string, status: Truck['status'], location?: string): Promise<boolean> {
    try {
      console.log(`Updating truck ${truckId} status to ${status}`, location ? `at ${location}` : '');
      return true;
    } catch (error) {
      console.error('Error updating truck status:', error);
      return false;
    }
  }

  /**
   * Schedule maintenance
   */
  async scheduleMaintenance(truckId: string, maintenanceDate: string, description: string): Promise<boolean> {
    try {
      console.log(`Scheduling maintenance for truck ${truckId} on ${maintenanceDate}: ${description}`);
      return true;
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      return false;
    }
  }

  /**
   * Generate fleet report
   */
  async generateFleetReport(startDate: string, endDate: string): Promise<{
    truckUtilization: Record<string, number>;
    driverPerformance: Record<string, number>;
    maintenanceCosts: Record<string, number>;
    fuelConsumption: Record<string, number>;
  }> {
    // Mock report data
    return {
      truckUtilization: {
        'TRK-001': 85.2,
        'TRK-002': 92.1,
        'TRK-003': 67.8,
        'TRK-004': 78.9
      },
      driverPerformance: {
        'DRV-001': 94.5,
        'DRV-002': 88.2,
        'DRV-003': 91.7,
        'DRV-004': 86.3
      },
      maintenanceCosts: {
        'TRK-001': 15000,
        'TRK-002': 22000,
        'TRK-003': 35000,
        'TRK-004': 18000
      },
      fuelConsumption: {
        'TRK-001': 2500,
        'TRK-002': 2800,
        'TRK-003': 2200,
        'TRK-004': 2600
      }
    };
  }
}

export const fleetManagementService = new FleetManagementService();