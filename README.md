# Password Guessing Game

A fun and interactive web-based password guessing game where players try to guess passwords character by character.

## 🎮 How to Play

1. **Enter a Password**: Type any password you want others to guess
2. **Start the Game**: The password gets hidden and replaced with empty boxes
3. **Guess Characters**: Fill in each box with your character guesses
4. **Visual Feedback**: 
   - ✅ Correct guesses turn green
   - ❌ Incorrect guesses turn red
5. **Case Insensitive**: Uppercase and lowercase letters are treated the same
6. **Win Condition**: Complete all characters correctly to win!

## 🚀 Features

- **Clean Interface**: Minimalist design focused on gameplay
- **Real-time Feedback**: Instant visual validation of guesses
- **Progress Tracking**: See how many characters you've guessed correctly
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Attractive Styling**: Modern dark theme with gradient backgrounds and smooth animations
- **Keyboard Navigation**: Auto-focus and backspace navigation between character boxes

## 🛠 Technical Stack

- **Frontend**: React + TypeScript + Vite
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS 4 + daisyUI 5
- **State Management**: React hooks
- **Package Manager**: pnpm

## 🎨 Design Features

- Dark gradient background with pink/purple accent colors
- Glassmorphism card design with backdrop blur
- Smooth hover animations and transitions
- Custom color scheme optimized for visual appeal
- Typography using Inter font family

## 💻 Development

### Prerequisites
- Node.js (v18 or higher)
- pnpm

### Setup
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev:frontend
```

### Development Commands
- `pnpm run dev:frontend` - Start the frontend development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build

## 🔧 Code Architecture

The game is built with extensibility in mind:

- **Component Structure**: Separation between `HomePage` and `PasswordGuessGame` components
- **State Management**: Clean React hooks for password, game state, and guesses
- **TypeScript Interfaces**: Proper typing for component props and state
- **Responsive Design**: Mobile-first approach with flexible layouts

## 📝 Game Rules

- Character guessing is case-insensitive (A = a)
- Each character box accepts only one character
- Progress is tracked in real-time
- Game can be reset at any time with "New Game" button
- Instructions are provided in-game for new players

## 🚀 Future Enhancement Ideas

- Timer/scoring system
- Hint system
- Multiple difficulty levels
- Multiplayer functionality
- Statistics tracking
- Different game modes
- Sound effects
- Achievement system

## 📄 License

MIT License - Feel free to use this project for learning or as a base for your own games!