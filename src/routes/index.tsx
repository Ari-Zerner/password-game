import { createFileRoute } from "@tanstack/react-router";
import { Lock, RotateCcw, Upload, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [password, setPassword] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartGame = () => {
    if (password.trim().length === 0) return;
    setGameStarted(true);
    setGuesses(new Array(password.length).fill(""));
  };

  const handleReset = () => {
    setPassword("");
    setGameStarted(false);
    setGuesses([]);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          <div className="mb-6">
            <div className="not-prose">
              <button 
                onClick={() => setShowInstructions(!showInstructions)}
                className="btn btn-ghost btn-sm w-full justify-between"
              >
                <span className="font-semibold">How to Play</span>
                {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showInstructions && (
                <div className="alert alert-info mt-2">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Enter any password you want others to guess</li>
                    <li>Optionally upload an image that will be revealed as the password is guessed</li>
                    <li>The password will be hidden and replaced with empty boxes</li>
                    <li>Guess each character one by one in the boxes</li>
                    <li>Correct guesses turn green, incorrect ones turn red</li>
                    <li>Each correct guess makes the image clearer (if uploaded)</li>
                    <li>Guessing is case-insensitive (A = a)</li>
                    <li>Complete all characters to win and fully reveal the image!</li>
                  </ul>
                </div>
              )}
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

              {/* Image Upload Section */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg font-medium">Upload an image to reveal (optional):</span>
                </label>
                
                {!imagePreview ? (
                  <div className="not-prose">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="file-input file-input-bordered file-input-primary w-full"
                    />
                    <div className="mt-2 text-sm text-base-content/70">
                      The image will start completely obscured and become clearer with each correct guess
                    </div>
                  </div>
                ) : (
                  <div className="not-prose">
                    <div className="relative inline-block">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-xs max-h-48 rounded-lg border border-base-300"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="btn btn-sm btn-circle btn-error absolute -top-2 -right-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-success">
                      Image ready! This will be revealed as the password is guessed.
                    </div>
                  </div>
                )}
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
              imagePreview={imagePreview}
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
  imagePreview: string | null;
}

function PasswordGuessGame({ 
  password, 
  guesses, 
  onGuessChange, 
  isCorrectGuess, 
  onReset,
  imagePreview 
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

  // Calculate image clarity based on correct guesses
  const imageClarity = password.length > 0 ? correctGuesses / password.length : 0;

  return (
    <div className="space-y-8">
      {/* Image reveal section */}
      {imagePreview && (
        <div className="text-center">
          <div className="relative inline-block max-w-md">
            <img 
              src={imagePreview} 
              alt="Hidden image" 
              className="rounded-lg border border-base-300 max-h-64 w-auto"
              style={{
                filter: `
                  blur(${Math.max(0, 20 - (imageClarity * 20))}px)
                  brightness(${0.3 + (imageClarity * 0.7)})
                  contrast(${0.5 + (imageClarity * 0.5)})
                  saturate(${0.2 + (imageClarity * 0.8)})
                  hue-rotate(${Math.max(0, 180 - (imageClarity * 180))}deg)
                `,
                transition: 'filter 0.5s ease-in-out'
              }}
            />
          </div>
        </div>
      )}

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
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
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
            <span className="text-lg font-semibold">
              🎉 Congratulations! You guessed the password{imagePreview ? ' and revealed the image' : ''}!
            </span>
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
