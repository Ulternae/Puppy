import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View, useWindowDimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Portal } from 'react-native-paper';
import { colors } from '../theme';

const confettiColors = [colors.accent, colors.rating, colors.ink, colors.primary];

export function ConfettiBurst({ id, onComplete }: { id: number; onComplete: (id: number) => void }) {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    let mounted = true;
    const motionChanged = (reduced: boolean) => {
      if (!mounted) return;
      setAllowed(!reduced);
      if (reduced) onComplete(id);
    };
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', motionChanged);
    void AccessibilityInfo.isReduceMotionEnabled().then(motionChanged).catch(() => { if (mounted) onComplete(id); });
    return () => { mounted = false; listener.remove(); };
  }, [id, onComplete]);
  if (!allowed) return null;
  return <Portal><FullScreenConfetti id={id} onComplete={onComplete} /></Portal>;
}

function FullScreenConfetti({ id, onComplete }: { id: number; onComplete: (id: number) => void }) {
  const { width, height } = useWindowDimensions();
  const cannon = useRef<ConfettiCannon>(null);
  useEffect(() => {
    const animation = cannon.current;
    return () => animation?.stop();
  }, []);
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
    <ConfettiCannon ref={cannon} autoStart autoStartDelay={50} count={70} origin={{ x: width / 2, y: height * 0.15 }}
      colors={confettiColors}
      explosionSpeed={300} fallSpeed={1700} fadeOut onAnimationEnd={() => onComplete(id)} />
  </View>;
}
