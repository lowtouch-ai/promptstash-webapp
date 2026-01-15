# PromptStash

> A modern web application for discovering, previewing, customizing, and executing prompt templates

[![GitHub](https://img.shields.io/badge/GitHub-lowtouch--ai%2Fpromptstash--webapp-blue?logo=github)](https://github.com/lowtouch-ai/promptstash-webapp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

PromptStash is a powerful, open-source prompt management tool that helps you organize, customize, and deploy AI prompts across multiple platforms. Built with modern web technologies and designed for productivity.

## ✨ Features

### 🎯 Core Functionality
- **Template Management**: Browse and search through a collection of prompt templates
- **Smart Filtering**: Filter by categories, tags, favorites, and recently used templates
- **Variable System**: Parse and fill in template variables with a dedicated workspace
- **Live Preview**: Real-time preview of prompts with filled variables
- **Multi-Platform Support**: Send prompts directly to ChatGPT, Claude, Grok, and Gemini

### 💾 Persistence & State
- **Auto-Save Variables**: Input values automatically save to localStorage per template
- **Favorites System**: Mark templates as favorites with persistent storage
- **Recently Used**: Track recently accessed templates with timestamps
- **Smart Filters**: Quick filters that auto-reset when switching between different filter types

### 🎨 User Experience
- **Three-Panel Layout**: Global navigation, filterable sidebar, and main content area
- **Smooth Animations**: Motion-powered transitions between views
- **Card & List Views**: Toggle between different template display modes
- **Keyboard Shortcuts**: Ctrl/Cmd+Click for new tabs on AI platform links
- **Responsive Design**: Clean aesthetic inspired by GitHub, Vercel, and Linear

### 🔧 Advanced Features
- **Multi-Select Tags**: Select multiple tags with Ctrl/Cmd+Click or Shift+Click ranges
- **GitHub Integration**: Link templates to their source repositories
- **Date Tracking**: Show actual last commit timestamps from Git
- **Template Parser**: Automatically detect `{{variable-name}}` placeholders
- **Copy to Clipboard**: One-click copy with visual feedback
- **URL Prefilling**: Pre-populate AI platforms with your prompt (when supported)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lowtouch-ai/promptstash-webapp.git
cd promptstash-webapp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `dist` directory.

## 🏗️ Tech Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling framework

### UI Components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Motion (Framer Motion)** - Animation library
- **Sonner** - Toast notifications

### Additional Libraries
- **js-yaml** - YAML parsing for template metadata
- **date-fns** - Date formatting
- **clsx** + **tailwind-merge** - Utility class management

## 📁 Project Structure

```
promptstash-webapp/
├── src/
│   ├── app/
│   │   ├── components/       # React components
│   │   │   ├── ui/          # Reusable UI components
│   │   │   ├── sidebar.tsx  # Filterable sidebar
│   │   │   ├── template-list.tsx
│   │   │   └── template-detail.tsx
│   │   ├── data/            # Mock data and types
│   │   ├── services/        # Business logic
│   │   │   ├── favorites.ts
│   │   │   ├── recently-used.ts
│   │   │   └── template-variables.ts
│   │   └── App.tsx          # Main application
│   ├── styles/              # Global styles
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
└── package.json
```

## 🎯 Usage

### Template Workflow

1. **Browse Templates**: Use the sidebar to filter by category, tags, or quick filters
2. **Select Template**: Click on a template card to open the detail view
3. **Fill Variables**: Enter values in the "Fill Variables" tab
4. **Preview**: Check the "Preview" tab to see the rendered prompt
5. **Send to AI**: Click a platform button (ChatGPT, Claude, Grok, Gemini) to copy and open
6. **Auto-Save**: Your variable inputs are automatically saved for next time

### Keyboard Shortcuts

- **Ctrl/Cmd + Click** on AI platform buttons: Open in new tab
- **Ctrl/Cmd + Click** on tags: Toggle individual tags (multi-select)
- **Shift + Click** on tags: Select range of tags

### Quick Filters

- **Recently Used**: Shows templates you've accessed recently
- **Favorites**: Shows templates you've marked as favorites
- Selecting a quick filter auto-resets category and tag filters
- Selecting a category or tag auto-resets quick filters

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Use TypeScript for type safety
- Write descriptive commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About lowtouch.ai

PromptStash is an open-source project by [lowtouch.ai](https://lowtouch.ai), building tools for the AI-powered future.

## 🔗 Links

- **Repository**: [github.com/lowtouch-ai/promptstash-webapp](https://github.com/lowtouch-ai/promptstash-webapp)
- **Issues**: [Report bugs or request features](https://github.com/lowtouch-ai/promptstash-webapp/issues)
- **Discussions**: [Join the conversation](https://github.com/lowtouch-ai/promptstash-webapp/discussions)

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons by [Lucide](https://lucide.dev/)
- Animations powered by [Motion](https://motion.dev/)
- Design inspired by GitHub, Vercel, and Linear

---

Made with ❤️ by the lowtouch.ai team
