import { useState } from 'react';
import { GameShell } from './GameShell';
import { PlayerSetup } from './PlayerSetup';
import { GameDice } from './GameDice';
import { useI18n } from '../../../i18n/useI18n';
import type { I18n } from '../../../i18n/useI18n';
import { defaultRng } from '../../../dice/random';
import { type HandValue } from '../../../games/dice421/scoring';
import {
  canRoll,
  canValidate,
  createDice421,
  currentHand,
  rollDiceAction,
  toggleHold,
  validateTurn,
  type Dice421State,
} from '../../../games/dice421/engine';

function handLabel(t: I18n['t'], hand: HandValue): string {
  switch (hand.kind) {
    case '421':
      return t('game421.hand421');
    case 'aces':
      return t('game421.handAces');
    case 'trips':
      return t('game421.handTrips', { value: hand.dice[0]! });
    default:
      return t('game421.handPlain');
  }
}

function tokensLabel(t: I18n['t'], n: number): string {
  return n === 1 ? t('game421.tokensOne') : t('game421.tokens', { n });
}

export function Dice421Game() {
  const { t } = useI18n();
  const [game, setGame] = useState<Dice421State | null>(null);

  if (!game) {
    return (
      <GameShell title={t('modes.d421')}>
        <PlayerSetup onStart={names => setGame(createDice421(names))} />
      </GameShell>
    );
  }

  const reset = () => setGame(null);

  if (game.phase === 'over') {
    const winner = game.players[game.winner!]!;
    return (
      <GameShell title={t('modes.d421')} onNewGame={reset}>
        <div className="results">
          <h2 className="results__title">{t('game.gameOver')}</h2>
          <p className="results__headline">
            🏆 {t('game.winner', { name: winner.name })}
          </p>
          <ol className="results__list">
            {game.players.map((p, i) => (
              <li key={i} className="results__row">
                <span>{p.name}</span>
                <span className="results__score">
                  {tokensLabel(t, p.tokens)}
                </span>
              </li>
            ))}
          </ol>
          <button type="button" className="primary-btn" onClick={reset}>
            {t('common.newGame')}
          </button>
        </div>
      </GameShell>
    );
  }

  const player = game.players[game.current]!;
  const hand = currentHand(game);
  const multiplayer = game.players.length > 1;

  const footer = (
    <div className="btn-row">
      <button
        type="button"
        className="primary-btn"
        disabled={!canRoll(game)}
        onClick={() => setGame(rollDiceAction(game, defaultRng))}
      >
        {game.rolledThisTurn ? t('game.rollAgain') : t('game.roll')}
      </button>
      {multiplayer && (
        <button
          type="button"
          className="secondary-btn"
          disabled={!canValidate(game)}
          onClick={() => setGame(validateTurn(game))}
        >
          {t('game421.validate')}
        </button>
      )}
    </div>
  );

  return (
    <GameShell title={t('modes.d421')} onNewGame={reset} footer={footer}>
      <div className="game421-status">
        <span className={`pill pill--${game.phase}`}>
          {game.phase === 'charge'
            ? t('game421.charge')
            : t('game421.decharge')}
        </span>
        {game.phase === 'charge' && (
          <span className="pill">{t('game421.pot', { n: game.pot })}</span>
        )}
      </div>

      {multiplayer && (
        <div className="scoreboard scoreboard--tokens">
          {game.players.map((p, i) => (
            <div
              key={i}
              className={`scoreboard__item${i === game.current ? ' scoreboard__item--active' : ''}`}
            >
              <span className="scoreboard__name">{p.name}</span>
              <span className="scoreboard__score">{p.tokens}</span>
            </div>
          ))}
        </div>
      )}

      <p className="game-turn">{t('game.turnOf', { name: player.name })}</p>

      <GameDice
        values={game.dice}
        held={game.held}
        nonce={game.rollNonce}
        canHold={game.rolledThisTurn}
        onToggleHold={i => setGame(toggleHold(game, i))}
      />

      <p className="game-hand" aria-live="polite">
        {game.rolledThisTurn
          ? t('game421.yourHand', { hand: handLabel(t, hand) })
          : t('game.tapToRoll')}
      </p>

      {game.lastRound && multiplayer && (
        <p className="round-note">
          {t('game421.roundResult', {
            winner: game.players[game.lastRound.winner]!.name,
            loser: game.players[game.lastRound.loser]!.name,
            tokens: tokensLabel(t, game.lastRound.tokens),
          })}
        </p>
      )}
    </GameShell>
  );
}
