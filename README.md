# BedTales - AI-Powered Bedtime Stories for Kids

BedTales is a delightful application that generates personalized bedtime stories for children using AI. With beautiful illustrations and engaging narratives, BedTales helps create magical moments at bedtime.

## Features

- Generate unique, personalized bedtime stories with AI
- Create and manage custom characters
- Save your favorite stories to read later
- Beautiful, child-friendly illustrations
- Customize the reading experience with different themes and fonts
- Responsive design that works on mobile and desktop

## Prerequisites

- Node.js (v16 or later)
- npm (v8 or later) or yarn
- Google Gemini API key

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/bedtales.git
   cd bedtales
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with your Google Gemini API key:
   ```
   VITE_GOOGLE_GENAI_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open the app**
   The app should now be running at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally
- `npm run test` - Run tests
- `npm run storybook` - Launch Storybook for component development
- `npm run build-storybook` - Build Storybook for deployment

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GOOGLE_GENAI_API_KEY` | Your Google Gemini API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `DEBUG` | Enable debug logging | No |

## Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/        # React context providers
├── hooks/           # Custom React hooks
├── services/        # API and service layer
├── types/           # TypeScript type definitions
└── views/           # Page-level components
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Powered by [Google Gemini](https://ai.google.dev/)
