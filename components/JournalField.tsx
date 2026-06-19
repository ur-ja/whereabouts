import { StyleSheet, Text, TextInput, View } from 'react-native';
import { KEYBOARD_DONE_ID } from './KeyboardDoneBar';
import { colors, NOTE_MAX_LENGTH, radius, spacing, typography } from '../constants/theme';
import { EmptyField } from './EmptyField';

interface JournalFieldProps {
  note: string;
  onChange: (note: string) => void;
  editable: boolean;
  isToday: boolean;
  onFocus?: () => void;
}

export function JournalField({ note, onChange, editable, isToday, onFocus }: JournalFieldProps) {
  const prompt = isToday ? "What's on your mind today?" : 'What were you thinking that day?';

  if (!editable) {
    if (!note.trim()) {
      return <EmptyField text={isToday ? 'Nothing written yet' : 'Nothing written for this day'} />;
    }
    return <Text style={styles.readOnly}>{note}</Text>;
  }

  return (
    <View style={styles.content}>
      <Text style={styles.prompt}>{prompt}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Write your thoughts…"
          placeholderTextColor={colors.textMuted}
          value={note}
          onChangeText={(text) => onChange(text.slice(0, NOTE_MAX_LENGTH))}
          onFocus={onFocus}
          inputAccessoryViewID={KEYBOARD_DONE_ID}
          textAlignVertical="top"
        />
        <Text style={styles.counter}>
          {note.length}/{NOTE_MAX_LENGTH}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
  prompt: {
    fontSize: 14,
    color: colors.textMuted,
  },
  inputWrap: {
    backgroundColor: colors.background,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 140,
  },
  input: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
    minHeight: 100,
    padding: 0,
  },
  counter: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
  readOnly: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
  },
});
