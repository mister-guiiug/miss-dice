import { useState } from 'react';
import { GameShell } from './GameShell';
import { PlayerSetup } from './PlayerSetup';
import { GameDice } from './GameDice';
import { useI18n } from '../../../i18n/useI18n';
import type { MessageKey } from '../../../i18n/messages';
import { defaultRng } from '../../../dice/random';
import { CATEGORIES, type Category } from '../../../games/yahtzee/scoring';
import {
  canRoll,
  canScore,
  createYahtzee,
  isCategoryFilled,
  leaders,
  previewScore,
  rollDiceAction,
  scoreCategoryAction,
  toggleHold,
  totalScore,
  upperBonus,
  upperSum,
  type YahtzeeState,
} from '../../../games/yahtzee/engine';

const CAT_LABEL: Record<Category, MessageKey> = {
  ones: 'yahtzee.catOnes',
  twos: 'yahtzee.catTwos',
  threes: 'yahtzee.catThrees',
  fours: 'yahtzee.catFours',
  fives: 'yahtzee.catFives',
  sixes: 'yahtzee.catSixes',
  threeKind: 'yahtzee.catThreeKind',
  fourKind: 'yahtzee.catFourKind',
  fullHouse: 'yahtzee.catFullHouse',
  smallStraight: 'yahtzee.catSmallStraight',
  largeStraight: 'yahtzee.catLargeStraight',
  yahtzee: 'yahtzee.catYahtzee',
  chance: 'yahtzee.catChance',
};

export function YahtzeeGame() {
  const { t } = useI18n();
  const [game, setGame] = useState<YahtzeeState | null>(null);

  if (!game) {
    return (
      <GameShell title={t('modes.yahtzee')}>
        <PlayerSetup onStart={names => setGame(createYahtzee(names))} />
      </GameShell>
    );
  }

  const reset = () => setGame(null);

  if (game.phase === 'over') {
    return (
      <GameShell title={t('modes.yahtzee')} onNewGame={reset}>
        <GameResults game={game} onNewGame={reset} />
      </GameShell>
    );
  }

  const player = game.players[game.current]!;
  const rollLabel = game.rolledThisTurn ? t('game.rollAgain') : t('game.roll');
  const rollsInfo = game.rolledThisTurn
    ? t('game.rollsLeft', { n: game.rollsLeft })
    : t('game.tapToRoll');

  const footer = (
    <button
      type="button"
      className="primary-btn"
      disabled={!canRoll(game)}
      onClick={() => setGame(rollDiceAction(game, defaultRng))}
    >
      {rollLabel}
    </button>
  );

  return (
    <GameShell title={t('modes.yahtzee')} onNewGame={reset} footer={footer}>
      <p className="game-turn">{t('game.turnOf', { name: player.name })}</p>

      <GameDice
        values={game.dice}
        held={game.held}
        nonce={game.rollNonce}
        canHold={game.rolledThisTurn}
        onToggleHold={i => setGame(toggleHold(game, i))}
      />

      <p className="game-status" aria-live="polite">
        {rollsInfo}
      </p>

      <ul className="scorecard">
        {CATEGORIES.map(category => {
          const filled = isCategoryFilled(player, category);
          const selectable = !filled && canScore(game);
          const value = filled
            ? player.scores[category]
            : canScore(game)
              ? previewScore(game, category)
              : null;
          const isUpperLast = category === 'sixes';
          return (
            <li key={category}>
              <button
                type="button"
                className={`scorecard__row${filled ? ' scorecard__row--filled' : ''}${selectable ? ' scorecard__row--pick' : ''}`}
                disabled={!selectable}
                onClick={() => setGame(scoreCategoryAction(game, category))}
              >
                <span className="scorecard__name">
                  {t(CAT_LABEL[category])}
                </span>
                <span className="scorecard__value">{value ?? '—'}</span>
              </button>
              {isUpperLast && (
                <div className="scorecard__subtotal">
                  <span>{t('yahtzee.upperTotal')}</span>
                  <span>
                    {upperSum(player)}{' '}
                    {upperBonus(player) > 0 ? `+${upperBonus(player)}` : ''}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="scoreboard">
        {game.players.map((p, i) => (
          <div
            key={i}
            className={`scoreboard__item${i === game.current ? ' scoreboard__item--active' : ''}`}
          >
            <span className="scoreboard__name">{p.name}</span>
            <span className="scoreboard__score">{totalScore(p)}</span>
          </div>
        ))}
      </div>
    </GameShell>
  );
}

function GameResults({
  game,
  onNewGame,
}: {
  game: YahtzeeState;
  onNewGame: () => void;
}) {
  const { t } = useI18n();
  const winnerIdx = leaders(game);
  const ranked = game.players
    .map((p, i) => ({ p, i, total: totalScore(p) }))
    .sort((a, b) => b.total - a.total);

  const headline =
    winnerIdx.length > 1
      ? t('game.tie')
      : t('game.winner', { name: game.players[winnerIdx[0]!]!.name });

  return (
    <div className="results">
      <h2 className="results__title">{t('game.gameOver')}</h2>
      <p className="results__headline">🏆 {headline}</p>
      <ol className="results__list">
        {ranked.map(({ p, total }, rank) => (
          <li key={rank} className="results__row">
            <span>
              {rank + 1}. {p.name}
            </span>
            <span className="results__score">{total}</span>
          </li>
        ))}
      </ol>
      <button type="button" className="primary-btn" onClick={onNewGame}>
        {t('common.newGame')}
      </button>
    </div>
  );
}
