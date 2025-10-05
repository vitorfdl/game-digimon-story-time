import { Plus, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useDigimonSearch } from "@/hooks/use-digimon-search";
import type { DigimonSummary } from "@/lib/grindosaur";

type AddDigimonButtonProps = {
	list: DigimonSummary[];
	onSelect: (slug: string) => void;
};

export function AddDigimonButton({ list, onSelect }: AddDigimonButtonProps) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const filtered = useDigimonSearch(list, query, { limit: 12 });

	const handleSelect = (slug: string) => {
		onSelect(slug);
		setQuery("");
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="default"
					size="lg"
					className="h-12 rounded-full bg-primary/90 px-6 text-sm font-semibold shadow-[0_10px_40px_-24px_theme(colors.primary/70%)] transition-all hover:-translate-y-1 hover:bg-primary"
				>
					<Plus className="mr-2 size-4" /> Add Digimon
				</Button>
			</PopoverTrigger>
			<PopoverContent
				side="top"
				align="end"
				sideOffset={16}
				className="w-[420px] max-w-sm space-y-4 rounded-3xl border border-border/50 bg-background/95 p-4 shadow-2xl backdrop-blur"
			>
				<div className="relative">
					<Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search by name, #, generation or attribute"
						className="rounded-full border-border/50 bg-muted/40 pl-10"
					/>
				</div>
				<div className="grid max-h-80 gap-2 overflow-y-auto pr-1">
					{filtered.length ? (
						filtered.map((entry) => (
							<button
								key={entry.slug}
								type="button"
								onClick={() => handleSelect(entry.slug)}
								className="flex items-center gap-3 rounded-2xl border border-transparent bg-muted/30 p-3 text-left transition hover:border-primary/80 hover:bg-primary/10"
							>
								{entry.icon ? (
									<img
										src={entry.icon}
										alt=""
										className="size-10 rounded-full border border-border/50 bg-card/80 object-contain"
									/>
								) : (
									<div className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-card/60 text-sm font-semibold text-muted-foreground">
										{entry.name.charAt(0)}
									</div>
								)}
								<div className="flex min-w-0 flex-col">
									<span className="truncate text-sm font-semibold text-foreground">
										{entry.name}
									</span>
									<span className="flex items-center gap-2 text-xs text-muted-foreground">
										{entry.number ? (
											<span className="font-mono text-[11px]">
												#{entry.number}
											</span>
										) : null}
										{entry.generation ? <span>{entry.generation}</span> : null}
										{entry.attribute ? <span>{entry.attribute}</span> : null}
									</span>
								</div>
							</button>
						))
					) : (
						<div className="flex items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/20 p-6 text-sm text-muted-foreground">
							No Digimon found.
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
