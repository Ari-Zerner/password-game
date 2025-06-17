import { createFileRoute } from "@tanstack/react-router";
import { Lock, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [password, setPassword] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [guesses, setGuesses] = useState<string[]>([]);

  const handleStartGame = () => {
    if (password.trim().length === 0) return;
    setGameStarted(true);
    setGuesses(new Array(password.length).fill(""));
  };

  const handleReset = () => {
    setPassword("");
    setGameStarted(false);
    setGuesses([]);
  };

  const handleGuessChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single character
    const newGuesses = [...guesses];
    newGuesses[index] = value.toLowerCase();
    setGuesses(newGuesses);
  };

  const isCorrectGuess = (index: number) => {
    return guesses[index].toLowerCase() === password[index].toLowerCase();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card shadow-xl w-full max-w-2xl">
        <div className="card-body">
          <div className="not-prose flex justify-center mb-4">
            <Lock className="w-12 h-12 text-primary" />
          </div>
          
          <h1 className="text-center mb-6">Password Guessing Game</h1>
          
          {/* Instructions Panel */}
          <div className="alert alert-info mb-6">
            <div className="not-prose">
              <h3 className="font-semibold text-lg mb-2">How to Play:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Enter any password you want others to guess</li>
                <li>The password will be hidden and replaced with empty boxes</li>
                <li>Guess each character one by one in the boxes</li>
                <li>Correct guesses turn green, incorrect ones turn red</li>
                <li>Guessing is case-insensitive (A = a)</li>
                <li>Complete all characters to win!</li>
              </ul>
            </div>
          </div>

          {!gameStarted ? (
            <div className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg font-medium">Enter a password to hide:</span>
                </label>
                <input 
                  type="text"
                  placeholder="Type your password here..."
                  className="input input-bordered input-lg text-center"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartGame()}
                />
              </div>
              
              <div className="not-prose">
                <button 
                  className="btn btn-primary btn-lg w-full"
                  onClick={handleStartGame}
                  disabled={password.trim().length === 0}
                >
                  Start Game
                </button>
              </div>
            </div>
          ) : (
            <PasswordGuessGame 
              password={password}
              guesses={guesses}
              onGuessChange={handleGuessChange}
              isCorrectGuess={isCorrectGuess}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface PasswordGuessGameProps {
  password: string;
  guesses: string[];
  onGuessChange: (index: number, value: string) => void;
  isCorrectGuess: (index: number) => boolean;
  onReset: () => void;
}

function PasswordGuessGame({ 
  password, 
  guesses, 
  onGuessChange, 
  isCorrectGuess, 
  onReset 
}: PasswordGuessGameProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, password.length);
  }, [password.length]);

  const handleInputChange = (index: number, value: string) => {
    onGuessChange(index, value);
    
    // Auto-focus next input if current is filled
    if (value && index < password.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !guesses[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const correctGuesses = guesses.filter((_, index) => isCorrectGuess(index)).length;
  const isComplete = correctGuesses === password.length;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-lg mb-2">Guess the password character by character:</p>
        <div className="badge badge-primary badge-lg">
          {correctGuesses} / {password.length} correct
        </div>
      </div>

      <div className="not-prose flex flex-wrap justify-center gap-2 max-w-full">
        {password.split('').map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            className={`input input-bordered w-12 h-12 text-center text-xl font-mono ${
              guesses[index] ? (isCorrectGuess(index) ? 'input-success bg-success/20' : 'input-error') : ''
            }`}
            value={guesses[index]}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            maxLength={1}
          />
        ))}
      </div>

      {isComplete && (
        <div className="not-prose text-center">
          <div className="alert alert-success">
            <span className="text-lg font-semibold">🎉 Congratulations! You guessed the password!</span>
          </div>
        </div>
      )}

      <div className="not-prose text-center">
        <button 
          className="btn btn-outline btn-lg"
          onClick={onReset}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          New Game
        </button>
      </div>
    </div>
  );
}
