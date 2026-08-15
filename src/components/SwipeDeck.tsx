import { ReactNode } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/src/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

type Props = {
  children: ReactNode;
  enabled: boolean;
  onGrade: (correct: boolean) => void;
};

export function SwipeDeck({ children, enabled, onGrade }: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const entering = useSharedValue(1);

  const finish = (correct: boolean) => {
    onGrade(correct);
    translateX.value = 0;
    translateY.value = 0;
    entering.value = 0;
    entering.value = withTiming(1, { duration: 280 });
  };

  const pan = Gesture.Pan()
    .enabled(enabled)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.15;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.2, { duration: 220 }, () => {
          runOnJS(finish)(true);
        });
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.2, { duration: 220 }, () => {
          runOnJS(finish)(false);
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = `${translateX.value / 18}deg`;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate },
        { scale: 0.96 + entering.value * 0.04 },
      ],
      opacity: 0.85 + entering.value * 0.15,
    };
  });

  const correctOverlay = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, translateX.value / SWIPE_THRESHOLD)),
  }));

  const wrongOverlay = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, -translateX.value / SWIPE_THRESHOLD)),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.deck, cardStyle]}>
        {children}
        <Animated.View
          pointerEvents="none"
          style={[styles.overlay, styles.correct, correctOverlay]}
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.overlay, styles.wrong, wrongOverlay]}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  deck: {
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 28,
  },
  correct: {
    backgroundColor: 'rgba(47, 107, 79, 0.22)',
    borderWidth: 3,
    borderColor: colors.correct,
  },
  wrong: {
    backgroundColor: 'rgba(163, 59, 59, 0.22)',
    borderWidth: 3,
    borderColor: colors.wrong,
  },
});
