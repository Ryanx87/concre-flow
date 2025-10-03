export interface MaintenanceEquipment {
  id: string;
  name: string;
  type: 'Mixer' | 'Conveyor' | 'Pump' | 'Weighing System' | 'Silo' | 'Generator' | 'Compressor' | 'Crusher' | 'Other';
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  status: 'Operational' | 'Under Maintenance' | 'Down' | 'Scheduled Maintenance' | 'Retired';
  installationDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceInterval: number; // days
  operatingHours: number;
  maxOperatingHours: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  criticality: 'Low' | 'Medium' | 'High' | 'Critical';
  specifications?: Record<string, string>;
  warrantyCoverage?: {
    isActive: boolean;
    expiryDate: string;
    provider: string;
  };
  images?: string[];
  manuals?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceTask {
  id: string;
  equipmentId: string;
  equipmentName: string;
  title: string;
  description: string;
  type: 'Preventive' | 'Corrective' | 'Emergency' | 'Inspection' | 'Calibration' | 'Upgrade';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Overdue';
  assignedTo: string;
  assignedToName: string;
  estimatedDuration: number; // hours
  actualDuration?: number;
  estimatedCost: number;
  actualCost?: number;
  scheduledDate: string;
  startDate?: string;
  completionDate?: string;
  workOrderNumber: string;
  instructions: string;
  partsRequired: MaintenancePart[];
  checklist: MaintenanceChecklistItem[];
  notes?: string;
  completionNotes?: string;
  photos?: string[];
  attachments?: string[];
  approvedBy?: string;
  approvalDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenancePart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitCost: number;
  supplier: string;
  inStock: boolean;
  requiredDate: string;
  ordered: boolean;
  received: boolean;
}

export interface MaintenanceChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  notes?: string;
  completedBy?: string;
  completedAt?: string;
}

export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  equipmentName: string;
  taskType: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'Custom';
  customFrequencyDays?: number;
  lastExecuted?: string;
  nextDue: string;
  isActive: boolean;
  assignedTeam: string;
  estimatedDuration: number;
  instructions: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceStatistics {
  totalEquipment: number;
  operationalEquipment: number;
  equipmentUnderMaintenance: number;
  downEquipment: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  avgCompletionTime: number;
  maintenanceCosts: {
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
  };
  equipmentUptime: number;
  mtbf: number; // Mean Time Between Failures
  mttr: number; // Mean Time To Repair
  preventiveVsCorrective: {
    preventive: number;
    corrective: number;
  };
  costBreakdown: {
    labor: number;
    parts: number;
    external: number;
  };
  criticalAlerts: number;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  equipmentId: string;
  equipmentName: string;
  requestedBy: string;
  requestDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: 'Open' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';
  type: 'Breakdown' | 'Maintenance' | 'Inspection' | 'Installation' | 'Modification';
  description: string;
  assignedTo?: string;
  estimatedHours: number;
  actualHours?: number;
  scheduledDate?: string;
  startDate?: string;
  completionDate?: string;
  totalCost?: number;
  customerSatisfaction?: number;
  notes?: string;
}

class PlantMaintenanceService {
  private static instance: PlantMaintenanceService;
  private equipment: MaintenanceEquipment[] = [];
  private tasks: MaintenanceTask[] = [];
  private schedules: MaintenanceSchedule[] = [];
  private workOrders: WorkOrder[] = [];

  private constructor() {
    this.initializeMockData();
  }

  static getInstance(): PlantMaintenanceService {
    if (!PlantMaintenanceService.instance) {
      PlantMaintenanceService.instance = new PlantMaintenanceService();
    }
    return PlantMaintenanceService.instance;
  }

