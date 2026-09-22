import baseConfig from '@mister-guiiug/dev-pwa-config/eslint-react';

export default [
  {
    ignores: [
      'dist/**',
      'dev-dist/**',
      'coverage/**',
      'e2e/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      /*
       * `label-has-associated-control` ne cherche le texte du libellé que sur
       * DEUX niveaux de JSX. Les interrupteurs de l'app en ont trois, et pas
       * par accident : la mise en page veut le bloc de texte à gauche et
       * l'interrupteur à droite, donc les deux `<span>` (libellé + explication)
       * vivent dans un `<span>` qui les groupe.
       *
       *     <label>            ← 1
       *       <span>           ← 2   le groupe, pour la mise en page
       *         <span>texte    ← 3   que la règle ne voit pas
       *       <input type="checkbox">
       *
       * Le libellé ENVELOPPE son champ : le nom accessible est bien calculé -
       * vérifié dans le navigateur, `input.labels[0]` rend « Règle du décideur
       * … ». La règle ne le voit pas ; elle ne dit donc rien de vrai ici.
       *
       * On remonte la profondeur d'un cran plutôt que de recopier sept
       * `eslint-disable`, et la règle garde sa force : un `<label>` réellement
       * sans texte serait toujours signalé.
       */
      'jsx-a11y/label-has-associated-control': ['warn', { depth: 3 }],
    },
  },
];
