# Mini Sudoku (3x3) Feature

A simplified version of Sudoku using a 3x3 grid for quick, casual gameplay.

## How to Play

1. From the main menu, click **"Mini Sudoku (3x3)"**
2. Select your difficulty:
   - **Easy**: 2 empty cells to fill
   - **Medium**: 4 empty cells to fill
   - **Hard**: 5 empty cells to fill

## Game Rules

- Fill the 3x3 grid with numbers 1, 2, and 3
- Each **row** must contain 1, 2, and 3 exactly once
- Each **column** must contain 1, 2, and 3 exactly once
- No duplicates allowed in any row or column

## Features

### Gameplay
- Interactive 3x3 board with visual highlighting
- Click cells to select, then click numbers 1-3 to fill
- Automatic conflict detection (shows mistakes in red)
- Timer to track solving speed
- Mistake counter

### Controls
- **Number Buttons**: Click 1, 2, or 3 to fill selected cell
- **Clear Button**: Remove number from selected cell
- **Hint Button**: Reveals one correct number
- **Undo/Redo**: Navigate through your move history
- **Pause**: Pause timer and hide board

### Keyboard Shortcuts
- **1-3**: Enter numbers
- **Backspace/Delete/0**: Clear cell
- **Arrow Keys**: Navigate between cells
- **H**: Get hint
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Y**: Redo
- **Escape**: Pause/Resume

## Design

- Clean, modern interface with green gradient theme
- Larger cells and numbers (4xl font) for better visibility
- Smooth animations and transitions
- Responsive layout for mobile and desktop
- Clear visual feedback for selections and conflicts

## Technical Implementation

### New Files Created
- `src/utils/mini-sudoku-generator.ts` - Puzzle generation algorithm
- `src/hooks/useMiniGameState.ts` - Game state management
- `src/components/MiniSudokuCell.tsx` - Individual cell component
- `src/components/MiniSudokuBoard.tsx` - 3x3 board component
- `src/components/MiniNumberPad.tsx` - Number input controls
- `src/MiniSudokuApp.tsx` - Main Mini Sudoku app

### Key Differences from Regular Sudoku
- No 3x3 box constraint (only rows and columns)
- Simplified grid (3x3 instead of 9x9)
- Faster gameplay (games take 1-3 minutes typically)
- No notes/pencil marks (not needed for 3 numbers)
- Independent game state (doesn't use database)

## Tips for Players

1. Start with rows or columns that have the most numbers filled
2. Look for patterns where only one number can fit
3. Process of elimination is key with only 3 options
4. Most games can be solved in under 2 minutes
5. Use hints sparingly to maintain challenge

## Future Enhancements (Not Implemented)

Potential features for the Mini Sudoku mode:
- Save high scores locally
- Achievement system
- Timed challenges
- Multiplayer race mode
- Daily mini challenges
- Custom grid themes
