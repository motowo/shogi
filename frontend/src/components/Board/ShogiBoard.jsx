import React, { useState, useCallback } from 'react';
import { apiService } from '../../services/api';
import './ShogiBoard.css';

const PIECE_SYMBOLS = {
  // Sente pieces (top player)
  K: '玉',
  R: '飛',
  B: '角',
  G: '金',
  S: '銀',
  N: '桂',
  L: '香',
  P: '歩',
  // Gote pieces (bottom player)
  k: '王',
  r: '竜',
  b: '馬',
  g: '全',
  s: '成銀',
  n: '成桂',
  l: '成香',
  p: 'と',
  // Promoted pieces
  '+R': '竜',
  '+B': '馬',
  '+S': '成銀',
  '+N': '成桂',
  '+L': '成香',
  '+P': 'と',
  '+r': '竜',
  '+b': '馬',
  '+s': '成銀',
  '+n': '成桂',
  '+l': '成香',
  '+p': 'と',
};

const ShogiBoard = ({
  boardState,
  currentPlayer,
  onMove,
  highlightedSquares = [],
  disabled = false,
}) => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);

  const isPieceOwnedByCurrentPlayer = (piece) => {
    if (!piece) return false;
    const isUpperCase = piece === piece.toUpperCase();
    return (currentPlayer === 'sente' && isUpperCase) || (currentPlayer === 'gote' && !isUpperCase);
  };

  const isSquareHighlighted = (row, col) => {
    return highlightedSquares.some((pos) => pos.row === row && pos.col === col);
  };

  const isPossibleMove = (row, col) => {
    return possibleMoves.some((pos) => pos.row === row && pos.col === col);
  };

  const handleSquareClick = useCallback(
    async (row, col) => {
      if (disabled) return;

      const piece = boardState[row][col];
      const clickedPosition = { row, col };

      if (selectedSquare) {
        // If clicking on a possible move, make the move
        if (isPossibleMove(row, col)) {
          const move = {
            from: selectedSquare,
            to: clickedPosition,
            piece: boardState[selectedSquare.row][selectedSquare.col],
            captured: piece || undefined,
          };
          onMove(move);
        }
        // Clear selection
        setSelectedSquare(null);
        setPossibleMoves([]);
      } else if (piece && isPieceOwnedByCurrentPlayer(piece)) {
        // Select piece and show possible moves
        setSelectedSquare(clickedPosition);
        
        // 実際の合法手を取得
        try {
          const result = await apiService.getValidMoves(boardState, clickedPosition, currentPlayer);
          if (result.data && result.data.validMoves) {
            setPossibleMoves(result.data.validMoves);
          } else {
            // フォールバック: 基本的な移動パターン
            const fallbackMoves = [
              { row: Math.max(0, row - 1), col },
              { row: Math.min(8, row + 1), col },
              { row, col: Math.max(0, col - 1) },
              { row, col: Math.min(8, col + 1) },
            ].filter(pos => pos.row >= 0 && pos.row < 9 && pos.col >= 0 && pos.col < 9);
            setPossibleMoves(fallbackMoves);
          }
        } catch (error) {
          console.error('Failed to get valid moves:', error);
          // エラー時は空の配列を設定
          setPossibleMoves([]);
        }
      }
    },
    [boardState, selectedSquare, currentPlayer, disabled, onMove, possibleMoves]
  );

  const renderSquare = (row, col) => {
    const piece = boardState[row][col];
    const isSelected = selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
    const isHighlighted = isSquareHighlighted(row, col);
    const canMove = isPossibleMove(row, col);

    const squareClass = [
      'shogi-square',
      isSelected ? 'selected' : '',
      isHighlighted ? 'highlighted' : '',
      canMove ? 'possible-move' : '',
      piece && isPieceOwnedByCurrentPlayer(piece) ? 'own-piece' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        key={`${row}-${col}`}
        className={squareClass}
        onClick={() => handleSquareClick(row, col)}
      >
        {piece && (
          <div className={`piece ${piece === piece.toUpperCase() ? 'sente' : 'gote'}`}>
            {PIECE_SYMBOLS[piece] || piece}
          </div>
        )}
      </div>
    );
  };

  const renderColumnLabels = () => {
    const labels = ['９', '８', '７', '６', '５', '４', '３', '２', '１'];
    return (
      <div className="column-labels">
        {labels.map((label, index) => (
          <div key={index} className="column-label">
            {label}
          </div>
        ))}
      </div>
    );
  };

  const renderRowLabels = () => {
    const labels = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
    return (
      <div className="row-labels">
        {labels.map((label, index) => (
          <div key={index} className="row-label">
            {label}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="shogi-board-container">
      {renderColumnLabels()}
      <div className="shogi-board-main">
        {renderRowLabels()}
        <div className="shogi-board">
          {boardState.map((row, rowIndex) =>
            row.map((_, colIndex) => renderSquare(rowIndex, colIndex))
          )}
        </div>
      </div>
      <div className="current-player">
        現在のプレイヤー: {currentPlayer === 'sente' ? '先手' : '後手'}
      </div>
    </div>
  );
};

export default ShogiBoard;