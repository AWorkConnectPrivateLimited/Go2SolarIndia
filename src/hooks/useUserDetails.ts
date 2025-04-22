import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { User, UserRole } from '@/types';
import { customerProfilesService } from '@/services/supabase/customer-profiles';
import { agentProfilesService } from '@/services/supabase/agent-profiles';
import { useState, useEffect } from 'react';

interface UserDetails {
  basicInfo: User;
  profile: any; // Type this based on your profile interfaces
  projects?: any[];
  serviceRequests?: any[];
}

export const useUserDetails = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        let details: UserDetails = {
          basicInfo: user,
          profile: null
        };

        switch (user.role) {
          case UserRole.CUSTOMER:
            const customerProfile = await customerProfilesService.getCustomerProfileWithDetails(user.id);
            details.profile = customerProfile;
            details.projects = customerProfile.projects;
            details.serviceRequests = customerProfile.serviceRequests;
            break;
          
          case UserRole.AGENT:
            const agentProfile = await agentProfilesService.getAgentProfileWithDetails(user.id);
            details.profile = agentProfile;
            details.projects = agentProfile.managedProjects;
            details.serviceRequests = agentProfile.assignedRequests;
            break;

          // Add other roles as needed
        }

        setUserDetails(details);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user]);

  return { userDetails, loading, error };
}; 