  private initializeMockData(): void {
    // Initialize Equipment
    this.equipment = [
      {
        id: 'EQ-001',
        name: 'Main Concrete Mixer #1',
        type: 'Mixer',
        manufacturer: 'Liebherr',
        model: 'Mobilmix 2.5',
        serialNumber: 'LBR-2021-001',
        location: 'Batching Plant - Bay 1',
        status: 'Operational',
        installationDate: '2021-03-15',
        lastMaintenanceDate: '2025-09-15',
        nextMaintenanceDate: '2025-12-15',
        maintenanceInterval: 90,
        operatingHours: 2450,
        maxOperatingHours: 8000,
        condition: 'Good',
        criticality: 'High',
        specifications: {
          'Capacity': '2.5 m³',
          'Power': '75 kW',
          'Weight': '3500 kg'
        },
        warrantyCoverage: {
          isActive: true,
          expiryDate: '2026-03-15',
          provider: 'Liebherr Service'
        },
        createdAt: '2021-03-15T10:00:00Z',
        updatedAt: '2025-09-15T14:30:00Z'
      },
      {
        id: 'EQ-002',
        name: 'Aggregate Conveyor Belt #1',
        type: 'Conveyor',
        manufacturer: 'ConveyorTech',
        model: 'CT-500',
        serialNumber: 'CT-2020-045',
        location: 'Aggregate Storage Area',
        status: 'Under Maintenance',
        installationDate: '2020-08-10',
        lastMaintenanceDate: '2025-10-01',
        nextMaintenanceDate: '2025-11-01',
        maintenanceInterval: 30,
        operatingHours: 4200,
        maxOperatingHours: 10000,
        condition: 'Fair',
        criticality: 'Medium',
        specifications: {
          'Belt Width': '500mm',
          'Length': '25m',
          'Capacity': '200 t/h'
        },
        createdAt: '2020-08-10T09:00:00Z',
        updatedAt: '2025-10-01T11:00:00Z'
      },
      {
        id: 'EQ-003',
        name: 'Cement Silo #1',
        type: 'Silo',
        manufacturer: 'SiloMaster',
        model: 'SM-100',
        serialNumber: 'SM-2019-023',
        location: 'Material Storage - North',
        status: 'Operational',
        installationDate: '2019-05-20',
        lastMaintenanceDate: '2025-08-20',
        nextMaintenanceDate: '2026-02-20',
        maintenanceInterval: 180,
        operatingHours: 0, // Silos don't have operating hours
        maxOperatingHours: 0,
        condition: 'Excellent',
        criticality: 'Critical',
        specifications: {
          'Capacity': '100 tonnes',
          'Height': '15m',
          'Diameter': '3.5m'
        },
        createdAt: '2019-05-20T08:00:00Z',
        updatedAt: '2025-08-20T16:00:00Z'
      },
      {
        id: 'EQ-004',
        name: 'Weighing System - Aggregates',
        type: 'Weighing System',
        manufacturer: 'PrecisionWeigh',
        model: 'PW-2000',
        serialNumber: 'PW-2022-078',
        location: 'Batching Plant - Control Tower',
        status: 'Scheduled Maintenance',
        installationDate: '2022-01-12',
        lastMaintenanceDate: '2025-09-01',
        nextMaintenanceDate: '2025-10-15',
        maintenanceInterval: 45,
        operatingHours: 1850,
        maxOperatingHours: 6000,
        condition: 'Good',
        criticality: 'High',
        specifications: {
          'Accuracy': '±0.5%',
          'Capacity': '2000kg',
          'Resolution': '0.1kg'
        },
        createdAt: '2022-01-12T12:00:00Z',
        updatedAt: '2025-09-01T10:30:00Z'
      },
      {
        id: 'EQ-005',
        name: 'Backup Generator',
        type: 'Generator',
        manufacturer: 'Caterpillar',
        model: 'C32',
        serialNumber: 'CAT-2023-156',
        location: 'Utility Building',
        status: 'Down',
        installationDate: '2023-06-01',
        lastMaintenanceDate: '2025-09-20',
        nextMaintenanceDate: '2025-11-20',
        maintenanceInterval: 60,
        operatingHours: 245,
        maxOperatingHours: 15000,
        condition: 'Poor',
        criticality: 'Critical',
        specifications: {
          'Power Output': '500 kW',
          'Fuel Type': 'Diesel',
          'Fuel Capacity': '2000L'
        },
        createdAt: '2023-06-01T14:00:00Z',
        updatedAt: '2025-09-20T09:15:00Z'
      }
    ];

    // Initialize Tasks
    this.tasks = [
      {
        id: 'MT-001',
        equipmentId: 'EQ-001',
        equipmentName: 'Main Concrete Mixer #1',
        title: 'Quarterly Maintenance - Mixer Blades',
        description: 'Inspect and replace mixer blades, check hydraulic system, calibrate controls',
        type: 'Preventive',
        priority: 'High',
        status: 'Scheduled',
        assignedTo: 'TECH-001',
        assignedToName: 'Mike Rodriguez',
        estimatedDuration: 6,
        estimatedCost: 2500,
        scheduledDate: '2025-10-15T08:00:00Z',
        workOrderNumber: 'WO-2025-001',
        instructions: 'Follow maintenance checklist for Liebherr Mobilmix 2.5. Ensure safety lockout procedures.',
        partsRequired: [
          {
            id: 'PART-001',
            name: 'Mixer Blade Set',
            partNumber: 'LBR-MB-2.5-001',
            quantity: 1,
            unitCost: 1200,
            supplier: 'Liebherr Parts',
            inStock: true,
            requiredDate: '2025-10-14',
            ordered: true,
            received: true
          },
          {
            id: 'PART-002',
            name: 'Hydraulic Filter',
            partNumber: 'LBR-HF-001',
            quantity: 2,
            unitCost: 150,
            supplier: 'Liebherr Parts',
            inStock: false,
            requiredDate: '2025-10-14',
            ordered: true,
            received: false
          }
        ],
        checklist: [
          {
            id: 'CHK-001',
            description: 'Inspect mixer blades for wear',
            completed: false
          },
          {
            id: 'CHK-002',
            description: 'Check hydraulic fluid levels',
            completed: false
          },
          {
            id: 'CHK-003',
            description: 'Test all safety systems',
            completed: false
          }
        ],
        createdAt: '2025-09-01T10:00:00Z',
        updatedAt: '2025-10-01T14:30:00Z'
      },
      {
        id: 'MT-002',
        equipmentId: 'EQ-002',
        equipmentName: 'Aggregate Conveyor Belt #1',
        title: 'Emergency Repair - Belt Replacement',
        description: 'Replace damaged conveyor belt due to material jam',
        type: 'Emergency',
        priority: 'Critical',
        status: 'In Progress',
        assignedTo: 'TECH-002',
        assignedToName: 'Sarah Chen',
        estimatedDuration: 8,
        actualDuration: 6,
        estimatedCost: 3500,
        actualCost: 3200,
        scheduledDate: '2025-10-03T06:00:00Z',
        startDate: '2025-10-03T06:15:00Z',
        workOrderNumber: 'WO-2025-002',
        instructions: 'Emergency belt replacement. Coordinate with production to minimize downtime.',
        partsRequired: [
          {
            id: 'PART-003',
            name: 'Conveyor Belt 500mm x 25m',
            partNumber: 'CT-BELT-500-25',
            quantity: 1,
            unitCost: 2800,
            supplier: 'ConveyorTech',
            inStock: false,
            requiredDate: '2025-10-03',
            ordered: true,
            received: true
          }
        ],
        checklist: [
          {
            id: 'CHK-004',
            description: 'Remove damaged belt',
            completed: true,
            completedBy: 'Sarah Chen',
            completedAt: '2025-10-03T08:30:00Z'
          },
          {
            id: 'CHK-005',
            description: 'Install new belt',
            completed: true,
            completedBy: 'Sarah Chen',
            completedAt: '2025-10-03T11:45:00Z'
          },
          {
            id: 'CHK-006',
            description: 'Test belt operation',
            completed: false
          }
        ],
        notes: 'Belt damage caused by oversized aggregate. Need to review material screening process.',
        createdAt: '2025-10-02T22:30:00Z',
        updatedAt: '2025-10-03T12:00:00Z'
      }
    ];

    // Initialize Schedules
    this.schedules = [
      {
        id: 'SCH-001',
        equipmentId: 'EQ-001',
        equipmentName: 'Main Concrete Mixer #1',
        taskType: 'Lubrication and Visual Inspection',
        frequency: 'Weekly',
        lastExecuted: '2025-09-28',
        nextDue: '2025-10-05',
        isActive: true,
        assignedTeam: 'Daily Maintenance Team',
        estimatedDuration: 2,
        instructions: 'Check all lubrication points, visual inspection of wear parts, record operating hours',
        createdAt: '2021-03-15T10:00:00Z',
        updatedAt: '2025-09-28T16:00:00Z'
      },
      {
        id: 'SCH-002',
        equipmentId: 'EQ-003',
        equipmentName: 'Cement Silo #1',
        taskType: 'Level Sensor Calibration',
        frequency: 'Monthly',
        lastExecuted: '2025-09-15',
        nextDue: '2025-10-15',
        isActive: true,
        assignedTeam: 'Instrumentation Team',
        estimatedDuration: 3,
        instructions: 'Calibrate level sensors, check alarm systems, verify discharge mechanisms',
        createdAt: '2019-05-20T08:00:00Z',
        updatedAt: '2025-09-15T14:00:00Z'
      }
    ];

    // Initialize Work Orders
    this.workOrders = [
      {
        id: 'WO-001',
        workOrderNumber: 'WO-2025-001',
        equipmentId: 'EQ-001',
        equipmentName: 'Main Concrete Mixer #1',
        requestedBy: 'Production Supervisor',
        requestDate: '2025-09-01T10:00:00Z',
        priority: 'High',
        status: 'Assigned',
        type: 'Maintenance',
        description: 'Quarterly maintenance for main mixer',
        assignedTo: 'Mike Rodriguez',
        estimatedHours: 6,
        scheduledDate: '2025-10-15T08:00:00Z',
        totalCost: 2500
      },
      {
        id: 'WO-002',
        workOrderNumber: 'WO-2025-002',
        equipmentId: 'EQ-002',
        equipmentName: 'Aggregate Conveyor Belt #1',
        requestedBy: 'Operator John Smith',
        requestDate: '2025-10-02T22:30:00Z',
        priority: 'Emergency',
        status: 'In Progress',
        type: 'Breakdown',
        description: 'Emergency belt replacement due to material jam',
        assignedTo: 'Sarah Chen',
        estimatedHours: 8,
        actualHours: 6,
        startDate: '2025-10-03T06:15:00Z',
        totalCost: 3200,
        notes: 'Belt damage caused by oversized aggregate'
      }
    ];
  }

