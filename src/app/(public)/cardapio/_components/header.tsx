interface HeaderProps {
  onOpenSidebar: () => void;
}

export default function Header({ onOpenSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4">
        <button
          onClick={onOpenSidebar}
          className="text-2xl text-slate-700"
        >
          ☰
        </button>

        <input
          type="text"
          placeholder="Pesquisar"
          className="w-full rounded-md bg-slate-100 px-4 py-3 outline-none"
        />
      </div>
    </header>
  );
}