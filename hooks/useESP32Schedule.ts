import { useFirebaseConfig } from '@/contexts/FirebaseConfigContext';
import { off, onValue, ref, set } from 'firebase/database';
import { useCallback, useEffect, useState } from 'react';

interface Schedule {
  hour_on: string;
  minute_on: string;
  hour_off: string;
  minute_off: string;
  enabled: boolean;
}

interface ScheduleData {
  [deviceKey: string]: Schedule;
}

export function useESP32Schedule() {
  const { currentDatabase } = useFirebaseConfig();
  const [schedules, setSchedules] = useState<ScheduleData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentDatabase) return;

    const schedulesRef = ref(currentDatabase, 'schedules');
    
    const unsubscribe = onValue(
      schedulesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setSchedules(snapshot.val());
          setError(null);
        } else {
          setSchedules({});
        }
      },
      (error) => {
        setError(error.message);
      }
    );

    return () => {
      off(schedulesRef);
    };
  }, [currentDatabase]);

  const updateDeviceSchedule = useCallback(async (
    deviceKey: string, 
    schedule: Schedule
  ): Promise<boolean> => {
    if (!currentDatabase) {
      setError('Database not initialized');
      return false;
    }

    try {
      setLoading(true);
      const scheduleRef = ref(currentDatabase, `schedules/${deviceKey}`);
      await set(scheduleRef, schedule);
      setError(null);
      setLoading(false);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  }, [currentDatabase]);

  const getDeviceSchedule = useCallback((deviceKey: string): Schedule | null => {
    return schedules[deviceKey] || null;
  }, [schedules]);

  const formatScheduleTime = useCallback((hour: string, minute: string): string => {
    const h = hour.padStart(2, '0');
    const m = minute.padStart(2, '0');
    return `${h}:${m}`;
  }, []);

  const enableSchedule = useCallback(async (
    deviceKey: string, 
    enabled: boolean
  ): Promise<boolean> => {
    const currentSchedule = getDeviceSchedule(deviceKey);
    
    if (!currentSchedule) {
      setError('Schedule not found');
      return false;
    }

    return await updateDeviceSchedule(deviceKey, {
      ...currentSchedule,
      enabled,
    });
  }, [getDeviceSchedule, updateDeviceSchedule]);

  const deleteSchedule = useCallback(async (deviceKey: string): Promise<boolean> => {
    if (!currentDatabase) {
      setError('Database not initialized');
      return false;
    }

    try {
      setLoading(true);
      const scheduleRef = ref(currentDatabase, `schedules/${deviceKey}`);
      await set(scheduleRef, null);
      setError(null);
      setLoading(false);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  }, [currentDatabase]);

  const createSchedule = useCallback(async (
    deviceKey: string,
    hourOn: string,
    minuteOn: string,
    hourOff: string,
    minuteOff: string,
    enabled: boolean = true
  ): Promise<boolean> => {
    const schedule: Schedule = {
      hour_on: hourOn,
      minute_on: minuteOn,
      hour_off: hourOff,
      minute_off: minuteOff,
      enabled,
    };

    return await updateDeviceSchedule(deviceKey, schedule);
  }, [updateDeviceSchedule]);

  return {
    schedules,
    loading,
    error,
    updateDeviceSchedule,
    getDeviceSchedule,
    formatScheduleTime,
    enableSchedule,
    deleteSchedule,
    createSchedule,
  };
}