  // Equipment Management
  async getEquipment(): Promise<MaintenanceEquipment[]> {
    return [...this.equipment];
  }

  async getEquipmentById(id: string): Promise<MaintenanceEquipment | null> {
    return this.equipment.find(eq => eq.id === id) || null;
  }

  async createEquipment(equipmentData: Omit<MaintenanceEquipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceEquipment> {
    const newEquipment: MaintenanceEquipment = {
      ...equipmentData,
      id: `EQ-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.equipment.push(newEquipment);
    return newEquipment;
  }

  async updateEquipment(id: string, updates: Partial<MaintenanceEquipment>): Promise<boolean> {
    const index = this.equipment.findIndex(eq => eq.id === id);
    if (index === -1) return false;
    
    this.equipment[index] = {
      ...this.equipment[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return true;
  }

  async deleteEquipment(id: string): Promise<boolean> {
    const index = this.equipment.findIndex(eq => eq.id === id);
    if (index === -1) return false;
    
    this.equipment.splice(index, 1);
    return true;
  }

  // Task Management
  async getTasks(): Promise<MaintenanceTask[]> {
    return [...this.tasks];
  }

  async getTaskById(id: string): Promise<MaintenanceTask | null> {
    return this.tasks.find(task => task.id === id) || null;
  }

  async createTask(taskData: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceTask> {
    const newTask: MaintenanceTask = {
      ...taskData,
      id: `MT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tasks.push(newTask);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<MaintenanceTask>): Promise<boolean> {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index === -1) return false;
    
    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return true;
  }

  async completeTask(id: string, completionData: {
    actualDuration: number;
    actualCost: number;
    completionNotes: string;
    photos?: string[];
  }): Promise<boolean> {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return false;

    task.status = 'Completed';
    task.actualDuration = completionData.actualDuration;
    task.actualCost = completionData.actualCost;
    task.completionNotes = completionData.completionNotes;
    task.completionDate = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    
    if (completionData.photos) {
      task.photos = [...(task.photos || []), ...completionData.photos];
    }

    return true;
  }

  // Schedule Management
  async getSchedules(): Promise<MaintenanceSchedule[]> {
    return [...this.schedules];
  }

  async createSchedule(scheduleData: Omit<MaintenanceSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceSchedule> {
    const newSchedule: MaintenanceSchedule = {
      ...scheduleData,
      id: `SCH-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.schedules.push(newSchedule);
    return newSchedule;
  }

  // Work Order Management
  async getWorkOrders(): Promise<WorkOrder[]> {
    return [...this.workOrders];
  }

  async createWorkOrder(workOrderData: Omit<WorkOrder, 'id' | 'workOrderNumber'>): Promise<WorkOrder> {
    const newWorkOrder: WorkOrder = {
      ...workOrderData,
      id: `WO-${Date.now()}`,
      workOrderNumber: `WO-${new Date().getFullYear()}-${String(this.workOrders.length + 1).padStart(3, '0')}`
    };
    this.workOrders.push(newWorkOrder);
    return newWorkOrder;
  }

  // Statistics and Analytics
  async getMaintenanceStatistics(): Promise<MaintenanceStatistics> {
    const totalEquipment = this.equipment.length;
    const operationalEquipment = this.equipment.filter(eq => eq.status === 'Operational').length;
    const equipmentUnderMaintenance = this.equipment.filter(eq => eq.status === 'Under Maintenance').length;
    const downEquipment = this.equipment.filter(eq => eq.status === 'Down').length;

    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(task => task.status === 'Completed').length;
    const overdueTasks = this.tasks.filter(task => {
      if (task.status === 'Completed') return false;
      return new Date(task.scheduledDate) < new Date();
    }).length;

    const completedTasksWithDuration = this.tasks.filter(task => 
      task.status === 'Completed' && task.actualDuration
    );
    const avgCompletionTime = completedTasksWithDuration.length > 0
      ? completedTasksWithDuration.reduce((sum, task) => sum + (task.actualDuration || 0), 0) / completedTasksWithDuration.length
      : 0;

    const thisMonthTasks = this.tasks.filter(task => {
      const taskDate = new Date(task.scheduledDate);
      const now = new Date();
      return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear();
    });

    const thisMonthCost = thisMonthTasks.reduce((sum, task) => sum + (task.actualCost || task.estimatedCost), 0);

    return {
      totalEquipment,
      operationalEquipment,
      equipmentUnderMaintenance,
      downEquipment,
      totalTasks,
      completedTasks,
      overdueTasks,
      avgCompletionTime: Math.round(avgCompletionTime * 100) / 100,
      maintenanceCosts: {
        thisMonth: thisMonthCost,
        lastMonth: thisMonthCost * 0.85, // Mock data
        thisYear: thisMonthCost * 8.5 // Mock data
      },
      equipmentUptime: 94.5, // Mock calculation
      mtbf: 720, // Mock: 720 hours
      mttr: 4.2, // Mock: 4.2 hours
      preventiveVsCorrective: {
        preventive: this.tasks.filter(task => task.type === 'Preventive').length,
        corrective: this.tasks.filter(task => task.type === 'Corrective').length
      },
      costBreakdown: {
        labor: thisMonthCost * 0.6,
        parts: thisMonthCost * 0.3,
        external: thisMonthCost * 0.1
      },
      criticalAlerts: this.equipment.filter(eq => eq.condition === 'Critical' || eq.status === 'Down').length
    };
  }

  // Search and Filtering
  async searchEquipment(query: string): Promise<MaintenanceEquipment[]> {
    const searchTerm = query.toLowerCase();
    return this.equipment.filter(eq =>
      eq.name.toLowerCase().includes(searchTerm) ||
      eq.manufacturer.toLowerCase().includes(searchTerm) ||
      eq.model.toLowerCase().includes(searchTerm) ||
      eq.location.toLowerCase().includes(searchTerm)
    );
  }

  async getTasksByStatus(status: MaintenanceTask['status']): Promise<MaintenanceTask[]> {
    return this.tasks.filter(task => task.status === status);
  }

  async getTasksByEquipment(equipmentId: string): Promise<MaintenanceTask[]> {
    return this.tasks.filter(task => task.equipmentId === equipmentId);
  }

  async getOverdueTasks(): Promise<MaintenanceTask[]> {
    const now = new Date();
    return this.tasks.filter(task => 
      task.status !== 'Completed' && 
      task.status !== 'Cancelled' &&
      new Date(task.scheduledDate) < now
    );
  }

  async getUpcomingMaintenance(days: number = 30): Promise<MaintenanceTask[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return this.tasks.filter(task => {
      const taskDate = new Date(task.scheduledDate);
      return taskDate >= now && taskDate <= futureDate && task.status === 'Scheduled';
    });
  }
}

export const plantMaintenanceService = PlantMaintenanceService.getInstance();