import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";

import { ref, onValue } from "firebase/database";

import { AppText, Button, Input, Screen } from "../../components/ui";

import { database } from "../../config/firebase";
import { chatService } from "../../services/chatService";
import { useAuth } from "../../hooks/useAuth";
import { colors, spacing } from "../../theme/tokens";

export function ChatScreen({ route }) {
  const { groupId } = route.params;

  const { user, accessToken } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const messagesRef = ref(database, `messages/${groupId}`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setMessages([]);
        return;
      }

      const data = Object.values(snapshot.val()).sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at),
      );

      setMessages(data);
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);

      await chatService.sendMessage(
        groupId,
        {
          text,
          sender_name: user.name,
        },
        accessToken,
      );

      setText("");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll={false}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isMine = item.sender_id === user.id;

          return (
            <View
              style={[
                styles.message,
                isMine ? styles.myMessage : styles.otherMessage,
              ]}
            >
              <AppText variant="caption">{item.sender_name}</AppText>

              <AppText>{item.text}</AppText>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <Input
          value={text}
          onChangeText={setText}
          placeholder="Escribe un mensaje"
          style={styles.input}
        />

        <Button title="Enviar" onPress={handleSend} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },

  message: {
    padding: spacing.md,
    borderRadius: 12,
    maxWidth: "80%",
  },

  myMessage: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end",
  },

  otherMessage: {
    backgroundColor: colors.surface,
    alignSelf: "flex-start",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },

  input: {
    flex: 1,
  },
});
