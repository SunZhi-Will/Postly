# Postly - Reflection Sharing Community Platform

Postly is a community platform focused on personal growth and reflection sharing, allowing users to record and share their daily reflections and insights.

## Features

### 1. Daily Reflection Prompts
- Get daily curated reflection topics
- Guide users through deep thinking
- Optional prompts that can be toggled

### 2. Reflection Sharing
- Users can share personal reflections
- Interactive features (likes, comments)
- Clean card-based design

### 3. Personal Achievements
- Streak tracking
- Personal trait tags
- Interaction statistics

### 4. Community Interaction
- View community members' shares
- Content sharing functionality
- Daily featured content recommendations

## Technical Architecture

### Frontend Technologies
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Heroicons

### Main Dependencies
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

## Directory Structure

```
postly/
├── src/
│   ├── app/
│   │   └── page.tsx          # Main page
│   ├── components/
│   │   ├── Header.tsx        # Header component
│   │   ├── ReflectionCard.tsx    # Reflection card component
│   │   └── ReflectionPrompt.tsx  # Reflection prompt component
│   └── utils/
│       └── cn.ts             # Utility functions
├── public/
├── tailwind.config.ts        # Tailwind configuration
├── package.json
└── README.md
```

## Installation Guide

1. Clone the project
```bash
git clone [repository-url]
cd postly
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open browser and visit
```
http://localhost:3000
```

## Component Documentation

### Header Component
- Fixed at the top of the page
- Displays user information and achievements
- Includes personal trait tags

### ReflectionPrompt Component
- Shows daily reflection prompts
- Closable card design
- Guides users to start reflecting

### ReflectionCard Component
- Displays user's reflection content
- Supports social interaction features

## Design Concept

### Visual Design
- Use dark theme
- Simple and modern interface style
- Focus on readability
- Appropriate white space and spacing

### Interaction Design
- Simple and intuitive operation
- Immediate visual feedback
- Smooth state transition

## Development Guide

### New Features
1. Create new components in `src/components`
2. Define types using TypeScript
3. Follow existing design style
4. Add necessary comments

### Style Guide
- Use Tailwind CSS class names
- Maintain consistent naming rules
- Follow responsive design principles

## Pending Features
- [ ] User authentication system
- [ ] Personal data page
- [ ] Reflection history record
- [ ] Community interaction enhancement
- [ ] Notification system

## Contribution Guide
1. Fork the project
2. Create feature branch
3. Submit changes
4. Initiate Pull Request

## License
[License Description]
