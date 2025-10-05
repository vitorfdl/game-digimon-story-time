import { Eraser } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { PersonalityCategory } from "@/lib/personalities";
import { cn } from "@/lib/utils";
import type { SelectedSkill } from "@/store/team-builder-atoms";

type PersonalitySkillSelectorProps = {
	value: string | null;
	onPersonalityChange: (value: string | null) => void;
	skill: SelectedSkill | null;
	onSkillChange: (skill: SelectedSkill | null) => void;
	categories: PersonalityCategory[];
};

export function PersonalitySkillSelector({
	value,
	onPersonalityChange,
	skill,
	onSkillChange,
	categories,
}: PersonalitySkillSelectorProps) {
	const [personalityOpen, setPersonalityOpen] = useState(false);
	const [skillOpen, setSkillOpen] = useState(false);

	const selectedCategory = useMemo(() => {
		if (!value) return null;
		return (
			categories.find((category) =>
				category.personalities.some(
					(personality) => personality.name === value,
				),
			) ?? null
		);
	}, [categories, value]);

	const selectedPersonality = useMemo(() => {
		if (!value || !selectedCategory) return null;
		return (
			selectedCategory.personalities.find(
				(personality) => personality.name === value,
			) ?? null
		);
	}, [selectedCategory, value]);

	const availableSkills = useMemo<SelectedSkill[]>(() => {
		if (!selectedCategory) return [];
		const categorySkills = selectedCategory.category_skills.map((entry) => ({
			name: entry.name,
			effect: entry.effect,
			origin: "category" as const,
		}));

		const personalitySkills =
			selectedPersonality?.skills.map((entry) => ({
				name: entry.name,
				effect: entry.effect,
				origin: "personality" as const,
			})) ?? [];

		return [...categorySkills, ...personalitySkills];
	}, [selectedCategory, selectedPersonality]);

	return (
		<div className="flex flex-wrap items-center gap-3">
			<div className="flex items-center gap-2">
				<span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
					Personality
				</span>
				<Popover open={personalityOpen} onOpenChange={setPersonalityOpen}>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-8 rounded-full border-border/50 bg-background/70 px-3 text-xs font-semibold"
						>
							{value ? `${value} / ${selectedCategory?.name}` : "Pick category"}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-64 max-h-60 space-y-3 overflow-y-auto rounded-2xl border border-border/50 bg-background/95 p-3 shadow-xl">
						{categories.map((category) => (
							<section key={category.name} className="space-y-1">
								<div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
									<span>{category.name}</span>
									<Badge
										variant="outline"
										className="rounded-full border-border/60 text-[10px] uppercase tracking-[0.18em]"
									>
										{category.stat}
									</Badge>
								</div>
								<div className="grid gap-1">
									{category.personalities.map((personality) => (
										<button
											key={personality.name}
											type="button"
											onClick={() => {
												onPersonalityChange(personality.name);
												setPersonalityOpen(false);
											}}
											className={cn(
												"rounded-xl border border-border/40 bg-muted/15 px-3 py-2 text-left text-xs transition",
												value === personality.name
													? "border-primary/80 bg-primary/15 text-primary"
													: "hover:border-primary/60 hover:bg-primary/10",
											)}
										>
											<div className="flex items-center justify-between gap-2">
												<span className="font-semibold text-foreground">
													{personality.name}
												</span>
												<span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
													{personality.stat}
												</span>
											</div>
										</button>
									))}
								</div>
							</section>
						))}
					</PopoverContent>
				</Popover>
				{value ? (
					<span className="text-xs text-muted-foreground">
						+{selectedCategory?.stat} +{selectedPersonality?.stat}
					</span>
				) : null}
			</div>

			<div className="h-4 w-px bg-border/50" />

			<div className="flex items-center gap-2">
				<span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
					Skill
				</span>
				<Popover open={skillOpen} onOpenChange={setSkillOpen}>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!value || !availableSkills.length}
							className="h-8 rounded-full border-border/50 bg-background/70 px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
						>
							{skill ? skill.name : value ? "Select" : "Pick personality"}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-72 max-h-60 space-y-2 overflow-y-auto rounded-2xl border border-border/50 bg-background/95 p-3 shadow-xl">
						{availableSkills.map((option) => {
							const active =
								skill?.name === option.name && skill.origin === option.origin;
							return (
								<button
									key={`${option.origin}-${option.name}`}
									type="button"
									onClick={() => {
										onSkillChange(option);
										setSkillOpen(false);
									}}
									className={cn(
										"w-full rounded-xl border border-border/40 bg-muted/15 p-3 text-left text-sm transition",
										active
											? "border-primary/80 bg-primary/15"
											: "hover:border-primary/60 hover:bg-primary/10",
									)}
								>
									<p className="font-semibold text-foreground">{option.name}</p>
									<p className="text-xs text-muted-foreground">
										{option.effect}
									</p>
								</button>
							);
						})}
					</PopoverContent>
				</Popover>
				{skill ? (
					<span className="text-xs text-muted-foreground">{skill.effect}</span>
				) : null}
			</div>
		</div>
	);
}
