export interface ProjectArea {
  id: string;
  name: string;
  progress: number;
  structures: Structure[];
  description?: string;
  estimatedVolume?: number;
  priority: 'High' | 'Medium' | 'Low';
}

export interface Structure {
  id: string;
  name: string;
  type: 'Foundation' | 'Structural' | 'Paving' | 'Architectural';
  recommendedGrade: string;
  estimatedVolume?: number;
  status: 'Planned' | 'In Progress' | 'Completed';
  specifications?: {
    slump?: string;
    additives?: string[];
    specialRequirements?: string;
  };
}

export interface ConcreteOrder {
  id: string;
  projectArea: string;
  structure: string;
  volume: number;
  grade: string;
  slump?: string;
  deliveryDate: string;
  deliveryTime: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'In Production' | 'Dispatched' | 'Delivered';
  priority: 'High' | 'Medium' | 'Low';
  contactPerson?: string;
  contactPhone?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuickOrderData {
  area: string;
  structure: string;
  volume: string;
  grade: string;
  deliveryDate: string;
  deliveryTime: string;
}

class ConcreteOrderingService {
  private readonly apiUrl = '/api/orders'; // Mock API endpoint

  /**
   * Get project areas with structures
   */
  async getProjectAreas(): Promise<ProjectArea[]> {
    // Mock data - replace with actual API call
    return [
      {
        id: 'area-1',
        name: 'Foundation Zone A',
        progress: 65,
        priority: 'High',
        estimatedVolume: 150,
        description: 'Main foundation works including strip foundations and pile caps',
        structures: [
          {
            id: 'struct-1',
            name: 'Strip Foundations',
            type: 'Foundation',
            recommendedGrade: '25MPa',
            estimatedVolume: 45,
            status: 'In Progress',
            specifications: {
              slump: '100mm',
              additives: ['Waterproof admixture'],
              specialRequirements: 'Continuous pour required'
            }
          },
          {
            id: 'struct-2',
            name: 'Pile Caps',
            type: 'Foundation',
            recommendedGrade: '30MPa',
            estimatedVolume: 35,
            status: 'Planned',
            specifications: {
              slump: '150mm',
              additives: ['Accelerator'],
              specialRequirements: 'High early strength'
            }
          },
          {
            id: 'struct-3',
            name: 'Ground Beams',
            type: 'Structural',
            recommendedGrade: '30MPa',
            estimatedVolume: 25,
            status: 'Planned'
          }
        ]
      },
      {
        id: 'area-2',
        name: 'Structural Frame B',
        progress: 40,
        priority: 'High',
        estimatedVolume: 280,
        description: 'Superstructure including columns, beams, and slabs',
        structures: [
          {
            id: 'struct-4',
            name: 'Columns',
            type: 'Structural',
            recommendedGrade: '40MPa',
            estimatedVolume: 85,
            status: 'Planned',
            specifications: {
              slump: '180mm',
              additives: ['Superplasticizer', 'Retarder'],
              specialRequirements: 'High strength, pump mix'
            }
          },
          {
            id: 'struct-5',
            name: 'Beams',
            type: 'Structural',
            recommendedGrade: '35MPa',
            estimatedVolume: 95,
            status: 'Planned'
          },
          {
            id: 'struct-6',
            name: 'Slabs',
            type: 'Structural',
            recommendedGrade: '30MPa',
            estimatedVolume: 100,
            status: 'Planned',
            specifications: {
              slump: '120mm',
              specialRequirements: 'Self-leveling finish'
            }
          }
        ]
      },
      {
        id: 'area-3',
        name: 'External Works C',
        progress: 20,
        priority: 'Medium',
        estimatedVolume: 120,
        description: 'External paving, driveways, and retaining structures',
        structures: [
          {
            id: 'struct-7',
            name: 'Driveways',
            type: 'Paving',
            recommendedGrade: '25MPa',
            estimatedVolume: 40,
            status: 'Planned',
            specifications: {
              slump: '80mm',
              additives: ['Air entraining agent'],
              specialRequirements: 'Exposed aggregate finish'
            }
          },
          {
            id: 'struct-8',
            name: 'Walkways',
            type: 'Paving',
            recommendedGrade: '20MPa',
            estimatedVolume: 25,
            status: 'Planned'
          },
          {
            id: 'struct-9',
            name: 'Retaining Walls',
            type: 'Structural',
            recommendedGrade: '35MPa',
            estimatedVolume: 55,
            status: 'Planned',
            specifications: {
              slump: '120mm',
              additives: ['Waterproof admixture'],
              specialRequirements: 'Waterproof construction'
            }
          }
        ]
      }
    ];
  }

