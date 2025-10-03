export interface DeliveryInfo {
  id: string;
  orderId: string;
  projectName: string;
  location: string;
  truckId: string;
  driverName: string;
  driverPhone: string;
  status: 'Pending' | 'Dispatched' | 'En Route' | 'On Site' | 'Delivered' | 'Cancelled';
  estimatedArrival: string;
  actualArrival?: string;
  volume: number;
  grade: string;
  slump?: number;
  dispatchTime?: string;
  deliveryTime?: string;
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  eta?: string;
  distance?: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  specialInstructions?: string;
  weatherConditions?: {
    temperature: number;
    condition: string;
    suitableForPour: boolean;
  };
  qualityTests?: QualityTest[];
  deliveryNotes?: string;
  confirmationSignature?: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QualityTest {
  id: string;
  type: 'Slump' | 'Temperature' | 'Air Content' | 'Visual';
  result: string;
  passedTest: boolean;
  testTime: string;
  testedBy: string;
  notes?: string;
}

export interface DeliveryUpdate {
  id: string;
  deliveryId: string;
  status: DeliveryInfo['status'];
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  notes?: string;
  timestamp: string;
  updatedBy: string;
  estimatedArrival?: string;
}

export interface DeliveryStatistics {
  totalDeliveries: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  cancelledDeliveries: number;
  averageDeliveryTime: number;
  onTimePercentage: number;
  totalVolume: number;
  todaysDeliveries: number;
  activeDeliveries: number;
  completedToday: number;
}

class DeliveryService {
  private static instance: DeliveryService;
  private deliveries: DeliveryInfo[] = [];
  private deliveryUpdates: DeliveryUpdate[] = [];

  private constructor() {
    this.initializeMockData();
  }

  static getInstance(): DeliveryService {
    if (!DeliveryService.instance) {
      DeliveryService.instance = new DeliveryService();
    }
    return DeliveryService.instance;
  }

  private initializeMockData(): void {
    this.deliveries = [
      {
        id: 'DEL-001',
        orderId: 'ORD-001',
        projectName: 'Housing Project A',
        location: '123 Main Street, Cape Town',
        truckId: 'TRK-002',
        driverName: 'Mike Johnson',
        driverPhone: '+27 82 123 4567',
        status: 'En Route',
        estimatedArrival: '2025-10-03T10:30:00',
        volume: 30,
        grade: '25MPa',
        slump: 100,
        dispatchTime: '2025-10-03T07:30:00',
        currentLocation: {
          lat: -33.9350,
          lng: 18.4400,
          address: 'N1 Highway, 5km from destination'
        },
        eta: '10:30 AM',
        distance: 5,
        priority: 'High',
        specialInstructions: 'Access via side gate. Site contact: John Smith',
        weatherConditions: {
          temperature: 24,
          condition: 'Partly Cloudy',
          suitableForPour: true
        },
        createdAt: '2025-10-03T06:00:00',
        updatedAt: '2025-10-03T08:45:00'
      },
      {
        id: 'DEL-002',
        orderId: 'ORD-002',
        projectName: 'Commercial Complex',
        location: '456 Oak Avenue, Johannesburg',
        truckId: 'TRK-003',
        driverName: 'David Wilson',
        driverPhone: '+27 84 345 6789',
        status: 'Dispatched',
        estimatedArrival: '2025-10-03T14:15:00',
        volume: 45,
        grade: '30MPa',
        slump: 80,
        dispatchTime: '2025-10-03T11:00:00',
        currentLocation: {
          lat: -33.9249,
          lng: 18.4241,
          address: 'Concre-tek Plant, Cape Town'
        },
        eta: '2:15 PM',
        distance: 25,
        priority: 'Medium',
        weatherConditions: {
          temperature: 26,
          condition: 'Clear',
          suitableForPour: true
        },
        createdAt: '2025-10-03T08:00:00',
        updatedAt: '2025-10-03T11:00:00'
      },
      {
        id: 'DEL-003',
        orderId: 'ORD-003',
        projectName: 'Bridge Construction',
        location: '789 Bridge Road, Durban',
        truckId: 'TRK-001',
        driverName: 'John Smith',
        driverPhone: '+27 82 111 2222',
        status: 'Delivered',
        estimatedArrival: '2025-10-02T16:00:00',
        actualArrival: '2025-10-02T15:45:00',
        volume: 25,
        grade: '35MPa',
        slump: 120,
        dispatchTime: '2025-10-02T13:30:00',
        deliveryTime: '2025-10-02T15:45:00',
        priority: 'Low',
        qualityTests: [
          {
            id: 'QT-001',
            type: 'Slump',
            result: '118mm',
            passedTest: true,
            testTime: '2025-10-02T15:50:00',
            testedBy: 'Quality Inspector'
          },
          {
            id: 'QT-002',
            type: 'Temperature',
            result: '22°C',
            passedTest: true,
            testTime: '2025-10-02T15:52:00',
            testedBy: 'Quality Inspector'
          }
        ],
        deliveryNotes: 'Delivery completed successfully. All tests passed.',
        confirmationSignature: 'J.Smith - Site Foreman',
        createdAt: '2025-10-02T10:00:00',
        updatedAt: '2025-10-02T15:45:00'
      }
    ];

    this.deliveryUpdates = [
      {
        id: 'UPD-001',
        deliveryId: 'DEL-001',
        status: 'Dispatched',
        location: {
          lat: -33.9249,
          lng: 18.4241,
          address: 'Concre-tek Plant, Cape Town'
        },
        notes: 'Truck departed from plant',
        timestamp: '2025-10-03T07:30:00',
        updatedBy: 'Dispatch Center',
        estimatedArrival: '2025-10-03T10:30:00'
      },
      {
        id: 'UPD-002',
        deliveryId: 'DEL-001',
        status: 'En Route',
        location: {
          lat: -33.9350,
          lng: 18.4400,
          address: 'N1 Highway, 5km from destination'
        },
        notes: 'Truck is 5km from destination',
        timestamp: '2025-10-03T08:45:00',
        updatedBy: 'GPS Tracking',
        estimatedArrival: '2025-10-03T10:30:00'
      }
    ];
  }

  // Get all deliveries
  async getDeliveries(): Promise<DeliveryInfo[]> {
    return [...this.deliveries];
  }

  // Get delivery by ID
  async getDeliveryById(id: string): Promise<DeliveryInfo | null> {
    return this.deliveries.find(delivery => delivery.id === id) || null;
  }

  // Get deliveries by status
  async getDeliveriesByStatus(status: DeliveryInfo['status']): Promise<DeliveryInfo[]> {
    return this.deliveries.filter(delivery => delivery.status === status);
  }

  // Get deliveries for today
  async getTodaysDeliveries(): Promise<DeliveryInfo[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.deliveries.filter(delivery => 
      delivery.estimatedArrival.startsWith(today) ||
      (delivery.actualArrival && delivery.actualArrival.startsWith(today))
    );
  }

  // Create new delivery
  async createDelivery(deliveryData: Omit<DeliveryInfo, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliveryInfo> {
    const newDelivery: DeliveryInfo = {
      ...deliveryData,
      id: `DEL-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.deliveries.push(newDelivery);
    return newDelivery;
  }

  // Update delivery status
  async updateDeliveryStatus(
    deliveryId: string, 
    status: DeliveryInfo['status'], 
    location?: { lat: number; lng: number; address: string },
    notes?: string
  ): Promise<boolean> {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    if (!delivery) return false;

    delivery.status = status;
    delivery.updatedAt = new Date().toISOString();
    
    if (location) {
      delivery.currentLocation = location;
    }

    if (status === 'Delivered') {
      delivery.actualArrival = new Date().toISOString();
      delivery.deliveryTime = new Date().toISOString();
    }

    // Add delivery update record
    const update: DeliveryUpdate = {
      id: `UPD-${Date.now()}`,
      deliveryId,
      status,
      location,
      notes,
      timestamp: new Date().toISOString(),
      updatedBy: 'System'
    };
    this.deliveryUpdates.push(update);

    return true;
  }

  // Get delivery updates for a specific delivery
  async getDeliveryUpdates(deliveryId: string): Promise<DeliveryUpdate[]> {
    return this.deliveryUpdates.filter(update => update.deliveryId === deliveryId);
  }

  // Add quality test results
  async addQualityTest(deliveryId: string, testData: Omit<QualityTest, 'id'>): Promise<boolean> {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    if (!delivery) return false;

    if (!delivery.qualityTests) {
      delivery.qualityTests = [];
    }

    const newTest: QualityTest = {
      ...testData,
      id: `QT-${Date.now()}`
    };

    delivery.qualityTests.push(newTest);
    delivery.updatedAt = new Date().toISOString();

    return true;
  }

  // Get delivery statistics
  async getDeliveryStatistics(): Promise<DeliveryStatistics> {
    const totalDeliveries = this.deliveries.length;
    const completedDeliveries = this.deliveries.filter(d => d.status === 'Delivered');
    const cancelledDeliveries = this.deliveries.filter(d => d.status === 'Cancelled');
    
    // Calculate on-time deliveries (delivered before or at estimated time)
    const onTimeDeliveries = completedDeliveries.filter(d => {
      if (!d.actualArrival) return false;
      return new Date(d.actualArrival) <= new Date(d.estimatedArrival);
    }).length;

    const lateDeliveries = completedDeliveries.length - onTimeDeliveries;

    // Calculate average delivery time (in hours)
    const deliveryTimes = completedDeliveries
      .filter(d => d.dispatchTime && d.actualArrival)
      .map(d => {
        const dispatch = new Date(d.dispatchTime!);
        const arrival = new Date(d.actualArrival!);
        return (arrival.getTime() - dispatch.getTime()) / (1000 * 60 * 60); // hours
      });

    const averageDeliveryTime = deliveryTimes.length > 0 
      ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
      : 0;

    const onTimePercentage = completedDeliveries.length > 0 
      ? (onTimeDeliveries / completedDeliveries.length) * 100
      : 0;

    const totalVolume = this.deliveries.reduce((sum, delivery) => sum + delivery.volume, 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todaysDeliveries = this.deliveries.filter(d => 
      d.estimatedArrival.startsWith(today) ||
      (d.actualArrival && d.actualArrival.startsWith(today))
    ).length;

    const activeDeliveries = this.deliveries.filter(d => 
      ['Dispatched', 'En Route', 'On Site'].includes(d.status)
    ).length;

    const completedToday = this.deliveries.filter(d => 
      d.status === 'Delivered' && 
      d.actualArrival && 
      d.actualArrival.startsWith(today)
    ).length;

    return {
      totalDeliveries,
      onTimeDeliveries,
      lateDeliveries,
      cancelledDeliveries: cancelledDeliveries.length,
      averageDeliveryTime: Math.round(averageDeliveryTime * 100) / 100,
      onTimePercentage: Math.round(onTimePercentage * 100) / 100,
      totalVolume,
      todaysDeliveries,
      activeDeliveries,
      completedToday
    };
  }

  // Search deliveries
  async searchDeliveries(query: string): Promise<DeliveryInfo[]> {
    const searchTerm = query.toLowerCase();
    return this.deliveries.filter(delivery =>
      delivery.id.toLowerCase().includes(searchTerm) ||
      delivery.orderId.toLowerCase().includes(searchTerm) ||
      delivery.projectName.toLowerCase().includes(searchTerm) ||
      delivery.location.toLowerCase().includes(searchTerm) ||
      delivery.truckId.toLowerCase().includes(searchTerm) ||
      delivery.driverName.toLowerCase().includes(searchTerm)
    );
  }

  // Confirm delivery arrival
  async confirmDeliveryArrival(deliveryId: string, confirmationData: {
    actualArrival: string;
    notes?: string;
    photos?: string[];
  }): Promise<boolean> {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    if (!delivery) return false;

    delivery.status = 'On Site';
    delivery.actualArrival = confirmationData.actualArrival;
    delivery.updatedAt = new Date().toISOString();
    
    if (confirmationData.notes) {
      delivery.deliveryNotes = confirmationData.notes;
    }
    
    if (confirmationData.photos) {
      delivery.photos = confirmationData.photos;
    }

    // Add delivery update
    const update: DeliveryUpdate = {
      id: `UPD-${Date.now()}`,
      deliveryId,
      status: 'On Site',
      notes: `Arrival confirmed at ${confirmationData.actualArrival}`,
      timestamp: new Date().toISOString(),
      updatedBy: 'Site Agent'
    };
    this.deliveryUpdates.push(update);

    return true;
  }

  // Complete delivery
  async completeDelivery(deliveryId: string, completionData: {
    deliveryTime: string;
    confirmationSignature: string;
    notes?: string;
    photos?: string[];
    qualityTests?: Omit<QualityTest, 'id'>[];
  }): Promise<boolean> {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    if (!delivery) return false;

    delivery.status = 'Delivered';
    delivery.deliveryTime = completionData.deliveryTime;
    delivery.confirmationSignature = completionData.confirmationSignature;
    delivery.updatedAt = new Date().toISOString();

    if (completionData.notes) {
      delivery.deliveryNotes = completionData.notes;
    }

    if (completionData.photos) {
      delivery.photos = [...(delivery.photos || []), ...completionData.photos];
    }

    if (completionData.qualityTests) {
      if (!delivery.qualityTests) {
        delivery.qualityTests = [];
      }
      
      completionData.qualityTests.forEach(testData => {
        const test: QualityTest = {
          ...testData,
          id: `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        delivery.qualityTests!.push(test);
      });
    }

    // Add delivery update
    const update: DeliveryUpdate = {
      id: `UPD-${Date.now()}`,
      deliveryId,
      status: 'Delivered',
      notes: `Delivery completed at ${completionData.deliveryTime}`,
      timestamp: new Date().toISOString(),
      updatedBy: 'Site Agent'
    };
    this.deliveryUpdates.push(update);

    return true;
  }
}

export const deliveryService = DeliveryService.getInstance();