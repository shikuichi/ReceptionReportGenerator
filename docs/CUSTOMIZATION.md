# カスタマイズガイド (Customization Guide)

「受信報告書ジェネレーター」のソースコード（JavaScript）を編集し、保存項目の変更やサンプルデータの追加などを行うためのリファレンスです。

---

## 1. 「リスナー情報のみ保存・読込」の対象項目を変更する

`app.js` 内の定数 `SENDER_FIELDS` に定義されている配列を編集することで、JSONファイルとして個別に保存・読み込みする項目を自由に変更できます。

### 編集箇所

```javascript
const SENDER_FIELDS = [
  'sender_name',
  'sender_zip',
  'sender_address',
  'sender_email',
  'receiver_model',
  'antenna_model'
];
```

* 配列内に記載されたIDの項目のみが「リスナー情報のみ保存」で書き出され、「リスナー情報のみ読込」で上書き復元されます。
* 項目を追加したい場合は、後述の「[全フィールドID一覧](#2-全フィールドid一覧form_fields)」から対象のIDを選び、シングルクォーテーション（`' '`）とカンマ区切りで追記してください。

> **例：受信場所（`reception_place`）もあわせて保存したい場合**
> ```javascript
> const SENDER_FIELDS = [
>   'sender_name', 'sender_zip', 'sender_address', 'sender_email',
>   'reception_place', 'receiver_model', 'antenna_model'
> ];
> ```

---

## 2. 全フィールドID一覧（`FORM_FIELDS`）

フォーム全体（全データ保存・自動保存）で管理されているすべてのフィールドIDと入力種別の一覧です。

### 基本設定・宛名
| フィールドID | 項目名 | 入力種別 / 値の例 | 備考 |
| :--- | :--- | :--- | :--- |
| `report_lang` | 表記言語 | Radio (`'ja'` / `'en'`) | 日本語 / 英語の切り替え |
| `target_station` | 宛先（放送局・会社名） | Text | 未入力時は `station_name` を代用 |
| `target_department` | 宛先部署名 | Text | 例：`技術部 QSL係` |
| `target_honorific` | 敬称 | Text / Select | 例：`御中`、`様`（英語表記時は非表示） |

### 放送局・周波数情報
| フィールドID | 項目名 | 入力種別 / 値の例 | 備考 |
| :--- | :--- | :--- | :--- |
| `station_name` | 放送局名 | Text | 印刷必須項目 |
| `call_sign` | コールサイン | Text | プレビュー時は自動で半角大文字化 |
| `freq_unit` | 周波数単位 / 種別 | Radio (`'kHz'` / `'MHz'` / `'ch'`) | `'ch'` 選択時はTV評価モードへ切替 |
| `frequency_val` | 受信周波数 | Text | `freq_unit` が `'ch'` 以外の時の印刷必須項目 |
| `channel_val` | 受信チャンネル | Text | `freq_unit` が `'ch'` の時の印刷必須項目 |
| `program_title` | 番組名 | Text | 任意項目（空欄時はプレビュー行を非表示） |
| `language` | 放送言語 | Text | `program_title` 入力時に併記 |

### 受信日時・場所
| フィールドID | 項目名 | 入力種別 / 値の例 | 備考 |
| :--- | :--- | :--- | :--- |
| `reception_date` | 受信日 | Date (`'YYYY-MM-DD'`) | 印刷必須項目 |
| `time_start` | 受信開始時刻 | Time (`'HH:MM'`) | 印刷必須項目 |
| `time_end` | 受信終了時刻 | Time (`'HH:MM'`) | 印刷必須項目 |
| `time_zone_type` | タイムゾーン | Select (`'JST'` / `'UTC'`) | デフォルトは `'JST'` |
| `reception_place` | 受信場所 | Text | 印刷必須項目 |

### 受信状態の評価（ラジオ：SINPO / テレビ：P・Q）
| フィールドID | 項目名 | 入力種別 / 値の例 | 備考 |
| :--- | :--- | :--- | :--- |
| `sinpo_s` | SINPO - S (信号強度) | Select (`'1'`〜`'5'`) | 5項目すべて選択時にプレビュー反映 |
| `sinpo_i` | SINPO - I (混信) | Select (`'1'`〜`'5'`) | 同上 |
| `sinpo_n` | SINPO - N (雑音) | Select (`'1'`〜`'5'`) | 同上 |
| `sinpo_p` | SINPO - P (伝搬障害) | Select (`'1'`〜`'5'`) | 同上 |
| `sinpo_o` | SINPO - O (総合評価) | Select (`'1'`〜`'5'`) | 同上 |
| `tv_picture` | テレビ画質評価 | Select (`'P5 ...'`〜`'P1 ...'`) | `freq_unit === 'ch'` の時に使用 |
| `tv_sound` | テレビ音質評価 | Select (`'Q5 ...'`〜`'Q1 ...'`) | `freq_unit === 'ch'` の時に使用 |

### 受信設備・放送内容・感想
| フィールドID | 項目名 | 入力種別 / 値の例 | 備考 |
| :--- | :--- | :--- | :--- |
| `receiver_model` | 受信機 / チューナー | Text | 印刷必須項目 |
| `antenna_model` | アンテナ（空中線） | Text | 任意項目 |
| `program_log` | 放送内容の記録 | Textarea | 印刷必須項目 |
| `comments` | 番組への感想 | Textarea | 任意項目（空欄時はプレビューブロック非表示） |

### ベリカード請求・リスナー情報
| フィールドID | 項目名 | 入力種別 / 値の例 | 備考 |
| :--- | :--- | :--- | :--- |
| `qsl_request` | ベリカード請求文 | Textarea | 空欄時は言語に応じた定型文を自動挿入 |
| `include_return_postage` | 返信用封筒（SASE）同封 | Checkbox (`true` / `false`) | チェック時に注記文を表示 |
| `sender_name` | 氏名（ハンドルネーム） | Text | |
| `sender_zip` | 郵便番号 | Text | |
| `sender_address` | 住所 | Text | |
| `sender_email` | メールアドレス（連絡先） | Text | |

---

## 3. その他のカスタマイズポイント

### A. ブラウザ自動保存のストレージキー変更
同じドメイン上で別バージョンのツールを複数運用する場合、データの競合を防ぐために `STORAGE_KEY` を変更してください。

```javascript
// 変更前
const STORAGE_KEY = 'Reception_Report_Generator_Input_Data';

// 変更例
const STORAGE_KEY = 'my_custom_reception_report_v2';
```

### B. サンプルデータ生成の機種リスト追加
`loadSampleData()` 関数内の配列に機種名を追加すると、ランダム生成される受信機のバリエーションを増やせます。

* `receiversCommunityFm` : コミュニティFM帯域用
* `receiversPrefWideFm` : 県域FM・ワイドFM帯域用
* `receiversMwAm` : 中波（AM）帯域用
* `receiversTv` : 地上デジタルテレビ用

### C. A4用紙「2枚以上（長文スタイル）」の判定しきい値調整
`updatePreview()` 関数内の以下の数値を調整することで、長文レイアウト（`multipage-mode` クラス付与）に切り替わるタイミングを変更できます。

```javascript
// デフォルト：改行数が12行を超える、または合計文字数が500文字を超える場合
if (lineCount > 12 || totalChars > 500) {
  sheetEl.classList.add('multipage-mode');
  ...
```

### D. 印刷時の必須入力チェックの変更
`btn-print` のクリックイベント内にあるバリデーション条件をコメントアウトまたは追記することで、印刷・PDF出力前の必須項目を変更できます。

```javascript
if (!data.station_name || !data.station_name.trim()) errors.push('・放送局名');
// 例：コールサインも印刷必須にしたい場合は以下を追加
if (!data.call_sign || !data.call_sign.trim()) errors.push('・コールサイン');
```
