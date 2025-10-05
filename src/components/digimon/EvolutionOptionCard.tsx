import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { resolveAttributeIcon } from "@/lib/digimon";
import {
	type DigimonEvolutionEntry,
	fetchDigimonDetails,
} from "@/lib/grindosaur";
import { cn } from "@/lib/utils";

export type EvolutionDirection = "forward" | "back";

type EvolutionOptionCardProps = {
	entry: DigimonEvolutionEntry;
	direction?: EvolutionDirection;
	onSelect?: (slug: string | null, entry: DigimonEvolutionEntry) => void;
	className?: string;
	badgeLabel?: string;
	previewTitle?: string;
	disabled?: boolean;
};

/**
 * Shared evolution option card with hover preview for requirements.
 */
export function EvolutionOptionCard({
	entry,
	direction = "forward",
	onSelect,
	className,
	badgeLabel,
	previewTitle = "Evolution Requirements",
	disabled = false,
}: EvolutionOptionCardProps) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [preview, setPreview] = useState<Awaited<
		ReturnType<typeof fetchDigimonDetails>
	> | null>(null);

	const attributeLabel = entry.attribute ?? preview?.attribute ?? null;
	const generationLabel = entry.generation ?? preview?.generation ?? null;
	const attributeIcon = useMemo(
		() => resolveAttributeIcon(attributeLabel),
		[attributeLabel],
	);

	useEffect(() => {
		let active = true;
		if (!open || preview || !entry.slug) return;

		setLoading(true);
		setError(null);
		fetchDigimonDetails(entry.slug)
			.then((data) => {
				if (active) {
					setPreview(data);
				}
			})
			.catch((cause) => {
				if (active) {
					setError(
						cause instanceof Error ? cause.message : "Failed to load evolution",
					);
				}
			})
			.finally(() => {
				if (active) {
					setLoading(false);
				}
			});

		return () => {
			active = false;
		};
	}, [entry.slug, open, preview]);

	const handleSelect = () => {
		if (disabled) return;
		onSelect?.(entry.slug ?? null, entry);
	};

	return (
		<div
			className="group relative"
			onMouseEnter={() => setOpen(true)}
			onMouseLeave={() => setOpen(false)}
			onFocus={() => setOpen(true)}
			onBlur={() => setOpen(false)}
		>
			<button
				type="button"
				onClick={handleSelect}
				disabled={disabled}
				className={cn(
					"relative flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
					disabled
						? "cursor-not-allowed opacity-60"
						: "cursor-pointer hover:-translate-y-1 hover:border-primary/80 hover:bg-primary/10 hover:shadow-lg",
					className,
				)}
			>
				{entry.icon ? (
					<img
						src={entry.icon}
						alt=""
						className="size-12 rounded-full border border-border/60 bg-card/80 object-contain p-2"
						loading="lazy"
					/>
				) : (
					<div className="flex size-12 items-center justify-center rounded-full border border-border/60 bg-card/60 text-lg font-semibold text-muted-foreground">
						{entry.name.charAt(0)}
					</div>
				)}
				<div className="flex min-w-0 flex-col">
					<span className="truncate text-base font-semibold text-foreground">
						{entry.name}
					</span>
					<span className="flex items-center gap-2 text-xs text-muted-foreground">
						{attributeLabel ? (
							<span className="inline-flex items-center gap-1">
								{attributeIcon ? (
									<img
										src={attributeIcon}
										alt=""
										className="h-4 w-4"
										loading="lazy"
									/>
								) : null}
								<span>{attributeLabel}</span>
							</span>
						) : null}
						{attributeLabel && generationLabel ? (
							<span className="text-muted-foreground/40">•</span>
						) : null}
						{generationLabel ? <span>{generationLabel}</span> : null}
						{!attributeLabel && !generationLabel ? (
							<span>{entry.type ?? "Tap to inspect"}</span>
						) : null}
					</span>
				</div>
				<span className="ml-auto text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
					{badgeLabel ?? (direction === "forward" ? "Next" : "Prev")}
				</span>
			</button>

			{open ? (
				<div className="absolute bottom-[calc(100%+0.75rem)] left-0 right-0 z-30 rounded-2xl border border-border/60 bg-background/95 p-4 text-sm shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/80">
					<p className="font-semibold text-foreground">{previewTitle}</p>
					{loading ? (
						<div className="mt-3 flex items-center gap-2 text-muted-foreground">
							<Loader2 className="size-4 animate-spin" />
							Loading…
						</div>
					) : error ? (
						<p className="mt-2 text-xs text-destructive">{error}</p>
					) : preview ? (
						<EvolutionRequirementsPreview rows={preview.evolutionConditions} />
					) : (
						<p className="mt-2 text-xs text-muted-foreground">
							Hover to preview conditions.
						</p>
					)}
				</div>
			) : null}
		</div>
	);
}

type EvolutionRequirementsPreviewProps = {
	rows: Record<string, string>[];
};

export function EvolutionRequirementsPreview({
	rows,
}: EvolutionRequirementsPreviewProps) {
	if (!rows.length) {
		return (
			<p className="mt-2 text-xs text-muted-foreground">
				No requirements listed.
			</p>
		);
	}

	const firstRow = rows[0];
	const entries = Object.entries(firstRow).filter(([, value]) => value);

	return (
		<ul className="mt-3 space-y-2 text-xs text-muted-foreground">
			{entries.map(([key, value]) => (
				<li key={key} className="flex items-start gap-2">
					<span className="mt-0.5 size-1.5 rounded-full bg-primary" />
					<span>
						<span className="font-semibold text-foreground">{key}: </span>
						{value}
					</span>
				</li>
			))}
		</ul>
	);
}
