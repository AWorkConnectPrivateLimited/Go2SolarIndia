import { BaseDatabaseService } from './database';
import { supabase } from './client';

export interface EnergyConsumption {
  id: string;
  project_id: string;
  date: string;
  consumption_kwh: number;
  generation_kwh: number;
  battery_level: number;
  created_at: string;
  updated_at: string;
}

export class EnergyService extends BaseDatabaseService {
  constructor() {
    super('energy_consumption');
  }

  async getProjectEnergyData(projectId: string) {
    return this.getByField<EnergyConsumption>('project_id', projectId);
  }

  async getEnergyDataByDateRange(projectId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('project_id', projectId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return data as EnergyConsumption[];
  }

  async getDailyEnergyStats(projectId: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('date, consumption_kwh, generation_kwh, battery_level')
      .eq('project_id', projectId)
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;
    return data;
  }

  async getMonthlyEnergyStats(projectId: string, year: number, month: number) {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    const { data, error } = await supabase
      .from(this.table)
      .select('consumption_kwh, generation_kwh')
      .eq('project_id', projectId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const stats = {
      totalConsumption: 0,
      totalGeneration: 0,
      netEnergy: 0,
      days: data.length
    };

    data.forEach(record => {
      stats.totalConsumption += record.consumption_kwh;
      stats.totalGeneration += record.generation_kwh;
    });

    stats.netEnergy = stats.totalGeneration - stats.totalConsumption;
    return stats;
  }

  async getBatteryStatus(projectId: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('battery_level, date')
      .eq('project_id', projectId)
      .order('date', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data[0] as EnergyConsumption;
  }
} 