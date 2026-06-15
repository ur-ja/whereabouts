import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PREDEFINED_TAGS } from '../constants/tags';
import { colors, radius, spacing } from '../constants/theme';
import { getLeanColor } from '../lib/lean';
import { EmptyField } from './EmptyField';

interface TagGridProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  lean: number;
  editable?: boolean;
}

export function TagGrid({ selectedTags, onChange, lean, editable = true }: TagGridProps) {
  const [customTags, setCustomTags] = useState<string[]>(
    selectedTags.filter((t) => !PREDEFINED_TAGS.includes(t as (typeof PREDEFINED_TAGS)[number])),
  );
  const leanColor = getLeanColor(lean);

  const allTags = [...PREDEFINED_TAGS, ...customTags];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    Alert.prompt(
      'Add a factor',
      'What else is influencing your lean?',
      (text) => {
        const trimmed = text?.trim();
        if (!trimmed || allTags.includes(trimmed)) return;
        setCustomTags((prev) => [...prev, trimmed]);
        onChange([...selectedTags, trimmed]);
      },
    );
  };

  const getTagStyle = (selected: boolean) => {
    if (!selected) {
      return { backgroundColor: colors.background, borderColor: colors.border };
    }
    if (lean < 5) {
      return { backgroundColor: colors.indiaTint, borderColor: colors.india };
    }
    if (lean > 5) {
      return { backgroundColor: colors.australiaTint, borderColor: colors.australia };
    }
    return { backgroundColor: colors.neutralTint, borderColor: colors.neutral };
  };

  if (!editable) {
    if (selectedTags.length === 0) {
      return <EmptyField text="No factors noted" />;
    }

    return (
      <View style={styles.grid}>
        {selectedTags.map((tag) => {
          const tagStyle = getTagStyle(true);
          return (
            <View key={tag} style={[styles.pill, tagStyle]}>
              <Text style={[styles.pillText, { color: leanColor }]}>{tag}</Text>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {allTags.map((tag) => {
        const selected = selectedTags.includes(tag);
        const tagStyle = getTagStyle(selected);
        return (
          <Pressable
            key={tag}
            onPress={() => toggleTag(tag)}
            style={[styles.pill, tagStyle]}
          >
            <Text style={[styles.pillText, selected && { color: leanColor }]}>
              {tag}
            </Text>
          </Pressable>
        );
      })}
      <Pressable onPress={addCustomTag} style={[styles.pill, styles.addPill]}>
        <Text style={styles.addText}>+ add</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 14,
    color: colors.text,
  },
  addPill: {
    backgroundColor: 'transparent',
    borderColor: colors.accent,
    borderStyle: 'dashed',
  },
  addText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
});
