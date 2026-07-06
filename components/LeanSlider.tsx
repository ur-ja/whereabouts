import Slider from '@react-native-community/slider';
import { Feather } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';
import { usePlaces } from '../lib/places';
import { getLeanColor, getLeanLabel, getLeanSubtitle, getLeanTint } from '../lib/lean';

interface LeanSliderProps {
  value: number;
  onChange: (value: number) => void;
  editable?: boolean;
  isToday?: boolean;
}

export function LeanSlider({ value, onChange, editable = true, isToday = true }: LeanSliderProps) {
  const { places } = usePlaces();
  const leanColor = getLeanColor(value);
  const tint = getLeanTint(value);

  return (
    <View style={styles.content}>
      <View style={styles.labels}>
        <Text style={styles.flagLabel}>{places.placeA}</Text>
        <Text style={styles.flagLabel}>{places.placeB}</Text>
      </View>

      {editable ? (
        Platform.OS === 'web' ? (
          <View style={styles.webSliderWrap}>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={value}
              onChange={(event: { target: { value: string } }) =>
                onChange(Number(event.target.value))
              }
              style={{
                width: '100%',
                height: 40,
                accentColor: leanColor,
              }}
            />
          </View>
        ) : (
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={value}
            onValueChange={onChange}
            minimumTrackTintColor={leanColor}
            maximumTrackTintColor={colors.border}
            thumbTintColor={leanColor}
          />
        )
      ) : (
        <View style={styles.readOnlyTrack}>
          <View
            style={[
              styles.readOnlyFill,
              {
                width: `${((value - 1) / 9) * 100}%`,
                backgroundColor: leanColor,
              },
            ]}
          />
        </View>
      )}

      <View style={[styles.statusBox, { backgroundColor: tint }]}>
        <View style={[styles.statusIcon, { backgroundColor: colors.statusIconBg }]}>
          <Feather name="compass" size={16} color={leanColor} />
        </View>
        <View style={styles.statusText}>
          <Text style={[styles.statusTitle, { color: leanColor }]}>{getLeanLabel(value, places)}</Text>
          <Text style={styles.statusSubtitle}>{getLeanSubtitle(value, isToday, places)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flagLabel: {
    fontSize: typography.body,
    fontWeight: '500',
    color: colors.text,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  webSliderWrap: {
    width: '100%',
    paddingVertical: spacing.xs,
  },
  readOnlyTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  readOnlyFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    flex: 1,
    gap: 2,
  },
  statusTitle: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  statusSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
