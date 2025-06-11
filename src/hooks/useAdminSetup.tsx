<<<<<<< HEAD

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdminSetup = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setupInitialAdmin();
    }
  }, [user]);

  const setupInitialAdmin = async () => {
    if (!user) return;

    try {
      // Check if this is the first user and make them admin
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (count === 1) {
        // This is the first user, make them admin
        await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'admin'
          });
        
        console.log('First user made admin');
      }
    } catch (error) {
      console.error('Error setting up admin:', error);
    }
  };
};
=======

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdminSetup = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setupInitialAdmin();
    }
  }, [user]);

  const setupInitialAdmin = async () => {
    if (!user) return;

    try {
      // Check if this is the first user and make them admin
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (count === 1) {
        // This is the first user, make them admin
        await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'admin'
          });
        
        console.log('First user made admin');
      }
    } catch (error) {
      console.error('Error setting up admin:', error);
    }
  };
};
>>>>>>> 6e9f060a764a1ae412505473b6698e4b7d1116e8