  /**
   * Get concrete grade options with descriptions
   */
  getConcreteGrades() {
    return [
      { value: '15MPa', label: '15MPa - Blinding', description: 'Non-structural blinding concrete' },
      { value: '20MPa', label: '20MPa - General', description: 'General purpose, pathways' },
      { value: '25MPa', label: '25MPa - Foundation', description: 'Foundations, footings' },
      { value: '30MPa', label: '30MPa - Structural', description: 'Structural elements, slabs' },
      { value: '35MPa', label: '35MPa - High Strength', description: 'Beams, high load structures' },
      { value: '40MPa', label: '40MPa - Premium', description: 'Columns, high-rise structures' }
    ];
  }

  /**
   * Submit quick order
   */
  async submitQuickOrder(orderData: QuickOrderData, contactInfo?: { name: string; phone: string }): Promise<boolean> {
    try {
      const order: Partial<ConcreteOrder> = {
        id: `ORD-${Date.now()}`,
        projectArea: orderData.area,
        structure: orderData.structure,
        volume: parseInt(orderData.volume),
        grade: orderData.grade,
        deliveryDate: orderData.deliveryDate,
        deliveryTime: orderData.deliveryTime,
        status: 'Submitted',
        priority: 'Medium',
        contactPerson: contactInfo?.name,
        contactPhone: contactInfo?.phone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Submitting quick order:', order);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error submitting quick order:', error);
      return false;
    }
  }

  /**
   * Submit advanced order
   */
  async submitAdvancedOrder(orderData: any): Promise<boolean> {
    try {
      const order: Partial<ConcreteOrder> = {
        id: `ORD-${Date.now()}`,
        ...orderData,
        status: 'Submitted',
        priority: 'Medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Submitting advanced order:', order);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return true;
    } catch (error) {
      console.error('Error submitting advanced order:', error);
      return false;
    }
  }

  /**
   * Get order history
   */
  async getOrderHistory(): Promise<ConcreteOrder[]> {
    // Mock data
    return [
      {
        id: 'ORD-001',
        projectArea: 'area-1',
        structure: 'struct-1',
        volume: 40,
        grade: '25MPa',
        deliveryDate: '2024-10-01',
        deliveryTime: '08:00',
        status: 'Delivered',
        priority: 'High',
        contactPerson: 'John Smith',
        contactPhone: '+27 82 123 4567',
        createdAt: '2024-09-28T10:00:00Z',
        updatedAt: '2024-10-01T16:30:00Z'
      },
      {
        id: 'ORD-002',
        projectArea: 'area-2',
        structure: 'struct-4',
        volume: 60,
        grade: '40MPa',
        deliveryDate: '2024-10-02',
        deliveryTime: '10:00',
        status: 'Dispatched',
        priority: 'High',
        contactPerson: 'Mike Johnson',
        contactPhone: '+27 83 234 5678',
        createdAt: '2024-09-29T14:00:00Z',
        updatedAt: '2024-10-02T08:00:00Z'
      }
    ];
  }

  /**
   * Get recommended specifications for structure
   */
  async getStructureSpecs(areaId: string, structureId: string): Promise<Structure | null> {
    const areas = await this.getProjectAreas();
    const area = areas.find(a => a.id === areaId);
    if (!area) return null;
    
    return area.structures.find(s => s.id === structureId) || null;
  }

  /**
   * Calculate estimated delivery time based on volume and current load
   */
  calculateEstimatedDelivery(volume: number, requestedDate: string, requestedTime: string): {
    estimatedTime: string;
    confidence: 'High' | 'Medium' | 'Low';
    alternatives?: string[];
  } {
    // Mock calculation logic
    const requestedDateTime = new Date(`${requestedDate}T${requestedTime}`);
    const now = new Date();
    
    // Simple logic for demo
    if (volume <= 30) {
      return {
        estimatedTime: requestedTime,
        confidence: 'High'
      };
    } else if (volume <= 60) {
      return {
        estimatedTime: requestedTime,
        confidence: 'Medium',
        alternatives: ['06:00', '14:00']
      };
    } else {
      // Large volume may need scheduling adjustment
      const alternativeTime = new Date(requestedDateTime.getTime() + 2 * 60 * 60 * 1000);
      return {
        estimatedTime: alternativeTime.toTimeString().slice(0, 5),
        confidence: 'Low',
        alternatives: ['06:00', '14:00', '16:00']
      };
    }
  }

  /**
   * Validate order data
   */
  validateOrder(orderData: QuickOrderData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!orderData.area) errors.push('Project area is required');
    if (!orderData.structure) errors.push('Structure selection is required');
    if (!orderData.volume || parseInt(orderData.volume) <= 0) errors.push('Valid volume is required');
    if (!orderData.grade) errors.push('Concrete grade is required');
    if (!orderData.deliveryDate) errors.push('Delivery date is required');
    if (!orderData.deliveryTime) errors.push('Delivery time is required');

    // Check if delivery date is not in the past
    const deliveryDate = new Date(orderData.deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deliveryDate < today) errors.push('Delivery date cannot be in the past');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const concreteOrderingService = new ConcreteOrderingService();