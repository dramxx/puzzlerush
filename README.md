# Puzzle Rush · Survival

Chess puzzle survival mode in the style of chess.com Puzzle Rush: no clock, three strikes, and puzzles that get harder as you go.

**Play:** https://puzzlerush-pearl.vercel.app

- Puzzles start around 400 ELO and climb about 45 points per puzzle; each puzzle's rating is shown.
- A wrong move costs a life and shows the solution. Missed puzzles can be retried (unranked, with hints) in a new tab.
- High score is kept in your browser (localStorage).

## Development

```bash
npm install
npm run dev
```

Built with Next.js, [chess.js](https://github.com/jhlywa/chess.js) and [react-chessboard](https://github.com/Clariity/react-chessboard).

## Puzzle data

`public/puzzles.json` holds ~5,000 puzzles from the [Lichess puzzle database](https://database.lichess.org/#puzzles) (CC0), sampled across 400–3000 rating. To regenerate it:

```bash
node scripts/build-puzzles.mjs
```
