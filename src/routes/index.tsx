import { createFileRoute } from "@tanstack/react-router";
import { Lock, RotateCcw, Upload, X, Download } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleStartGame = () => {
    if (password.trim().length === 0) return;
    setGameStarted(true);
    setGuesses(new Array(password.length).fill(""));
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

  // Secure canvas rendering function
  const renderSecureImage = (canvas: HTMLCanvasElement, imageSrc: string, clarity: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match image aspect ratio (larger display)
      const maxWidth = 600;
      const maxHeight = 450;
      const aspectRatio = img.width / img.height;
      
      let canvasWidth = maxWidth;
      let canvasHeight = maxWidth / aspectRatio;
      
      if (canvasHeight > maxHeight) {
        canvasHeight = maxHeight;
        canvasWidth = maxHeight * aspectRatio;
      }
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      // Apply filters based on clarity
      const blur = Math.max(0, 20 - (clarity * 20));
      const brightness = 0.3 + (clarity * 0.7);
      const contrast = 0.5 + (clarity * 0.5);
      const saturate = 0.2 + (clarity * 0.8);
      const hueRotate = Math.max(0, 180 - (clarity * 180));
      
      ctx.filter = `
        blur(${blur}px) 
        brightness(${brightness}) 
        contrast(${contrast}) 
        saturate(${saturate}) 
        hue-rotate(${hueRotate}deg)
      `;
      
      // Draw the image
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      
      // Add deterministic noise overlay if not fully revealed
      if (clarity < 1) {
        ctx.filter = 'none';
        ctx.globalCompositeOperation = 'multiply';
        
        // Create deterministic noise pattern based on clarity level
        const noiseIntensity = 1 - clarity;
        const seed = Math.floor(clarity * 100); // Use clarity as seed for deterministic pattern
        
        // Better PRNG to avoid regular patterns
        const prng = (x: number, y: number, s: number) => {
          let hash = x * 374761393 + y * 668265263 + s * 1274126177;
          hash = (hash ^ (hash >>> 13)) * 1274126177;
          return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
        };
        
        for (let x = 0; x < canvasWidth; x += 2) {
          for (let y = 0; y < canvasHeight; y += 2) {
            const random = prng(x, y, seed);
            if (random < noiseIntensity * 0.25) {
              const size = Math.floor(random * 3) + 1;
              const alpha = noiseIntensity * (0.4 + random * 0.4);
              ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
              ctx.fillRect(x, y, size, size);
            }
          }
        }
        ctx.globalCompositeOperation = 'source-over';
      }
    };
    
    // Important: Set crossOrigin to prevent tainted canvas
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setPassword("");
    setGameStarted(false);
    setGuesses([]);
    setSelectedImage(null);
    setImagePreview(null);
    // Clear canvas when resetting
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
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
          
          <h1 className="text-center mb-6">Interrogame</h1>
          

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
              renderSecureImage={renderSecureImage}
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
  renderSecureImage: (canvas: HTMLCanvasElement, imageSrc: string, clarity: number) => void;
}

function PasswordGuessGame({ 
  password, 
  guesses, 
  onGuessChange, 
  isCorrectGuess, 
  onReset,
  imagePreview,
  renderSecureImage 
}: PasswordGuessGameProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const correctGuesses = guesses.filter((_, index) => isCorrectGuess(index)).length;
  const isComplete = correctGuesses === password.length;
  const imageClarity = password.length > 0 ? correctGuesses / password.length : 0;

  const handleDownloadImage = () => {
    if (canvasRef.current && imageClarity === 1) {
      const link = document.createElement('a');
      link.download = 'revealed-image.png';
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, password.length);
  }, [password.length]);

  // Update canvas only when correct guess count changes (deterministic)
  useEffect(() => {
    if (imagePreview && canvasRef.current) {
      renderSecureImage(canvasRef.current, imagePreview, imageClarity);
      
      // Override toDataURL and toBlob methods until fully revealed
      const canvas = canvasRef.current;
      if (imageClarity < 1) {
        const originalToDataURL = canvas.toDataURL.bind(canvas);
        const originalToBlob = canvas.toBlob.bind(canvas);
        
        canvas.toDataURL = () => {
          console.warn('Image access blocked until password is fully revealed');
          return 'data:,'; // Empty data URL
        };
        
        canvas.toBlob = (callback) => {
          console.warn('Image access blocked until password is fully revealed');
          if (callback) callback(null);
        };
        
        // Store original methods for restoration
        (canvas as any)._originalToDataURL = originalToDataURL;
        (canvas as any)._originalToBlob = originalToBlob;
      } else {
        // Restore original methods when fully revealed
        if ((canvas as any)._originalToDataURL) {
          canvas.toDataURL = (canvas as any)._originalToDataURL;
          canvas.toBlob = (canvas as any)._originalToBlob;
          delete (canvas as any)._originalToDataURL;
          delete (canvas as any)._originalToBlob;
        }
      }
    }
  }, [imagePreview, correctGuesses, renderSecureImage]); // Only depend on correctGuesses count, not imageClarity

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


  return (
    <div className="space-y-8">
      {/* Image reveal section */}
      {imagePreview && (
        <div className="text-center">
          {/* Canvas container - always centered */}
          <div className="flex justify-center mb-4">
            <canvas 
              ref={canvasRef}
              className="rounded-lg border border-base-300 max-h-96"
              data-secure={imageClarity < 1 ? "true" : undefined}
              style={{
                transition: 'opacity 0.5s ease-in-out',
                maxWidth: '100%',
                height: 'auto',
                userSelect: imageClarity < 1 ? 'none' : 'auto',
                WebkitUserSelect: imageClarity < 1 ? 'none' : 'auto',
                MozUserSelect: imageClarity < 1 ? 'none' : 'auto',
                msUserSelect: imageClarity < 1 ? 'none' : 'auto',
                pointerEvents: imageClarity < 1 ? 'none' : 'auto', // Enable interactions when fully revealed
                cursor: imageClarity < 1 ? 'not-allowed' : 'auto'
              }}
              onContextMenu={imageClarity < 1 ? (e) => e.preventDefault() : undefined} // Allow right-click when revealed
              onDragStart={imageClarity < 1 ? (e) => e.preventDefault() : undefined} // Allow drag when revealed
              onSelectStart={imageClarity < 1 ? (e) => e.preventDefault() : undefined} // Allow selection when revealed
            />
          </div>
          
          {/* Download button when fully revealed - separate from canvas */}
          {imageClarity === 1 && (
            <div className="not-prose">
              <button 
                onClick={handleDownloadImage}
                className="btn btn-primary btn-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </button>
              <div className="text-sm text-red-400 mt-2">
                Target acquired. Right-click to extract or download.
              </div>
            </div>
          )}
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
