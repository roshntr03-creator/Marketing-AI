
export const triggerHapticFeedback = () => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    // A light vibration for a button press
    window.navigator.vibrate(50);
  }
};
