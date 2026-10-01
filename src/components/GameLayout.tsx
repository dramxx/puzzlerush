// Board takes 80% of the viewport height (or the full width on narrow portrait screens),
// with the panel below it in portrait and beside it in landscape.
// In landscape the panel matches the squares only, excluding the 1.25rem coordinate row.
export function GameLayout({ board, panel }: { board: React.ReactNode; panel: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center p-2">
      <div className="flex flex-col items-center gap-3 landscape:flex-row landscape:items-start">
        <section className="w-[min(100vw_-_1rem,80dvh)] landscape:w-[min(80dvh,100vw_-_19rem)] shrink-0">
          {board}
        </section>
        <aside className="flex w-full max-w-[min(100vw_-_1rem,80dvh)] flex-col gap-4 rounded-lg bg-[#262421] p-4 landscape:w-72 landscape:h-[calc(min(80dvh,100vw_-_19rem)_-_1.25rem)] landscape:overflow-y-auto">
          {panel}
        </aside>
      </div>
    </main>
  );
}
