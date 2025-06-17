# Postly - Reflection Sharing Community Platform
# Postly - 反思分享社群平台

Postly is a community platform focused on personal growth and reflection sharing, allowing users to record and share their daily reflections and insights.

Postly 是一個專注於個人成長和反思分享的社群平台，讓使用者能夠記錄並分享他們的日常反思和見解。

## Features 功能特點

### 1. Daily Reflection Prompts 每日反思提示
- Get daily curated reflection topics
- Guide users through deep thinking
- Optional prompts that can be toggled
- 獲取每日精選的反思主題
- 引導使用者進行深度思考
- 可選擇性開啟/關閉提示

### 2. Reflection Sharing 反思分享
- Users can share personal reflections
- Interactive features (likes, comments)
- Clean card-based design
- 使用者可以分享個人反思
- 互動功能（按讚、評論）
- 清晰的卡片式設計

### 3. Personal Achievements 個人成就
- Streak tracking for continuous reflection
- Personal trait tags and growth metrics
- Interaction statistics and engagement analytics
- 連續反思的紀錄追蹤
- 個人特質標籤和成長指標
- 互動統計和參與度分析

### 4. Community Interaction 社群互動
- View community members' shares
- Content sharing functionality
- Daily featured content recommendations
- Real-time engagement notifications
- 瀏覽社群成員的分享
- 內容分享功能
- 每日精選內容推薦
- 即時互動通知

## Technical Stack 技術架構

### Frontend Technologies 前端技術
- Next.js 15.3.3 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- NextAuth.js for authentication
- TanStack Query for data fetching
- Headless UI for accessible components

### Main Dependencies 主要依賴
```json
{
  "dependencies": {
    "next": "15.3.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@headlessui/react": "^2.2.4",
    "@heroicons/react": "^2.2.0",
    "@tanstack/react-query": "^5.80.6",
    "next-auth": "^4.24.11",
    "date-fns": "^4.1.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.0"
  }
}
```

## Project Structure 專案結構

```
postly/
├── src/
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── api/               # API Routes
│   │   ├── auth/              # Authentication pages
│   │   ├── post/              # Post related pages
│   │   ├── profile/           # User profile pages
│   │   ├── streak/            # Streak tracking pages
│   │   └── user/              # User related pages
│   ├── components/            # React Components
│   │   ├── Comments/          # Comment related components
│   │   ├── AuthProvider.tsx   # Authentication provider
│   │   ├── Header.tsx         # Main header component
│   │   └── ReflectionCard.tsx # Reflection display component
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── services/              # API services
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── public/                    # Static assets
├── tailwind.config.ts        # Tailwind CSS configuration
├── next.config.ts            # Next.js configuration
└── package.json              # Project dependencies
```

## Getting Started 開始使用

### Prerequisites 前置需求
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Git

### Environment Setup 環境設定
Create a `.env.local` file in the root directory with the following variables:
在根目錄建立 `.env.local` 檔案，並設定以下環境變數：

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Installation 安裝步驟

1. Clone the repository 複製專案
```bash
git clone https://github.com/your-username/postly.git
cd postly
```

2. Install dependencies 安裝依賴
```bash
npm install
```

3. Start development server 啟動開發伺服器
```bash
npm run dev
```

4. Open browser and visit 開啟瀏覽器並訪問
```
http://localhost:3000
```

## Development Guide 開發指南

### Code Style 程式碼風格
- Follow TypeScript strict mode
- Use ESLint for code linting
- Follow Prettier code formatting
- Use Tailwind CSS for styling
- 遵循 TypeScript 嚴格模式
- 使用 ESLint 進行程式碼檢查
- 遵循 Prettier 程式碼格式化
- 使用 Tailwind CSS 進行樣式設計

### Component Guidelines 元件準則
- Create reusable components in `src/components`
- Use TypeScript interfaces for props
- Implement proper error handling
- Add JSDoc comments for documentation
- 在 `src/components` 建立可重用元件
- 使用 TypeScript 介面定義 props
- 實作適當的錯誤處理
- 添加 JSDoc 註解作為文件

### State Management 狀態管理
- Use React Query for server state
- Implement React Context where needed
- Follow React hooks best practices
- 使用 React Query 管理伺服器狀態
- 根據需求實作 React Context
- 遵循 React hooks 最佳實踐

## API Documentation API 文件

### Authentication 認證
- Google OAuth2.0 integration
- JWT token based authentication
- Protected API routes
- Google OAuth2.0 整合
- 基於 JWT token 的認證
- 受保護的 API 路由

### Endpoints 端點
- `/api/auth/*` - Authentication routes
- `/api/posts/*` - Post management
- `/api/comments/*` - Comment management
- `/api/users/*` - User management
- `/api/streak/*` - Streak tracking

## Testing 測試
- Unit tests with Jest
- Integration tests with React Testing Library
- E2E tests with Cypress
- 使用 Jest 進行單元測試
- 使用 React Testing Library 進行整合測試
- 使用 Cypress 進行端對端測試

## Deployment 部署

### Production Build 生產環境建置
```bash
npm run build
npm start
```

### Deployment Platforms 部署平台
- Vercel (Recommended)
- Docker
- Self-hosted

## Contributing 貢獻指南

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 授權條款
MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments 致謝
- Next.js team for the amazing framework
- Tailwind CSS team for the utility-first CSS framework
- All contributors who have helped this project grow

---
Built with ❤️ by the Postly Team
