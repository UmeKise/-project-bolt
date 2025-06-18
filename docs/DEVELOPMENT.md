# プロジェクトBolt 開発ガイド

## 目次

1. [開発環境のセットアップ](#開発環境のセットアップ)
2. [プロジェクト構造](#プロジェクト構造)
3. [コーディング規約](#コーディング規約)
4. [テスト](#テスト)
5. [デプロイメント](#デプロイメント)
6. [トラブルシューティング](#トラブルシューティング)

## 開発環境のセットアップ

### 必要条件

- Node.js 16.x以上
- npm 7.x以上
- React Native CLI
- Expo CLI
- Android Studio / Xcode

### インストール手順

1. リポジトリのクローン
```bash
git clone https://github.com/your-username/project-bolt.git
cd project-bolt
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
```bash
cp .env.example .env
# .envファイルを編集して必要な環境変数を設定
```

4. 開発サーバーの起動
```bash
npm start
```

## プロジェクト構造

```
project-bolt/
├── components/          # Reactコンポーネント
├── contexts/           # Reactコンテキスト
├── services/           # ビジネスロジック
├── utils/             # ユーティリティ関数
├── types/             # TypeScript型定義
├── assets/            # 静的ファイル
├── docs/              # ドキュメント
└── tests/             # テストファイル
```

## コーディング規約

### 命名規則

- コンポーネント: PascalCase
- 関数・変数: camelCase
- 定数: UPPER_SNAKE_CASE
- ファイル名: コンポーネントはPascalCase、その他はcamelCase

### コンポーネント

```typescript
import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
}

export const MyComponent: React.FC<Props> = ({ title, onPress }) => {
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};
```

### スタイリング

- StyleSheetを使用
- テーマシステムを活用
- レスポンシブデザインを考慮

## テスト

### ユニットテスト

```bash
npm test
```

### E2Eテスト

```bash
npm run e2e
```

### テストカバレッジ

```bash
npm run test:coverage
```

## デプロイメント

### ビルド

```bash
# Android
npm run build:android

# iOS
npm run build:ios
```

### リリース

1. バージョン番号の更新
2. 変更履歴の更新
3. タグの作成
4. リリースノートの作成

## トラブルシューティング

### 一般的な問題

1. 依存関係の競合
```bash
npm clean-install
```

2. キャッシュの問題
```bash
npm start -- --reset-cache
```

3. ビルドエラー
```bash
npm run clean
npm install
```

### デバッグ

- React Native Debuggerの使用
- コンソールログの確認
- パフォーマンスモニタリング

## 貢献

1. ブランチの作成
2. 変更の実装
3. テストの追加
4. プルリクエストの作成

## ライセンス

MIT License 