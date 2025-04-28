import React, { StyleSheet, View, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { Text, Card, Button, TextInput, useTheme, IconButton, RadioButton, Surface, Divider, ActivityIndicator } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { supabase } from '../../src/services/supabase/client';
import { useAuth } from '../../src/hooks/useAuth';
import { env } from '../../src/config/env';
import Slider from '@react-native-community/slider';
import CustomDropdown from '../../src/components/CustomDropdown';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface QuoteDetails {
  systemSize: number;
  spaceRequired: number;
  annualEnergy: number;
  annualSavings: number;
  customerPayment: number;
  subsidy: number;
  effectiveCost: number;
  digital_project_id?: string;
  digital_project_capacity?: number;
  savings_range?: number;
}

type SolarType = 'physical' | 'digital';
type ProjectType = 'residential' | 'commercial';

interface DigitalSolarProject {
  id: string;
  name: string;
  location: string;
  state: string;
  capacity: number;
  availableCapacity: number;
  pricePerKw: number;
}

interface State {
  code: string;
  name: string;
}

interface ElectricityProvider {
  id: string;
  name: string;
  state: string;
}

const STATES: State[] = [
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'DL', name: 'Delhi' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'HR', name: 'Haryana' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'TS', name: 'Telangana' },
  { code: 'UP', name: 'Uttar Pradesh' },
];

const ELECTRICITY_PROVIDERS: ElectricityProvider[] = [
  { id: '1', name: 'Tata Power', state: 'MH' },
  { id: '2', name: 'BEST', state: 'MH' },
  { id: '3', name: 'MSEDCL', state: 'MH' },
  { id: '4', name: 'BESCOM', state: 'KA' },
  { id: '5', name: 'TATA Power', state: 'DL' },
  { id: '6', name: 'BSES Rajdhani', state: 'DL' },
  { id: '7', name: 'BSES Yamuna', state: 'DL' },
  { id: '8', name: 'TANGEDCO', state: 'TN' },
  { id: '9', 'name': 'TSNPDCL', state: 'TS' },
  { id: '10', name: 'UPPCL', state: 'UP' },
];

const DIGITAL_SOLAR_PROJECTS: DigitalSolarProject[] = [
  { id: '1', name: 'Solar Farm - Maharashtra', location: 'Nagpur', state: 'MH', capacity: 100, availableCapacity: 45, pricePerKw: 85000 },
  { id: '2', name: 'Solar Farm - Karnataka', location: 'Bangalore', state: 'KA', capacity: 80, availableCapacity: 30, pricePerKw: 82000 },
  { id: '3', name: 'Solar Farm - Gujarat', location: 'Ahmedabad', state: 'GJ', capacity: 120, availableCapacity: 60, pricePerKw: 80000 },
  { id: '4', name: 'Solar Farm - Tamil Nadu', location: 'Chennai', state: 'TN', capacity: 90, availableCapacity: 35, pricePerKw: 83000 },
  { id: '5', name: 'Solar Farm - Telangana', location: 'Hyderabad', state: 'TS', capacity: 110, availableCapacity: 50, pricePerKw: 81000 },
];

interface SystemTier {
  minBill: number;
  maxBill: number;
  systemSize: number;
  area: number;
  annualUnits: number;
  annualSavings: number;
  price: number;
  subsidy: number;
}

const SYSTEM_TIERS: SystemTier[] = [
  { minBill: 0, maxBill: 800, systemSize: 1, area: 90, annualUnits: 1440, annualSavings: 10600, price: 98000, subsidy: 30000 },
  { minBill: 801, maxBill: 1400, systemSize: 2, area: 140, annualUnits: 2880, annualSavings: 18800, price: 149000, subsidy: 60000 },
  { minBill: 1401, maxBill: 2800, systemSize: 3, area: 280, annualUnits: 4320, annualSavings: 33000, price: 199000, subsidy: 78000 },
  { minBill: 2801, maxBill: 3500, systemSize: 4, area: 350, annualUnits: 5800, annualSavings: 45000, price: 249000, subsidy: 78000 },
  { minBill: 3501, maxBill: 4500, systemSize: 5, area: 450, annualUnits: 7500, annualSavings: 60000, price: 313000, subsidy: 78000 },
  { minBill: 4501, maxBill: 5400, systemSize: 6, area: 550, annualUnits: 9500, annualSavings: 66000, price: 360000, subsidy: 78000 },
  { minBill: 5401, maxBill: 6200, systemSize: 7, area: 620, annualUnits: 10800, annualSavings: 78000, price: 422000, subsidy: 78000 },
  { minBill: 6201, maxBill: 7000, systemSize: 8, area: 680, annualUnits: 12000, annualSavings: 88000, price: 466000, subsidy: 78000 },
  { minBill: 7001, maxBill: 7900, systemSize: 9, area: 760, annualUnits: 13500, annualSavings: 96000, price: 517000, subsidy: 78000 },
  { minBill: 7901, maxBill: 8800, systemSize: 10, area: 850, annualUnits: 15100, annualSavings: 110000, price: 560000, subsidy: 78000 },
];

