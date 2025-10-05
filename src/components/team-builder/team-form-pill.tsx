import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EvolutionRequirementsPreview } from "@/components/digimon/EvolutionOptionCard";
import { Button } from "@/components/ui/button";
import { useDigimonDetails } from "@/hooks/use-digimon-details";
import { resolveAttributeIcon } from "@/lib/digimon";
import { cn } from "@/lib/utils";

type TeamFormPillProps = {
	slug: string;
	isBase: boolean;
	isActive: boolean;
	onSelect: () => void;
	onRemove: () => void;
};

export function TeamFormPill({
	slug,
	isBase,
	isActive,
	onSelect,
	onRemove,
}: TeamFormPillProps) {
	const details = useDigimonDetails(slug);
	const attributeIcon = resolveAttributeIcon(details.attribute);
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [overlayRect, setOverlayRect] = useState<DOMRect | null>(null);
	const [toTop, setToTop] = useState(false);

	useEffect(() => {
		if (!open) {
			setOverlayRect(null);
			return;
		}

		const updatePosition = () => {
			if (!containerRef.current) return;
			const rect = containerRef.current.getBoundingClientRect();
			setOverlayRect(rect);
			const viewportHeight = window.innerHeight;
			setToTop(rect.bottom + 220 > viewportHeight);
		};

		updatePosition();
		window.addEventListener("resize", updatePosition);
		window.addEventListener("scroll", updatePosition, true);

		return () => {
			window.removeEventListener("resize", updatePosition);
			window.removeEventListener("scroll", updatePosition, true);
		};
	}, [open]);

	return (
		<div
			ref={containerRef}
			className="group relative"
			onMouseEnter={() => setOpen(true)}
			onMouseLeave={() => setOpen(false)}
			onFocus={() => setOpen(true)}
			onBlur={() => setOpen(false)}
		>
				<div
					className={cn(
						"flex items-center gap-2 rounded-full border border-border/50 bg-background/60 px-3 py-1.5 shadow-sm transition",
						isActive
							? "border-primary/70 bg-primary/15 shadow-md"
							: "hover:border-primary/60 hover:bg-primary/10",
					)}
				>
					<button
						type="button"
						onClick={(event) => {
							if (event.metaKey || event.ctrlKey) {
								event.preventDefault();
								event.stopPropagation();
								const targetUrl = `${window.location.origin}/digimon/${slug}`;
								window.open(targetUrl, "_blank", "noopener,noreferrer");
								return;
							}
							onSelect();
						}}
						className="flex items-center gap-2"
					>
						{details.icon ? (
							<img
							src={details.icon}
							alt=""
							className="size-10 rounded-full border border-border/50 bg-card/80 object-contain p-1"
						/>
					) : (
						<span className="flex size-9 items-center justify-center rounded-full border border-border/50 bg-card/60 text-sm font-semibold text-muted-foreground">
							{(details.name ?? slug).charAt(0)}
						</span>
					)}
					<span className="flex flex-col items-start text-left">
						<span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
							{details.name ?? slug}
						</span>
						<span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
							{attributeIcon ? (
								<img src={attributeIcon} alt="" className="h-5 w-5" />
							) : null}
							{details.generation ?? "—"}
						</span>
					</span>
				</button>
					{!isBase ? (
						<Button
							type="button"
							variant="ghost"
						size="icon"
						onClick={onRemove}
						className="size-6 text-muted-foreground hover:text-destructive"
						aria-label="Remove stage"
					>
						<X className="size-3" />
					</Button>
				) : null}
			</div>

			{open && overlayRect && typeof document !== "undefined"
				? createPortal(
						<div
							className="z-[120] rounded-2xl border border-border/60 bg-background/95 p-4 text-sm shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/80"
							style={{
								position: "fixed",
								top: toTop ? undefined : overlayRect.bottom + 12,
								bottom: toTop
									? window.innerHeight - overlayRect.top + 12
									: undefined,
								left: overlayRect.left,
								width: overlayRect.width,
							}}
							onMouseEnter={() => setOpen(true)}
							onMouseLeave={() => setOpen(false)}
						>
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
								Evolution requirements
							</p>
							{details.evolutionConditions.length ? (
								<EvolutionRequirementsPreview
									rows={details.evolutionConditions}
								/>
							) : (
								<p className="mt-2 text-xs text-muted-foreground">
									No requirements listed.
								</p>
							)}
						</div>,
						document.body,
					)
				: null}
		</div>
	);
}
