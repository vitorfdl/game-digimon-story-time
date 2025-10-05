import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAtom } from "jotai";
import { ShieldCheck, Sparkles, ChevronsRight, GripVertical, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { EvolutionOptionCard } from "@/components/digimon/EvolutionOptionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useDigimonDetails } from "@/hooks/use-digimon-details";
import {
	getPersonalities,
	type PersonalityCategory,
} from "@/lib/personalities";
import { cn } from "@/lib/utils";
import {
	activeTeamSlotIdAtom,
	type SelectedSkill,
	type TeamSlot,
} from "@/store/team-builder-atoms";

import { PersonalitySkillSelector } from "./personality-selector";
import { TeamFormPill } from "./team-form-pill";

type TeamSlotCardProps = {
	slot: TeamSlot;
	onUpdate: (next: TeamSlot) => void;
	onRemove: () => void;
	sectionLabel?: "Combat" | "Reserve";
};

export function TeamSlotCard({
	slot,
	onUpdate,
	onRemove,
	sectionLabel,
}: TeamSlotCardProps) {
	const [activeCardId, setActiveCardId] = useAtom(activeTeamSlotIdAtom);
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const categories = useMemo<PersonalityCategory[]>(
		() => getPersonalities().categories,
		[],
	);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: slot.id });

	const style: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	useEffect(() => {
		setFocusedIndex((current) => Math.min(current, slot.forms.length - 1));
	}, [slot.forms.length]);

	const fallbackIndex = Math.max(slot.forms.length - 1, 0);
	const activeIndex = focusedIndex >= 0 ? focusedIndex : fallbackIndex;
	const activeSlug = slot.forms[activeIndex];

	const activeDetails = useDigimonDetails(activeSlug);

	const handleSelectEvolution = (slug: string | null) => {
		if (!slug) return;

		const anchorIndex =
			focusedIndex >= 0 ? focusedIndex : slot.forms.length - 1;
		const nextForms = [...slot.forms.slice(0, anchorIndex + 1), slug];

		onUpdate({ ...slot, forms: nextForms });
		setFocusedIndex(nextForms.length - 1);
	};

	const handleFocusStage = (index: number) => {
		setActiveCardId(slot.id);
		setFocusedIndex((current) => (current === index ? -1 : index));
	};

	const handleRemoveStage = (index: number) => {
		if (index <= 0) return;
		const nextForms = slot.forms.slice(0, index);
		onUpdate({ ...slot, forms: nextForms });
		setFocusedIndex((current) => {
			if (current === -1) return -1;
			return Math.min(current, nextForms.length - 1);
		});
	};

	const forwardEntries =
		focusedIndex >= 0 ? (activeDetails.evolvesTo ?? []) : [];

	const handlePersonalityChange = (next: string | null) => {
		if (next === slot.personality) {
			return;
		}
		onUpdate({ ...slot, personality: next, skill: null });
	};

	const handleSkillChange = (next: SelectedSkill | null) => {
		onUpdate({ ...slot, skill: next });
	};

	return (
		<>
			<Card
				ref={setNodeRef}
				style={style}
				className={cn(
		"relative overflow-hidden border border-border/50 bg-card/70 backdrop-blur transition-shadow",
		isDragging
			? "shadow-2xl"
			: "shadow-[0_32px_80px_-70px_theme(colors.primary/80%)]",
		sectionLabel
			? "before:absolute before:inset-0 before:-z-10 before:content-['']"
			: "",
		sectionLabel === "Combat"
			? "border-primary/50 before:bg-[linear-gradient(135deg,rgba(120,80,250,0.18),transparent_60%)]"
			: "",
		sectionLabel === "Reserve"
			? "border-sky-400/40 before:bg-[linear-gradient(135deg,rgba(56,189,248,0.16),transparent_55%)]"
			: "",
	)}
	onClick={() => setActiveCardId(slot.id)}
>
		<CardContent className="flex flex-col gap-2">
			{sectionLabel ? (
				<div className="flex items-center justify-between">
					<Badge
						variant="secondary"
						className={cn(
							"flex items-center gap-2 rounded-2xl px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em]",
							sectionLabel === "Combat"
								? "bg-primary/15 text-primary"
								: "bg-sky-500/10 text-sky-500",
						)}
					>
						{sectionLabel === "Combat" ? (
							<ShieldCheck className="size-3.5" />
						) : (
							<Sparkles className="size-3.5" />
						)}
						{sectionLabel}
					</Badge>
				</div>
			) : null}

			<div className="flex flex-wrap items-start gap-3">
				<button
							type="button"
							className="flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/90 text-muted-foreground transition hover:border-primary/60 hover:text-primary"
							{...attributes}
							{...listeners}
						>
							<GripVertical className="size-4" />
						</button>

						<div className="flex min-w-0 flex-1 items-center justify-between gap-3">
							<div className="flex items-center rounded-2xl border border-border/40 bg-muted/20 px-3 py-1">
								<PersonalitySkillSelector
									value={slot.personality}
									onPersonalityChange={handlePersonalityChange}
									skill={slot.skill ?? null}
									onSkillChange={handleSkillChange}
									categories={categories}
								/>
							</div>

							<Button
								variant="destructive"
								size="icon"
								onClick={() => setConfirmOpen(true)}
								aria-label="Remove Digimon"
								className="shrink-0"
							>
								<Trash2 className="size-4" />
							</Button>
						</div>
					</div>

					<div className="flex flex-wrap items-center justify-start gap-1 overflow-x-auto">
						{slot.forms.map((slug, index) => (
							<>
								<TeamFormPill
									key={`${slot.id}-${slug}-${index}`}
									slug={slug}
									isActive={focusedIndex === index && activeCardId === slot.id}
									isBase={index === 0}
									onSelect={() => handleFocusStage(index)}
									onRemove={() => handleRemoveStage(index)}
								/>
								{index < slot.forms.length - 1 && (
									<ChevronsRight
										key={`arrow-${slot.id}-${index}`}
										className="mx-1 size-5 text-muted-foreground"
										aria-hidden="true"
									/>
								)}
							</>
						))}
					</div>

					{forwardEntries.length ? (
						<div className="grid gap-3 rounded-2xl border border-border/40 bg-muted/10 p-4">
							<header className="space-y-1">
								<p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
									Evolution Options
								</p>
								<p className="text-xs text-muted-foreground/80">
									{activeDetails.name ?? activeSlug}
								</p>
							</header>
							<div className="grid gap-3 md:grid-cols-2">
								{forwardEntries.map((entry) => (
									<EvolutionOptionCard
										key={`${slot.id}-${entry.slug ?? entry.name}`}
										entry={entry}
										onSelect={(slug) => handleSelectEvolution(slug)}
										badgeLabel="Add"
										disabled={!entry.slug}
									/>
								))}
							</div>
						</div>
					) : null}
				</CardContent>
			</Card>
			<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<DialogContent
					className="max-w-sm rounded-3xl border border-border/60 bg-background/95 p-6 shadow-2xl backdrop-blur"
					showCloseButton={false}
				>
					<DialogHeader>
						<DialogTitle className="text-lg font-semibold text-foreground">
							Remove Digimon?
						</DialogTitle>
						<DialogDescription className="text-sm text-muted-foreground">
							This removes the entire evolution path from your team. You can add
							it back whenever you like.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex items-center justify-end gap-2">
						<Button variant="outline" onClick={() => setConfirmOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								onRemove();
								setConfirmOpen(false);
							}}
						>
							Remove
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
