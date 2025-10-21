// Validation utilities

export const isValidTime = (hour: string, minute: string): boolean => {
  const h = parseInt(hour);
  const m = parseInt(minute);
  
  return !isNaN(h) && !isNaN(m) && h >= 0 && h < 24 && m >= 0 && m < 60;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const isValidTemperature = (temp: number): boolean => {
  return temp >= 0 && temp <= 50;
};

export const isValidPH = (ph: number): boolean => {
  return ph >= 0 && ph <= 14;
};

export const isValidPercentage = (value: number): boolean => {
  return value >= 0 && value <= 100;
};

export const isValidSchedule = (
  hourOn: string,
  minuteOn: string,
  hourOff: string,
  minuteOff: string
): boolean => {
  if (!isValidTime(hourOn, minuteOn) || !isValidTime(hourOff, minuteOff)) {
    return false;
  }
  
  const timeOn = parseInt(hourOn) * 60 + parseInt(minuteOn);
  const timeOff = parseInt(hourOff) * 60 + parseInt(minuteOff);
  
  return timeOff > timeOn;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const isValidDeviceId = (id: string): boolean => {
  const deviceIdRegex = /^[a-zA-Z0-9_-]+$/;
  return deviceIdRegex.test(id);
};