interface QuoteData {
  customer_id: string;
  project_type: ProjectType;
  solar_type: SolarType;
  status: string;
  capacity_kw: number;
  estimated_cost: number;
  subsidy_amount: number;
  effective_cost: number;
  space_required: number;
  annual_energy: number;
  annual_savings: number;
  monthly_bill: string;
  needs_financing: 'yes' | 'no' | 'maybe';
  installation_address: string;
  city: string;
  state: string;
  pincode: string;
  electricity_provider: string;
  created_at: string;
  updated_at: string;
  digital_project_id?: string;
  digital_project_capacity?: number;
  savings_range?: number;
}

export default function QuotePage() {
  const theme = useTheme();
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [solarType, setSolarType] = useState<SolarType>('physical');
  const [projectType, setProjectType] = useState<ProjectType>('residential');
  const [billAmount, setBillAmount] = useState('');
  const [needFinancing, setNeedFinancing] = useState<'yes' | 'no' | 'maybe'>('yes');
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedCapacity, setSelectedCapacity] = useState<number>(0);
  const [savingsRange, setSavingsRange] = useState<number>(20);
  
  // Predefined savings range options to avoid slider flickering
  const savingsRangeOptions = [0, 25, 50, 75, 100];
  
  // Calculate recommended capacity based on electricity bill
  const calculateRecommendedCapacity = (billAmount: string, project: DigitalSolarProject | undefined) => {
    if (!billAmount || !project) return 0;
    
    const monthlyBill = parseFloat(billAmount);
    if (isNaN(monthlyBill)) return 0;
    
    // Calculate annual bill
    const annualBill = monthlyBill * 12;
    
    // Calculate annual energy consumption (kWh)
    // Assuming average electricity rate of ₹8 per unit
    const annualEnergyConsumption = annualBill / 8;
    
    // Calculate required capacity based on energy consumption
    // Assuming 4.5 peak sun hours per day on average
    // Formula: Capacity (kW) = Annual Energy (kWh) / (365 days * 4.5 peak sun hours)
    const recommendedCapacity = Math.ceil(annualEnergyConsumption / (365 * 4.5));
    
    // Ensure capacity is within available range
    const minCapacity = 1;
    const maxCapacity = project.availableCapacity;
    
    return Math.min(Math.max(recommendedCapacity, minCapacity), maxCapacity);
  };
  
  // Calculate price based on capacity, project price, and savings range
  const calculatePrice = (capacity: number, project: DigitalSolarProject | undefined, savingsRange: number) => {
    if (!project) return 0;
    
    // Base price calculation
    const basePrice = capacity * project.pricePerKw;
    
    // Adjust price based on savings range
    // Higher savings = higher price (premium for better savings)
    // Lower savings = lower price (discount for lower savings)
    const savingsMultiplier = 0.5 + (savingsRange / 100);
    
    return Math.round(basePrice * savingsMultiplier);
  };
  
  // Update selected capacity when bill amount changes
  useEffect(() => {
    if (solarType === 'digital' && selectedProject && billAmount) {
      const project = DIGITAL_SOLAR_PROJECTS.find(p => p.id === selectedProject);
      if (project) {
        const recommendedCapacity = calculateRecommendedCapacity(billAmount, project);
        setSelectedCapacity(recommendedCapacity);
      }
    }
  }, [billAmount, selectedProject, solarType]);
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 12,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    pageTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    section: {
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    addressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 8,
      elevation: 2,
    },
    addressText: {
      flex: 1,
      marginHorizontal: 6,
      color: theme.colors.onSurface,
      fontSize: 12,
    },
    optionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    optionCard: {
      flex: 1,
      margin: 3,
      borderRadius: 8,
      overflow: 'hidden',
    },
    optionContent: {
      padding: 8,
      alignItems: 'center',
    },
    selectedOption: {
      backgroundColor: '#E8F5E9',
    },
    unselectedOption: {
      backgroundColor: '#fff',
    },
    optionIcon: {
      marginBottom: 4,
    },
    optionLabel: {
      color: theme.colors.onSurface,
      fontSize: 13,
      textAlign: 'center',
    },
    optionDescription: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 10,
      textAlign: 'center',
      marginTop: 2,
    },
    billInput: {
      backgroundColor: '#fff',
      marginTop: 4,
      borderRadius: 8,
      height: 45,
    },
    financingContainer: {
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 8,
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    financingOptionsRow: {
      flexDirection: 'row',
      gap: 16,
    },
    financingOption: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    financingOptionText: {
      marginLeft: 4,
      fontSize: 13,
      color: theme.colors.onSurface,
    },
    bottomButton: {
      marginTop: 16,
      marginBottom: 8,
      borderRadius: 8,
    },
    buttonContainer: {
      paddingHorizontal: 12,
      marginTop: 16,
      marginBottom: 24,
    },
    quoteDetailsContainer: {
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 16,
      marginTop: 8,
      elevation: 2,
      marginBottom: 20,
    },
    quoteHeader: {
      alignItems: 'center',
      marginBottom: 16,
    },
    quoteTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    quoteSubtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    gridItem: {
      width: '48%',
      marginBottom: 12,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 1,
    },
    detailCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      backgroundColor: '#F5F5F5',
    },
    detailCardIcon: {
      marginRight: 8,
    },
    detailCardTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    detailCardContent: {
      padding: 10,
    },
    detailValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    detailDescription: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    costSection: {
      marginTop: 8,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 2,
    },
    costHeader: {
      backgroundColor: theme.colors.primary,
      padding: 10,
      alignItems: 'center',
    },
    costHeaderText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    costRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    costLabel: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    costValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    totalRow: {
      backgroundColor: '#E8F5E9',
      borderBottomWidth: 0,
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    totalValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#4CAF50',
    },
    actionButton: {
      marginTop: 16,
      marginBottom: 8,
      borderRadius: 12,
      paddingVertical: 8,
    },
    actionButtonLabel: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    dropdownContainer: {
      backgroundColor: '#fff',
      borderRadius: 8,
      marginTop: 4,
      overflow: 'hidden',
    },
    dropdown: {
      height: 45,
    },
    digitalProjectCard: {
      marginBottom: 8,
      borderRadius: 8,
      overflow: 'hidden',
    },
    digitalProjectHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      backgroundColor: '#F5F5F5',
    },
    digitalProjectTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    digitalProjectContent: {
      padding: 10,
    },
    digitalProjectInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    digitalProjectLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    digitalProjectValue: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    capacitySelector: {
      marginTop: 8,
    },
    capacityLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
    },
    capacityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      marginBottom: 4,
    },
    capacityButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#f0f0f0',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 16,
    },
    capacityDisplay: {
      minWidth: 80,
      height: 40,
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    capacityValue: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    savingsRangeContainer: {
      marginTop: 8,
    },
    savingsRangeValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 8,
    },
    savingsRangeButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    savingsRangeButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: '#f0f0f0',
      minWidth: 60,
      alignItems: 'center',
    },
    savingsRangeButtonSelected: {
      backgroundColor: theme.colors.primary,
    },
    savingsRangeButtonText: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    savingsRangeButtonTextSelected: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });

  useEffect(() => {
    (async () => {
      try {
        setLocationLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Please enable location services to continue');
          setLocationLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = currentLocation.coords;
        
        const geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        
        if (geocode.length > 0) {
          const address = `${geocode[0].street || ''} ${geocode[0].name || ''}, ${geocode[0].city || ''}, ${geocode[0].region || ''}`;
          setLocation({
            latitude,
            longitude,
            address: address.trim(),
          });
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to get location');
        console.error(error);
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    // Check if customer_profiles table exists
    const checkCustomerProfilesTable = async () => {
      try {
        const { data, error } = await supabase
          .from('customer_profiles')
          .select('count')
          .limit(1);
        
        if (error) {
          console.error('Error checking customer_profiles table:', error);
          
          // If the table doesn't exist, create it
          if (error.code === '42P01') { // Table does not exist
            console.log('Creating customer_profiles table...');
            
            // Create the table using SQL
            const { error: createError } = await supabase.rpc('create_customer_profiles_table');
            
            if (createError) {
              console.error('Error creating customer_profiles table:', createError);
            } else {
              console.log('customer_profiles table created successfully');
            }
          }
        } else {
          console.log('customer_profiles table exists');
        }
      } catch (err) {
        console.error('Unexpected error checking customer_profiles table:', err);
      }
    };
    
    // Check if solar_projects table exists
    const checkSolarProjectsTable = async () => {
      try {
        const { data, error } = await supabase
          .from('solar_projects')
          .select('count')
          .limit(1);
        
        if (error) {
          console.error('Error checking solar_projects table:', error);
          
          // If the table doesn't exist, create it
          if (error.code === '42P01') { // Table does not exist
            console.log('Creating solar_projects table...');
            
            // Create the table using SQL
            const { error: createError } = await supabase.rpc('create_solar_projects_table');
            
            if (createError) {
              console.error('Error creating solar_projects table:', createError);
            } else {
              console.log('solar_projects table created successfully');
            }
          }
        } else {
          console.log('solar_projects table exists');
        }
      } catch (err) {
        console.error('Unexpected error checking solar_projects table:', err);
      }
    };
    
    checkCustomerProfilesTable();
    checkSolarProjectsTable();
  }, []);

  const calculateQuote = () => {
    const monthlyBill = parseFloat(billAmount);
    if (isNaN(monthlyBill)) return;

    let calculatedDetails: QuoteDetails;

    if (solarType === 'physical') {
      // Find the appropriate tier based on monthly bill
      let tier: SystemTier | undefined;

      if (monthlyBill <= 8800) {
        // For bills up to ₹8,800, use the predefined tiers
        tier = SYSTEM_TIERS.find(t => monthlyBill >= t.minBill && monthlyBill <= t.maxBill);
        
        if (!tier) {
          Alert.alert(
            'Bill Amount Out of Range',
            'Please enter a valid monthly bill amount',
            [{ text: 'OK' }]
          );
      return;
    }

        calculatedDetails = {
          systemSize: tier.systemSize,
          spaceRequired: tier.area,
          annualEnergy: tier.annualUnits,
          annualSavings: tier.annualSavings,
          customerPayment: tier.price,
          subsidy: tier.subsidy,
          effectiveCost: tier.price - tier.subsidy
        };
      } else {
        // For bills above ₹8,800, calculate based on 1kW value
        // Using the values from the 1kW tier as base
        const baseTier = SYSTEM_TIERS[0]; // 1kW tier
        
        // Calculate system size based on bill amount (using the ratio from the 1kW tier)
        // If 1kW corresponds to ₹800 bill, then X kW corresponds to monthlyBill
        const systemSize = Math.ceil(monthlyBill / baseTier.maxBill);
        
        // Calculate other values proportionally
        const spaceRequired = Math.round(systemSize * baseTier.area);
        const annualEnergy = Math.round(systemSize * baseTier.annualUnits);
        const annualSavings = Math.round(systemSize * baseTier.annualSavings);
        const price = Math.round(systemSize * baseTier.price);
        
        // Subsidy is constant at ₹78,000 for all systems above 3kW
        const subsidy = 78000;
        
        calculatedDetails = {
      systemSize,
          spaceRequired,
          annualEnergy,
          annualSavings,
          customerPayment: price,
          subsidy,
          effectiveCost: price - subsidy
        };
      }
    } else {
      // Digital solar calculation
      if (!selectedProject || selectedCapacity <= 0) {
        Alert.alert(
          'Missing Information',
          'Please select a digital solar project and capacity',
          [{ text: 'OK' }]
        );
        return;
      }

      const project = DIGITAL_SOLAR_PROJECTS.find(p => p.id === selectedProject);
      if (!project) {
        Alert.alert('Error', 'Selected project not found');
        return;
      }

      // Calculate annual energy based on capacity and location
      // Assuming 4.5 peak sun hours per day on average
      const annualEnergy = Math.round(selectedCapacity * 4.5 * 365);
      
      // Calculate annual savings based on monthly bill and savings range
      const annualBill = monthlyBill * 12;
      const annualSavings = Math.round(annualBill * (savingsRange / 100));
      
      // Calculate price based on capacity, project's price per kW, and savings range
      const price = calculatePrice(selectedCapacity, project, savingsRange);
      
      // No subsidy for digital solar
      const subsidy = 0;
      
      calculatedDetails = {
        systemSize: selectedCapacity,
        spaceRequired: 0, // Not applicable for digital solar
        annualEnergy,
      annualSavings,
        customerPayment: price,
        subsidy,
        effectiveCost: price,
        digital_project_id: selectedProject,
        digital_project_capacity: selectedCapacity,
        savings_range: savingsRange
      };
    }
    
    setQuoteDetails(calculatedDetails);
    setShowQuoteDetails(true);
  };

  const handleProceedToBook = async () => {
    if (!quoteDetails) return;

    try {
      setIsSubmitting(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User authentication error:', userError);
        throw new Error('User not authenticated');
      }
      console.log('User authenticated:', user.id);

      // Get customer profile
      let { data: profile, error: profileError } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If profile doesn't exist, create it using a server function that bypasses RLS
      if (profileError && profileError.code === 'PGRST116') { // No rows returned
        console.log('Customer profile not found, creating one...');
        
        // Create a default profile using a server function that bypasses RLS
        const { data: newProfile, error: createError } = await supabase.rpc(
          'create_customer_profile',
          {
            p_user_id: user.id,
            p_address: location?.address || 'Address not provided',
            p_city: 'City not provided',
            p_state: selectedState || 'State not provided',
            p_pincode: 'Pincode not provided',
            p_electricity_provider: selectedProvider || 'Provider not specified',
            p_average_bill: parseFloat(billAmount) || 0
          }
        );
          
        if (createError) {
          console.error('Error creating customer profile:', createError);
          throw new Error('Failed to create customer profile');
        }
        
        profile = newProfile;
        console.log('Customer profile created:', profile);
      } else if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Failed to fetch customer profile');
      } else {
        console.log('Customer profile fetched:', profile);
      }

      // Prepare quote data
      const quoteData: QuoteData = {
        customer_id: user.id,
        project_type: projectType,
        solar_type: solarType,
        status: 'quote',
        capacity_kw: quoteDetails.systemSize,
        estimated_cost: quoteDetails.customerPayment,
        subsidy_amount: quoteDetails.subsidy,
        effective_cost: quoteDetails.effectiveCost,
        space_required: quoteDetails.spaceRequired,
        annual_energy: quoteDetails.annualEnergy,
        annual_savings: quoteDetails.annualSavings,
        monthly_bill: billAmount,
        needs_financing: needFinancing,
        installation_address: profile.address,
        city: profile.city,
        state: selectedState || profile.state,
        pincode: profile.pincode,
        electricity_provider: selectedProvider || profile.electricity_provider,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add digital solar specific fields if applicable
      if (solarType === 'digital' && selectedProject) {
        quoteData.digital_project_id = selectedProject;
        quoteData.digital_project_capacity = selectedCapacity;
        quoteData.savings_range = savingsRange;
      }

      // Save to Supabase using a server function that bypasses RLS
      let { data: savedQuote, error: saveError } = await supabase.rpc(
        'create_solar_project',
        {
          p_customer_id: user.id,
          p_project_type: projectType,
          p_solar_type: solarType,
          p_status: 'quote',
          p_capacity_kw: quoteDetails.systemSize,
          p_estimated_cost: quoteDetails.customerPayment,
          p_subsidy_amount: quoteDetails.subsidy,
          p_effective_cost: quoteDetails.effectiveCost,
          p_space_required: quoteDetails.spaceRequired,
          p_annual_energy: quoteDetails.annualEnergy,
          p_annual_savings: quoteDetails.annualSavings,
          p_monthly_bill: billAmount,
          p_needs_financing: needFinancing,
          p_installation_address: profile.address,
          p_city: profile.city,
          p_state: selectedState || profile.state,
          p_pincode: profile.pincode,
          p_electricity_provider: selectedProvider || profile.electricity_provider
        }
      );

      if (saveError) {
        console.error('Quote save error:', saveError);
        throw new Error('Failed to save quote');
      }
      
      console.log('Quote saved successfully:', savedQuote);

      // Navigate to booking screen
      router.push({
        pathname: '/booking',
        params: { quoteId: savedQuote.id }
      });
    } catch (error) {
      console.error('Error saving quote:', error);
      Alert.alert(
        'Error',
        'Failed to save your quote. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuoteDetails = () => {
    if (!quoteDetails) return null;

    return (
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.content}>
            <View style={styles.quoteDetailsContainer}>
              <View style={styles.quoteHeader}>
                <Text style={styles.quoteTitle}>Your Solar Quote</Text>
                <Text style={styles.quoteSubtitle}>
                  Based on your monthly bill of ₹{parseFloat(billAmount).toLocaleString()}
                </Text>
              </View>
              
              <View style={styles.gridContainer}>
                <Surface style={styles.gridItem}>
                  <View style={styles.detailCardHeader}>
                    <MaterialCommunityIcons 
                      name="solar-panel-large" 
                      size={20} 
                      color={theme.colors.primary} 
                      style={styles.detailCardIcon}
                    />
                    <Text style={styles.detailCardTitle}>System Size</Text>
                  </View>
                  <View style={styles.detailCardContent}>
                    <Text style={styles.detailValue}>{quoteDetails.systemSize} kW</Text>
                    <Text style={styles.detailDescription}>
                      Perfect for your energy consumption needs
                    </Text>
                  </View>
                </Surface>
                
                <Surface style={styles.gridItem}>
                  <View style={styles.detailCardHeader}>
                    <MaterialCommunityIcons 
                      name="ruler-square" 
                      size={20} 
                      color={theme.colors.primary} 
                      style={styles.detailCardIcon}
                    />
                    <Text style={styles.detailCardTitle}>Space Required</Text>
                  </View>
                  <View style={styles.detailCardContent}>
                    <Text style={styles.detailValue}>{quoteDetails.spaceRequired} sqft</Text>
                    <Text style={styles.detailDescription}>
                      Roof area needed for installation
                    </Text>
                  </View>
                </Surface>
                
                <Surface style={styles.gridItem}>
                  <View style={styles.detailCardHeader}>
                    <MaterialCommunityIcons 
                      name="lightning-bolt" 
                      size={20} 
                      color={theme.colors.primary} 
                      style={styles.detailCardIcon}
                    />
                    <Text style={styles.detailCardTitle}>Annual Energy</Text>
                  </View>
                  <View style={styles.detailCardContent}>
                    <Text style={styles.detailValue}>{quoteDetails.annualEnergy} Units</Text>
                    <Text style={styles.detailDescription}>
                      Clean energy produced annually
                    </Text>
                  </View>
                </Surface>
                
                <Surface style={styles.gridItem}>
                  <View style={styles.detailCardHeader}>
                    <MaterialCommunityIcons 
                      name="currency-inr" 
                      size={20} 
                      color={theme.colors.primary} 
                      style={styles.detailCardIcon}
                    />
                    <Text style={styles.detailCardTitle}>Annual Savings</Text>
                  </View>
                  <View style={styles.detailCardContent}>
                    <Text style={styles.detailValue}>₹{quoteDetails.annualSavings.toLocaleString()}</Text>
                    <Text style={styles.detailDescription}>
                      Money saved on electricity bills
                    </Text>
                  </View>
                </Surface>
              </View>
              
              <Surface style={styles.costSection}>
                <View style={styles.costHeader}>
                  <Text style={styles.costHeaderText}>Cost Breakdown</Text>
                </View>
                
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Amount to be paid to Go2Solar</Text>
                  <Text style={styles.costValue}>₹{quoteDetails.customerPayment.toLocaleString()}</Text>
                </View>
                
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Subsidy</Text>
                  <Text style={[styles.costValue, { color: '#4CAF50' }]}>
                    ₹{quoteDetails.subsidy.toLocaleString()}
                  </Text>
                </View>
                
                <View style={[styles.costRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Effective Cost of Ownership</Text>
                  <Text style={styles.totalValue}>
                    ₹{quoteDetails.effectiveCost.toLocaleString()}
                  </Text>
                </View>
              </Surface>
          
          <Button
            mode="contained"
                onPress={handleProceedToBook}
                style={styles.actionButton}
                labelStyle={styles.actionButtonLabel}
                icon="check-circle"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Processing...</Text>
                  </View>
                ) : (
                  'Proceed to Book'
                )}
          </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  if (showQuoteDetails) {
    return renderQuoteDetails();
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Do You Need Solar For Home?</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Installation Address</Text>
            <View style={styles.addressContainer}>
              <MaterialCommunityIcons name="map-marker" size={18} color={theme.colors.primary} />
              <Text style={styles.addressText} numberOfLines={2}>
                {locationLoading ? 'Getting location...' : location?.address || 'Location not available'}
              </Text>
              <MaterialCommunityIcons name="crosshairs-gps" size={18} color={theme.colors.primary} />
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Solar Type</Text>
            <View style={styles.optionsContainer}>
              <Card style={styles.optionCard} onPress={() => setSolarType('physical')}>
                <View style={[styles.optionContent, solarType === 'physical' ? styles.selectedOption : styles.unselectedOption]}>
                  <MaterialCommunityIcons
                    name="solar-panel-large"
                    size={24}
                    color="#8BC34A"
                    style={styles.optionIcon}
                  />
                  <Text style={styles.optionLabel}>Physical Solar</Text>
                  <Text style={styles.optionDescription}>Install panels on your property</Text>
                </View>
      </Card>
      
              <Card style={styles.optionCard} onPress={() => setSolarType('digital')}>
                <View style={[styles.optionContent, solarType === 'digital' ? styles.selectedOption : styles.unselectedOption]}>
                  <MaterialCommunityIcons
                    name="solar-power"
                    size={24}
                    color="#8BC34A"
                    style={styles.optionIcon}
                  />
                  <Text style={styles.optionLabel}>Digital Solar</Text>
                  <Text style={styles.optionDescription}>Subscribe to solar energy</Text>
                </View>
              </Card>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Type</Text>
            <View style={styles.optionsContainer}>
              <Card style={styles.optionCard} onPress={() => setProjectType('residential')}>
                <View style={[styles.optionContent, projectType === 'residential' ? styles.selectedOption : styles.unselectedOption]}>
                  <MaterialCommunityIcons
                    name="home"
                    size={24}
                    color="#8BC34A"
                    style={styles.optionIcon}
                  />
                  <Text style={styles.optionLabel}>Residential</Text>
                </View>
              </Card>
              
              <Card style={styles.optionCard} onPress={() => setProjectType('commercial')}>
                <View style={[styles.optionContent, projectType === 'commercial' ? styles.selectedOption : styles.unselectedOption]}>
                  <MaterialCommunityIcons
                    name="office-building"
                    size={24}
                    color="#8BC34A"
                    style={styles.optionIcon}
                  />
                  <Text style={styles.optionLabel}>Commercial</Text>
                </View>
              </Card>
            </View>
          </View>
          
          {solarType === 'digital' && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select State</Text>
                <CustomDropdown
                  label="Select State"
                  value={selectedState}
                  options={[
                    { label: "Select a state", value: "" },
                    ...STATES.map(state => ({ label: state.name, value: state.code }))
                  ]}
                  onValueChange={(value) => {
                    setSelectedState(value);
                    // Reset provider and project when state changes
                    setSelectedProvider('');
                    setSelectedProject('');
                  }}
                  placeholder="Select a state"
                />
              </View>
              
              {selectedState && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Select Electricity Provider</Text>
                  <CustomDropdown
                    label="Select Electricity Provider"
                    value={selectedProvider}
                    options={[
                      { label: "Select a provider", value: "" },
                      ...ELECTRICITY_PROVIDERS
                        .filter(provider => provider.state === selectedState)
                        .map(provider => ({ label: provider.name, value: provider.name }))
                    ]}
                    onValueChange={(value) => {
                      setSelectedProvider(value);
                      // Reset project when provider changes
                      setSelectedProject('');
                    }}
                    placeholder="Select a provider"
                  />
                </View>
              )}
              
              {selectedProvider && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Available Digital Solar Projects</Text>
                  {DIGITAL_SOLAR_PROJECTS
                    .filter(project => project.state === selectedState)
                    .map((project) => (
                      <Card 
                        key={project.id} 
                        style={[
                          styles.digitalProjectCard, 
                          selectedProject === project.id ? { borderColor: theme.colors.primary, borderWidth: 2 } : {}
                        ]}
                        onPress={() => setSelectedProject(project.id)}
                      >
                        <View style={styles.digitalProjectHeader}>
                          <Text style={styles.digitalProjectTitle}>{project.name}</Text>
                          <MaterialCommunityIcons 
                            name={selectedProject === project.id ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                            size={20} 
                            color={selectedProject === project.id ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                          />
                        </View>
                        <View style={styles.digitalProjectContent}>
                          <View style={styles.digitalProjectInfo}>
                            <Text style={styles.digitalProjectLabel}>Location:</Text>
                            <Text style={styles.digitalProjectValue}>{project.location}</Text>
                          </View>
                          <View style={styles.digitalProjectInfo}>
                            <Text style={styles.digitalProjectLabel}>Total Capacity:</Text>
                            <Text style={styles.digitalProjectValue}>{project.capacity} kW</Text>
                          </View>
                          <View style={styles.digitalProjectInfo}>
                            <Text style={styles.digitalProjectLabel}>Available Capacity:</Text>
                            <Text style={styles.digitalProjectValue}>{project.availableCapacity} kW</Text>
                          </View>
                          <View style={styles.digitalProjectInfo}>
                            <Text style={styles.digitalProjectLabel}>Price per kW:</Text>
                            <Text style={styles.digitalProjectValue}>₹{project.pricePerKw.toLocaleString()}</Text>
                          </View>
                        </View>
                      </Card>
                    ))}
                </View>
              )}
            </>
          )}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Electricity Bill</Text>
            <TextInput
              label="Enter Amount (Rs.)"
              value={billAmount}
              onChangeText={setBillAmount}
              keyboardType="numeric"
              mode="outlined"
              style={styles.billInput}
            />
          </View>
          
          {solarType === 'digital' && selectedProject && billAmount && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Capacity to Reserve</Text>
                <View style={styles.capacitySelector}>
                  <Text style={styles.capacityLabel}>
                    Recommended Capacity: {selectedCapacity} kW
                    <Text style={{ color: theme.colors.primary, fontSize: 12 }}>
                      {" "}(Based on your bill)
                    </Text>
                  </Text>
                  
                  {/* Replace slider with increment/decrement controls */}
                  <View style={styles.capacityControls}>
                    <TouchableOpacity 
                      style={styles.capacityButton}
                      onPress={() => {
                        const project = DIGITAL_SOLAR_PROJECTS.find(p => p.id === selectedProject);
                        if (project && selectedCapacity > 1) {
                          setSelectedCapacity(selectedCapacity - 1);
                        }
                      }}
                      disabled={selectedCapacity <= 1}
                    >
                      <MaterialCommunityIcons 
                        name="minus" 
                        size={24} 
                        color={selectedCapacity <= 1 ? theme.colors.outlineVariant : theme.colors.primary} 
                      />
                    </TouchableOpacity>
                    
                    <View style={styles.capacityDisplay}>
                      <Text style={styles.capacityValue}>{selectedCapacity} kW</Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.capacityButton}
                      onPress={() => {
                        const project = DIGITAL_SOLAR_PROJECTS.find(p => p.id === selectedProject);
                        if (project && selectedCapacity < project.availableCapacity) {
                          setSelectedCapacity(selectedCapacity + 1);
                        }
                      }}
                      disabled={selectedCapacity >= (DIGITAL_SOLAR_PROJECTS.find(p => p.id === selectedProject)?.availableCapacity || 10)}
                    >
                      <MaterialCommunityIcons 
                        name="plus" 
                        size={24} 
                        color={selectedCapacity >= (DIGITAL_SOLAR_PROJECTS.find(p => p.id === selectedProject)?.availableCapacity || 10) ? theme.colors.outlineVariant : theme.colors.primary} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={[styles.capacityLabel, { marginTop: 8, fontSize: 11 }]}>
                    You can adjust the capacity if needed. Higher capacity = Higher energy generation.
                  </Text>
                </View>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Expected Savings Range</Text>
                <View style={styles.savingsRangeContainer}>
                  <Text style={styles.savingsRangeValue}>{savingsRange}%</Text>
                  
                  {/* Replace slider with buttons to avoid flickering */}
                  <View style={styles.savingsRangeButtons}>
                    {savingsRangeOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.savingsRangeButton,
                          savingsRange === option && styles.savingsRangeButtonSelected
                        ]}
                        onPress={() => setSavingsRange(option)}
                      >
                        <Text 
                          style={[
                            styles.savingsRangeButtonText,
                            savingsRange === option && styles.savingsRangeButtonTextSelected
                          ]}
                        >
                          {option}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <Text style={styles.capacityLabel}>
                    Select your expected savings percentage
                  </Text>
                  <Text style={[styles.capacityLabel, { color: theme.colors.primary, marginTop: 4 }]}>
                    Higher savings = Higher price
                  </Text>
                </View>
              </View>
            </>
          )}
          
          <View style={styles.section}>
            <View style={styles.financingContainer}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Need Financing?</Text>
              <RadioButton.Group onValueChange={value => setNeedFinancing(value as 'yes' | 'no' | 'maybe')} value={needFinancing}>
                <View style={styles.financingOptionsRow}>
                  <View style={styles.financingOption}>
                    <RadioButton value="yes" />
                    <Text style={styles.financingOptionText}>Yes</Text>
                  </View>
                  <View style={styles.financingOption}>
                    <RadioButton value="no" />
                    <Text style={styles.financingOptionText}>No</Text>
                  </View>
                  <View style={styles.financingOption}>
                    <RadioButton value="maybe" />
                    <Text style={styles.financingOptionText}>Maybe</Text>
                  </View>
                </View>
              </RadioButton.Group>
            </View>
            </View>
            
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={calculateQuote}
              style={styles.bottomButton}
              labelStyle={{ color: '#fff' }}
              disabled={!billAmount || (solarType === 'digital' && (!selectedState || !selectedProvider || !selectedProject || selectedCapacity <= 0))}
            >
              Get Quote
            </Button>
          </View>
        </View>
    </ScrollView>
    </View>
  );
} 