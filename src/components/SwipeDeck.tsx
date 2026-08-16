import { ReactNode } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius } from '@/src/theme';

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
    entering.value = 0.97;
    entering.value = withTiming(1, { duration: 160 });
  };

  const pan = Gesture.Pan()
    .enabled(enabled)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.1;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          SCREEN_WIDTH * 1.25,
          { duration: 200 },
          () => {
            runOnJS(finish)(true);
          }
        );
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          -SCREEN_WIDTH * 1.25,
          { duration: 200 },
          () => {
            runOnJS(finish)(false);
          }
        );
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
        translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = `${interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-10, 0, 10],
      Extrapolation.CLAMP
    )}deg`;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate },
        { scale: entering.value },
      ],
      opacity: 0.92 + entering.value * 0.08,
    };
  });

  const correctOverlay = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const wrongOverlay = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, -SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
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
    borderRadius: radius.card,
  },
  correct: {
    backgroundColor: colors.correctSoft,
    borderWidth: 1.5,
    borderColor: colors.correct,
  },
  wrong: {
    backgroundColor: colors.wrongSoft,
    borderWidth: 1.5,
    borderColor: colors.wrong,
  },
});
