import React, { useEffect, useState } from "react";
import { View, Pressable, StyleSheet, FlatList, KeyboardAvoidingView, Alert, ActivityIndicator, Linking, Image, Platform } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { ref, onValue } from "firebase/database";

import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker    from 'expo-image-picker';
import { Paperclip } from 'lucide-react-native';
import { uploadFile, getFileType, formatBytes } from '../../services/fileUploadService';

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

  const [uploadingFile, setUploadingFile] = useState(false);

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

    const handleAttach = () => {
    Alert.alert('Adjuntar', 'Elige el tipo', [
      {
        text: 'Documento',
        onPress: async () => {
          const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
          if (result.canceled) return;
          const file = result.assets[0];
          await sendFile(file.uri, file.name, file.size);
        },
      },
      {
        text: 'Imagen',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) return Alert.alert('Permiso denegado');
          const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
          if (result.canceled) return;
          const asset    = result.assets[0];
          const fileName = asset.uri.split('/').pop();
          await sendFile(asset.uri, fileName, asset.fileSize ?? 0);
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const sendFile = async (uri, name, size) => {
    setUploadingFile(true);
    try {
      const { url } = await uploadFile(uri, `chat/${groupId}`, name);
      const typeOfFile = getFileType(name);
      await chatService.sendMessage(groupId, {
        text: typeOfFile === 'IMG' ? '📷 Imagen' : `📁 Documento: ${name}`,
        file_url:  url,
        file_name: name,
        file_type: typeOfFile,
        file_size: formatBytes(size),
        sender_name: user.name,
      }, accessToken);
    } catch (e) {
      Alert.alert('Error', 'No se pudo enviar el archivo.');
      console.warn(e);
    } finally {
      setUploadingFile(false);
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
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        style={styles.listContainer}
        renderItem={({ item }) => {
          const isMine = item?.sender_id && user?.id &&
            String(item.sender_id) === String(user.id);

          return (
            <View style={[styles.messageWrapper, isMine ? styles.myWrapper : styles.otherWrapper]}>
              {!isMine && (
                <AppText variant="caption" style={styles.senderName}>
                  {item.sender_name}
                </AppText>
              )}
              <Pressable
                onPress={() => item.file_url && Linking.openURL(item.file_url)}
                style={[styles.messageBubble, isMine ? styles.myBubble : styles.otherBubble]}
              >
                {/* Imagen inline */}
                {item.file_url && item.file_type === 'IMG' && (
                  <Image
                    source={{ uri: item.file_url }}
                    style={styles.msgImage}
                    resizeMode="cover"
                  />
                )}
                {/* Archivo no-imagen */}
                {item.file_url && item.file_type !== 'IMG' && (
                  <View style={styles.fileRow}>
                    <Paperclip size={14} color={isMine ? '#fff' : colors.primary} />
                    <AppText
                      variant="caption"
                      style={[styles.fileName, isMine ? styles.myText : styles.otherText]}
                      numberOfLines={1}
                    >
                      {item.file_name}  ·  {item.file_size}
                    </AppText>
                  </View>
                )}
                {/* Texto normal */}
                {!!item.text && (
                  <AppText style={isMine ? styles.myText : styles.otherText}>
                    {item.text}
                  </AppText>
                )}
              </Pressable>
            </View>
          );
        }}
      />
      <View style={styles.footer}>
        <Pressable onPress={handleAttach} disabled={uploadingFile} style={styles.attachBtn}>
          {uploadingFile
            ? <ActivityIndicator size="small" color={colors.primary} />
            : <Paperclip size={20} color={colors.primary} />
          }
        </Pressable>
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
  attachBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fileName: {
    flex: 1,
    fontSize: 12,
  },
  msgImage: {
    width: 180,
    height: 130,
    borderRadius: 12,
    marginBottom: 4,
  },
});
