# Postly - 反思分享社群平台

Postly 是一個專注於個人成長和反思分享的社群平台，讓用戶可以記錄並分享他們的日常反思和見解。

## 功能特點

### 1. 每日反思提示
- 獲取每日精選的反思主題
- 引導用戶進行深度思考
- 可自由關閉或切換提示

### 2. 反思分享
- 用戶可以分享個人反思
- 支持互動功能（點讚、評論）
- 簡潔的卡片式設計

### 3. 個人成就
- 連續打卡記錄
- 個人特質標籤
- 互動數據統計

### 4. 社群互動
- 查看社群成員的分享
- 支持內容分享功能
- 每日精選內容推薦

## 技術架構

### 前端技術
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Heroicons

### 主要依賴
```json
{
  "dependencies": {
    "@heroicons/react": "^2.0.0",
    "@headlessui/react": "^1.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

## 目錄結構

```
postly/
├── src/
│   ├── app/
│   │   └── page.tsx          # 主頁面
│   ├── components/
│   │   ├── Header.tsx        # 頁面頂部組件
│   │   ├── ReflectionCard.tsx    # 反思卡片組件
│   │   └── ReflectionPrompt.tsx  # 反思提示組件
│   └── utils/
│       └── cn.ts             # 工具函數
├── public/
├── tailwind.config.ts        # Tailwind 配置
├── package.json
└── README.md
```

## 安裝說明

1. 克隆專案
```bash
git clone [repository-url]
cd postly
```

2. 安裝依賴
```bash
npm install
```

3. 啟動開發服務器
```bash
npm run dev
```

4. 打開瀏覽器訪問
```
http://localhost:3000
```

## 組件說明

### Header 組件
- 固定在頁面頂部
- 顯示用戶資訊和成就
- 包含個人特質標籤

### ReflectionPrompt 組件
- 顯示每日反思提示
- 可關閉的卡片設計
- 引導用戶開始反思

### ReflectionCard 組件
- 展示用戶的反思內容
- 支持社交互動功能
- 簡潔的卡片式設計

## 設計理念

### 視覺設計
- 採用深色主題
- 簡約現代的界面風格
- 注重內容的可讀性
- 適當的留白和間距

### 交互設計
- 簡單直觀的操作方式
- 即時的視覺反饋
- 流暢的狀態轉換

## 開發指南

### 新增功能
1. 在 `src/components` 創建新組件
2. 使用 TypeScript 定義類型
3. 遵循現有的設計風格
4. 添加必要的註釋

### 樣式指南
- 使用 Tailwind CSS 類名
- 保持一致的命名規範
- 遵循響應式設計原則

## 待開發功能
- [ ] 用戶認證系統
- [ ] 個人資料頁面
- [ ] 反思歷史記錄
- [ ] 社群互動增強
- [ ] 通知系統

## 貢獻指南
1. Fork 專案
2. 創建功能分支
3. 提交更改
4. 發起 Pull Request

## 授權
[授權說明]
