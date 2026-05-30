import { useEffect, useState } from 'react';
import { GameShell } from './GameShell';
import { PlayerSetup } from './PlayerSetup';
import { GameDice } from './GameDice';
import { useI18n } from '../../../i18n/useI18n';
import { defaultRng } from '../../../dice/random';
import { appUrl } from '../../../links';
import { shareOrCopy } from '../../../share';
import { useSound } from '../../hooks/useSound';
import { useUndoableGame } from '../../hooks/useUndoableGame';
import {
  bankAction,
  canBank,
  canRoll,
  createPig,
  PIG_TARGET,
  rollDiceAction,
  type PigState,
} from '../../../games/pig/engine';

const isOver = (s: PigState): boolean => s.phase === 'over';

export function PigGame() {
  const { t } = useI18n();
  const sound = useSound();
  const { game, canUndo, start, apply, undo, quit } = useUndoableGame<PigState>(
    'pig',
    isOver
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (game?.phase === 'over') sound('win');
  }, [game?.phase, sound]);

  if (!game) {
    return (
      <GameShell title={t('modes.pig')}>
        <PlayerSetup onStart={names => start(createPig(names, PIG_TARGET))} />
      </GameShell>
    );
  }

  const names = game.players.map(p => p.name);
  const newGame = () => quit();
  const replay = () => start(createPig(names, game.target));

  if (game.phase === 'over') {
    const ranked = game.players
      .map(p => ({ name: p.name, score: p.score }))
      .sort((a, b) => b.score - a.score);

    const onShare = async () => {
      const summary = ranked.map(r => `${r.name} ${r.score}`).join(', ');
      const res = await shareOrCopy({
        title: 'Miss Dice',
        text: `${t('modes.pig')} — ${summary}`,
        url: appUrl(),
      });
      if (res === 'copied') {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      }
    };

    return (
      <GameShell title={t('modes.pig')} onNewGame={newGame}>
        <div className="results">
          <h2 className="results__title">{t('game.gameOver')}</h2>
          <p className="results__headline">
            🏆 {t('game.winner', { name: game.players[game.winner!]!.name })}
          </p>
          <ol className="results__list">
            {ranked.map((r, rank) => (
              <li key={rank} className="results__row">
                <span>
                  {rank + 1}. {r.name}
                </span>
                <span className="results__score">{r.score}</span>
              </li>
            ))}
          </ol>
          <div className="btn-row">
            <button type="button" className="primary-btn" onClick={replay}>
              {t('game.replay')}
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => void onShare()}
            >
              {t('game.shareResult')}
            </button>
          </div>
          <p className="about__feedback" role="status" aria-live="polite">
            {copied ? t('game.copied') : ''}
          </p>
          <button type="button" className="link-btn" onClick={newGame}>
            {t('common.newGame')}
          </button>
        </div>
      </GameShell>
    );
  }

  const player = game.players[game.current]!;

  const footer = (
    <div className="btn-row">
      <button
        type="button"
        className="primary-btn"
        disabled={!canRoll(game)}
        onClick={() => {
          sound('roll');
          apply(rollDiceAction(game, defaultRng));
        }}
      >
        {game.rolledThisTurn ? t('game.rollAgain') : t('game.roll')}
      </button>
      <button
        type="button"
        className="secondary-btn"
        disabled={!canBank(game)}
        onClick={() => {
          sound('result');
          apply(bankAction(game));
        }}
      >
        {t('pig.bank')}
      </button>
    </div>
  );

  return (
    <GameShell
      title={t('modes.pig')}
      onNewGame={newGame}
      onUndo={undo}
      canUndo={canUndo}
      footer={footer}
    >
      <p className="game-turn">{t('game.turnOf', { name: player.name })}</p>
      <p className="setting-row__hint pig-target">
        {t('pig.target', { n: game.target })}
      </p>

      <GameDice
        values={[game.lastRoll ?? 1]}
        held={[false]}
        nonce={game.rollNonce}
        canHold={false}
        onToggleHold={() => {}}
      />

      <p className="game-status" aria-live="polite">
        {game.busted ? (
          <span className="pig-bust">{t('pig.bust')}</span>
        ) : !game.rolledThisTurn ? (
          t('game.tapToRoll')
        ) : (
          <>
            <span className="pig-turn-total">
              {t('pig.turnTotal', { n: game.turnTotal })}
            </span>
            <span className="game-status__sub">{t('pig.rollOrBank')}</span>
          </>
        )}
      </p>

      <div className="scoreboard">
        {game.players.map((p, i) => (
          <div
            key={i}
            className={`scoreboard__item${i === game.current ? ' scoreboard__item--active' : ''}`}
          >
            <span className="scoreboard__name">{p.name}</span>
            <span className="scoreboard__score">{p.score}</span>
          </div>
        ))}
      </div>
    </GameShell>
  );
}
