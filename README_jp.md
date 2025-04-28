このプロジェクトの README は日本語と韓国語で提供いたします。
<br>
이 프로젝트의 README는 한국어와 일본어로 제공됩니다.

- [日本語 (Japanese)](README_jp.md)
- [한국어 (Korean)](README.md)



# 学科ポータルWebサービス

> Vue 3 + Express + MySQLベースの**大学学科運営システム**  
> Google Calendar連携、LINE通知、Drag & Dropなど最新Web機能を活用した**実務型統合プラットフォーム**

---

## 🗂️ 概要 (Overview)

GSC学科ポータルは、**学生、教授、管理者**の役割に応じて学事予定を統合管理できるプラットフォームです。  
**Vue 3**、**Express.js**、**MySQL**をベースに構成され、  
**Google OAuth**、**JWT認証**、**LINE通知システム**、**Google Calendar API**、  
**Drag & Drop UI**などの機能を活用し、**拡張性**と**実務適用性**を考慮して設計されています。

---

## 技術スタック (Tech Stack)

| 区分        | 技術                                                           |
|-------------|----------------------------------------------------------------|
| **Frontend** | Vue 3 + Vite, Pinia, Vue Router, Axios                        |
| **Backend**  | Express.js, MySQL, JWT認証, dotenv                             |
| **外部連携** | Google Calendar API, LINE Messaging API, 政府24祝日API        |
| **認証方式** | Google OAuth2.0 + JWTトークン + Refresh Tokenクッキー管理    |
| **デプロイ環境** | 未定                                                          |

---

## 主な機能 (Main Features)

### 🔐 ログイン & 認証
- Google OAuthログイン  
- Refresh Tokenによる自動ログイン復元  
- 管理者 / 教授 / 学生機能分離  
- **登録済みの学校メール(@g.yju.ac.kr)または事前に承認されたGmailのみログイン可能**  
- **管理者の承認後システムアクセス可能**

### 📅 時間割管理
- 学年別の正規時間割登録/修正  
- 補講、休講の視覚的区別  
- 学生別クラス分け・特講フィルタリング  
- 週間単位のフィルタリング + 祝日自動反映  
- 教授別フィルタリング  
- 授業重複時に`+n`表示および詳細モーダル提供  

### 🎯 レベル授業分班システム
- 留学生専用フィルタリング（grade 4対象）  
- グループベースの科目-学生接続（group_id基準）  
- Drag & Drop UIで割り当て  
- 既存グループ修正機能サポート

### 📢 お知らせ管理
- お知らせ作成 / 修正 / 削除  
- 一般お知らせ、重要お知らせ（上位固定）、学科お知らせ（Google Calendar反映）  
- LINEメッセージ送信オプション  
- 学年別、科目別、キーワードによるフィルタリング  
- 内容コピー機能

### 📆 学事予定統合スケジュール
- Google Calendar API連携  
- **出力対象項目**
  - 補講予定  
  - 休講予定  
  - 祝日情報：Google祝日API基づき自動反映  
  - 学科予定：お知らせ作成時に登録した日付に基づくイベント表示  
- スケジュール種類別に色分け表示  

---

## ⚙️ プロジェクト構造 (Project Structure)
vue-project/
├── backend/              # Expressサーバー
│   ├── controllers/      # 機能別ロジック
│   ├── routes/           # APIエンドポイント
│   ├── models/           # データベースクエリモジュール（直接SQL使用、ORM未使用）
│   ├── middleware/       # 認証処理
│   └── utils/            # LINE、GoogleCalendar、政府祝日APIユーティリティ
│ 
├── src/                  # Vueフロントエンド
│   ├── App.vue           # ルートコンポーネント（ルーティング分岐、レイアウト定義）
│   ├── main.js           # アプリケーションエントリーポイント（ルーター/Pinia初期化）
│   ├── pages/            # 実際にルーティングされるページ
│   ├── components/       # UIコンポーネント
│   ├── stores/           # Pinia状態管理
│   ├── router/           # Vue Router設定
│   └── services/         # APIリクエストユーティリティ

---
