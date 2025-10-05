import { useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { useLocation, useMatch, useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { digimonListAtom } from "@/store/atoms";
import { cn } from "@/lib/utils";
import { useDigimonSearch } from "@/hooks/use-digimon-search";

type HighlightDirection = "up" | "down";

export default function NavbarSearch() {
	const list = useAtomValue(digimonListAtom);
	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const navigate = useNavigate();
	const location = useLocation();
	const match = useMatch("/digimon/:slug");
	const activeSlug =
		match?.params.slug ??
		(location.pathname === "/" ? (list[0]?.slug ?? null) : null);

	const filtered = useDigimonSearch(list, query, { limit: 8 });

	useEffect(() => {
		setActiveIndex(0);
	}, [query]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const highlight = (direction: HighlightDirection) => {
		setActiveIndex((current) => {
			if (!filtered.length) return 0;
			if (direction === "down") {
				return current + 1 < filtered.length ? current + 1 : 0;
			}
			return current - 1 >= 0 ? current - 1 : filtered.length - 1;
		});
	};

	const commitSelection = (slug: string | null) => {
		if (!slug) return;
		navigate(`/digimon/${slug}`);
		setQuery("");
		setOpen(false);
		setActiveIndex(0);
		inputRef.current?.blur();
	};

	const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
		event,
	) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			highlight("down");
			setOpen(true);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			highlight("up");
			setOpen(true);
		} else if (event.key === "Enter") {
			event.preventDefault();
			const slug = filtered[activeIndex]?.slug ?? filtered[0]?.slug ?? null;
			commitSelection(slug);
		} else if (event.key === "Escape") {
			setOpen(false);
			inputRef.current?.blur();
		}
	};

	const loading = !list.length;

	useEffect(() => {
		if (!open) return;
		if (!filtered.length) {
			setActiveIndex(0);
			return;
		}
		if (!activeSlug) {
			setActiveIndex(0);
			return;
		}
		const matchIndex = filtered.findIndex((entry) => entry.slug === activeSlug);
		setActiveIndex(matchIndex >= 0 ? matchIndex : 0);
	}, [activeSlug, filtered, open]);

	return (
		<div ref={containerRef} className="relative w-full max-w-xl">
			<div className="relative h-11 rounded-full border border-border/60 bg-card/70 shadow-[0_1px_20px_-12px_theme(colors.blue.500/40%)] backdrop-blur-md transition focus-within:border-primary focus-within:shadow-[0_1px_24px_-10px_theme(colors.primary/60%)]">
				<Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					ref={inputRef}
					placeholder="Search a Digimon by name, # or attribute"
					role="combobox"
					aria-expanded={open}
					value={query}
					onFocus={() => setOpen(true)}
					onChange={(event) => {
						setQuery(event.target.value);
						setOpen(true);
					}}
					onKeyDown={handleKeyDown}
					className="border-none bg-transparent pl-10 pr-4 text-sm font-medium focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0"
				/>
				{loading ? (
					<Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
				) : null}
			</div>
			{open ? (
				<div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-50 overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/80">
					{filtered.length ? (
						<ul className="grid gap-1 p-2">
							{filtered.map((entry, index) => {
								const isActive =
									activeIndex === index || entry.slug === activeSlug;

								return (
									<li key={entry.slug}>
										<button
											type="button"
											data-active={isActive}
											onMouseDown={(event) => event.preventDefault()}
											onClick={() => commitSelection(entry.slug)}
											onMouseEnter={() => setActiveIndex(index)}
											className={cn(
												"group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm  cursor-pointer",
												isActive
													? "bg-primary text-slate-900 shadow-sm"
													: "hover:bg-primary/15 hover:text-primary",
											)}
										>
											{entry.icon ? (
												<img
													src={entry.icon}
													alt=""
													className="size-8 rounded-full border border-border/50 object-contain"
													loading="lazy"
												/>
											) : (
												<div className="flex size-8 items-center justify-center rounded-full border border-border/60 bg-muted text-muted-foreground group-hover:text-primary group-data-[active=true]:text-slate-900">
													{entry.name.charAt(0)}
												</div>
											)}
											<div className="flex min-w-0 flex-col">
												<span className="truncate font-semibold group-hover:text-primary group-data-[active=true]:text-slate-900">
													{entry.name}
												</span>
												<span className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary/80 group-data-[active=true]:text-slate-900/80">
													{entry.number ? (
														<span className="font-mono text-[11px]">
															#{entry.number}
														</span>
													) : null}
													{entry.generation ? (
														<span>{entry.generation}</span>
													) : null}
													{entry.attribute ? (
														<span>{entry.attribute}</span>
													) : null}
												</span>
											</div>
										</button>
									</li>
								);
							})}
						</ul>
					) : (
						<div className="flex items-center justify-center px-6 py-7 text-sm text-muted-foreground">
							No Digimon found.
						</div>
					)}
				</div>
			) : null}
		</div>
	);
}
