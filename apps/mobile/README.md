# 주부테크 모바일 앱 (Expo · React Native)

- 실행: 저장소 루트에서 `npm run mobile` (Expo Dev Server) → Expo Go 앱으로 QR 스캔, 또는 `npm run android` / `npm run ios`
- 웹 미리보기: `npx expo start --web` (react-native-web)
- 구조: `src/app` expo-router 라우트 (`(tabs)` 하단 5탭), `src/components` UI, `src/theme.ts` 토큰(`@jubutech/shared/tokens`에서 옴)
- 공용 코드: `@jubutech/shared` (타입·목 데이터·유틸·토큰). 값은 `design/tokens.json` → `npm run tokens`
- 아이콘·스플래시: `npm run logo` 가 `assets/images/` 생성
- 디자인: Figma 「주부테크 앱 UI」 https://www.figma.com/design/qFDiIqCREL6o8cPtZKjXP9
