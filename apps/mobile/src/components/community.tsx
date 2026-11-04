import { Pressable, StyleSheet, Text, View } from "react-native";
import { demoDateLabel, demoMemberName, type DemoPost } from "@jubutech/shared";
import { Badge } from "@/components/ui";
import { SP, T, typo } from "@/theme";

/** PHP `postRow()` — `.community-feed`: 주제 배지 → 제목 → 본문 2줄 → 닉네임·날짜 / 공감·댓글 */
export function PostRow({ post, commentCount, onPress, note }: { post: DemoPost; commentCount: number; onPress: () => void; note?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" style={({ pressed }) => [s.feed, pressed && { opacity: 0.7 }]}>
      <Badge label={post.topic} />
      <Text style={typo("headline1", "semibold")}>{post.title}</Text>
      <Text style={typo("body2", "regular", T.label.alternative)} numberOfLines={2}>{post.body}</Text>
      <View style={s.meta}>
        <Text style={typo("caption1", "regular", T.label.alternative)}>{demoMemberName(post.memberId)} · {demoDateLabel(post.createdAt, "m.d")}</Text>
        <Text style={typo("caption1", "regular", T.label.alternative)}>공감 <Text style={typo("caption1", "bold", T.primary.normal)}>{post.likes.length}</Text> · 댓글 <Text style={typo("caption1", "bold", T.primary.normal)}>{commentCount}</Text></Text>
      </View>
      {note ? <Text style={typo("caption1", "semibold", T.status.cautionary)}>{note}</Text> : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  feed: { gap: SP[8], paddingVertical: SP[16], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.line.solidNormal },
  meta: { flexDirection: "row", justifyContent: "space-between", gap: SP[16] },
});
