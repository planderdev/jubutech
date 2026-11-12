import { Alert, Platform } from "react-native";

/**
 * 확인·안내 대화상자 — RN `Alert` 는 웹 빌드에서 아무것도 하지 않으므로 웹은 브라우저 대화상자로 대신한다.
 */
export function confirmDialog(title: string, message: string, onConfirm: () => void, opts: { confirmLabel?: string; cancelLabel?: string; destructive?: boolean } = {}): void {
  if (Platform.OS === "web") {
    if (globalThis.confirm?.(`${title}\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: opts.cancelLabel ?? "취소", style: "cancel" },
    { text: opts.confirmLabel ?? "확인", style: opts.destructive ? "destructive" : "default", onPress: onConfirm },
  ]);
}

export function noticeDialog(title: string, message: string): void {
  if (Platform.OS === "web") {
    globalThis.alert?.(`${title}\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
