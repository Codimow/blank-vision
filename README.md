# 🌊 Blank Vision

A high-performance, spatial window manager for the web. Built for systems programmers and developers who need an infinite canvas to map out their thoughts, code, and the web.

![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue)
![Effect](https://img.shields.io/badge/Effect-TS-yellow)

## ✨ Features

- **Infinite Canvas**: A pannable and zoomable background with a radial grid system.
- **Spatial Windowing**: Draggable and resizable windows with smooth, spring-based transitions.
- **Real Shell Integration**: A high-performance terminal window connected to a local `node-pty` server.
- **Web Explorer**: A built-in browser window to load any URL directly on the canvas.
- **GitHub Explorer**: Fetch and view repositories for any GitHub user.
- **Concept Deep-Dive (Coming Soon)**: Map out complex topics spatially with AI-generated research nodes.

## 🚀 Getting Started

### Prerequisites

- [pnpm](https://pnpm.io/)
- [Node.js](https://nodejs.org/) (v20+)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Codimow/blank-vision.git
   cd blank-vision
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Rebuild native modules (for the PTY shell):
   ```bash
   pnpm rebuild node-pty
   ```

### Running Locally

To start both the Next.js dev server and the PTY shell bridge:

```bash
pnpm run start-all
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🛠️ Architecture

Blank Vision is built with a focus on performance and modularity:

- **Framework**: Next.js (App Router)
- **State Management**: Zustand (for the spatial state engine)
- **Animations**: Framer Motion
- **Terminal**: xterm.js + socket.io
- **Styling**: Tailwind CSS + clsx/tailwind-merge

## 🤝 Contributing

This project is a work in progress. Feel free to open issues or submit pull requests.

## 📄 License

MIT © [Codimow](https://github.com/Codimow)
