import { useEffect, useState } from 'react';
import { GameShell } from './GameShell';
import { PlayerSetup } from './PlayerSetup';
import { GameDice } from './GameDice';
import { useI18n } from '../../../i18n/useI18n';
import type { MessageKey } from '../../../i18n/messages';
import { defaultRng } from '../../../dice/random';
import { appUrl } from '../../../links';
import { shareOrCopy } from '../../../share';
import { useSound } from '../../hooks/useSound';
import { useUndoableGame } from '../../hooks/useUndoableGame';
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
  yahtzeeBonusPoints,
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

const isOver = (s: YahtzeeState): boolean => s.phase === 'over';

export function YahtzeeGame() {
  const { t } = useI18n();
  const sound = useSound();
  const { game, canUndo, start, apply, undo, quit } =
    useUndoableGame<YahtzeeState>('yahtzee', isOver);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (game?.phase === 'over') sound('win');
  }, [game?.phase, sound]);

  if (!game) {
    return (
      <GameShell title={t('modes.yahtzee')}>
        <PlayerSetup onStart={names => start(createYahtzee(names))} />
      </GameShell>
    );
  }

  const names = game.players.map(p => p.name);
  const newGame = () => quit();
  const replay = () => start(createYahtzee(names));

  if (game.phase === 'over') {
    const winnerIdx = leaders(game);
    const ranked = game.players
      .map(p => ({ name: p.name, total: totalScore(p) }))
      .sort((a, b) => b.total - a.total);
    const headline =
      winnerIdx.length > 1
        ? t('game.tie')
        : t('game.winner', { name: game.players[winnerIdx[0]!]!.name });

    const onShare = async () => {
      const summary = ranked.map(r => `${r.name} ${r.total}`).join(', ');
      const res = await shareOrCopy({
        title: 'Miss Dice',
        text: `${t('modes.yahtzee')} — ${summary}`,
        url: appUrl(),
      });
      if (res === 'copied') {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      }
    };

    return (
      <GameShell title={t('modes.yahtzee')} onNewGame={newGame}>
        <div className="results">
          <h2 className="results__title">{t('game.gameOver')}</h2>
          <p className="results__headline">🏆 {headline}</p>
          <ol className="results__list">
            {ranked.map((r, rank) => (
              <li key={rank} className="results__row">
                <span>
                  {rank + 1}. {r.name}
                </span>
                <span className="results__score">{r.total}</span>
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
  const canStopEarly = game.rolledThisTurn && game.rollsLeft > 0;
  const bonusPts = yahtzeeBonusPoints(player);

  const footer = (
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
  );

  return (
    <GameShell
      title={t('modes.yahtzee')}
      onNewGame={newGame}
      onUndo={undo}
      canUndo={canUndo}
      footer={footer}
    >
      <p className="game-turn">{t('game.turnOf', { name: player.name })}</p>

      <GameDice
        values={game.dice}
        held={game.held}
        nonce={game.rollNonce}
        canHold={game.rolledThisTurn}
        onToggleHold={i => apply(toggleHold(game, i))}
      />

      <p className="game-status" aria-live="polite">
        {!game.rolledThisTurn ? (
          t('game.tapToRoll')
        ) : canStopEarly ? (
          <>
            <span>
              {game.rollsLeft === 1
                ? t('game.rollsLeftOne')
                : t('game.rollsLeft', { n: game.rollsLeft })}
            </span>
            <span className="game-status__sub">{t('yahtzee.stopHint')}</span>
          </>
        ) : (
          t('yahtzee.pickCategory')
        )}
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
          return (
            <li key={category}>
              <button
                type="button"
                className={`scorecard__row${filled ? ' scorecard__row--filled' : ''}${selectable ? ' scorecard__row--pick' : ''}`}
                disabled={!selectable}
                onClick={() => {
                  sound('result');
                  apply(scoreCategoryAction(game, category));
                }}
              >
                <span className="scorecard__name">
                  {t(CAT_LABEL[category])}
                </span>
                <span className="scorecard__value">{value ?? '—'}</span>
              </button>
              {category === 'sixes' && (
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
        {bonusPts > 0 && (
          <li className="scorecard__subtotal">
            <span>{t('yahtzee.yahtzeeBonus')}</span>
            <span>+{bonusPts}</span>
          </li>
        )}
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
