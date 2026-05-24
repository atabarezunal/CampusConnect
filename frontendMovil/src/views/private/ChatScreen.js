import React, { useEffect, useState } from "react";
import { View, Pressable, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { ref, onValue } from "firebase/database";

import { AppText, Button, Input, Screen } from "../../components/ui";

import { database } from "../../config/firebase";
import { chatService } from "../../services/chatService";
import { useAuth } from "../../hooks/useAuth";
import { colors, spacing } from "../../theme/tokens";

export function ChatScreen({ route, navigation }) {
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* ── Header con botón volver ── */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>
          <AppText variant="section">Chat del grupo</AppText>
          <View style={styles.backBtn} /> 
        {/* spacer para centrar el título */}
        </View>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          style={styles.listContainer}
          renderItem={({ item }) => {
            // SOLUCIÓN AL PROBLEMA: Compara usando String() y valida que existan ambas propiedades
            const isMine = 
              item?.sender_id && 
              user?.id && 
              String(item.sender_id) === String(user.id);

            return (
              <View style={[styles.messageWrapper, isMine ? styles.myWrapper : styles.otherWrapper]}>
                {/* Nombre del remitente: Solo se muestra si el mensaje NO es tuyo */}
                {!isMine && (
                  <AppText variant="caption" style={styles.senderName}>
                    {item.sender_name}
                  </AppText>
                )}
                
                {/* Globo del mensaje */}
                <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.otherBubble]}>
                  <AppText style={isMine ? styles.myText : styles.otherText}>
                    {item.text}
                  </AppText>
                </View>
              </View>
            );
          }}
        />

        <View style={styles.footer}>
          <View style={styles.inputContainer}>
            <Input
              value={text}
              onChangeText={setText}
              placeholder="Escribe un mensaje"
              style={styles.input}
            />
          </View>

          <Button title="Enviar" onPress={handleSend} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  messageWrapper: {
    maxWidth: "75%",
    marginBottom: 4,
  },
  myWrapper: {
    alignSelf: "flex-end", // Tus mensajes a la derecha
  },
  otherWrapper: {
    alignSelf: "flex-start", // Los otros a la izquierda
  },
  senderName: {
    color: colors.textMuted || "#8E8E93",
    fontSize: 12,
    marginBottom: 2,
    marginLeft: 4,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: "#007AFF", // Azul iMessage
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: colors.surface || "#E5E5EA", // Gris claro
    borderBottomLeftRadius: 4,
  },
  myText: {
    color: "#FFFFFF", // Letras blancas
  },
  otherText: {
    color: "#000000", // Letras negras
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
  },
  inputContainer: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  input: {
    width: "100%",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
