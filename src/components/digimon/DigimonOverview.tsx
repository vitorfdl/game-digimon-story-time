import { useEffect, useMemo } from "react";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";

import { digimonListAtom, digimonDetailsAtomFamily } from "@/store/atoms";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
	fetchDigimonDetails,
	type DigimonEvolutionEntry,
	type DigimonSummary,
} from "@/lib/grindosaur";
import { resolveAttributeIcon } from "@/lib/digimon";
import {
	EvolutionOptionCard,
	type EvolutionDirection,
} from "@/components/digimon/EvolutionOptionCard";

const BASE_DOCUMENT_TITLE = "Digimon Time Stranger";

type DigimonOverviewProps = {
	slug: string | null;
};

export default function DigimonOverview({ slug }: DigimonOverviewProps) {
	const list = useAtomValue(digimonListAtom);
	const navigate = useNavigate();

	const detailsAtom = useMemo(
		() => (slug ? digimonDetailsAtomFamily(slug) : null),
		[slug],
	);
	const details = detailsAtom ? useAtomValue(detailsAtom) : null;

	useEffect(() => {
		if (!slug) {
			document.title = BASE_DOCUMENT_TITLE;
			return;
		}

		if (details?.name) {
			document.title = `${details.name} | Digimon`;
		} else {
			document.title = BASE_DOCUMENT_TITLE;
		}

		return () => {
			document.title = BASE_DOCUMENT_TITLE;
		};
	}, [details?.name, slug]);

	if (!slug) {
		return (
			<div className="grid gap-6">
				<HeroSkeleton />
				<Card className="border-dashed border-muted-foreground/20 bg-muted/20">
					<CardContent className="p-8 text-center text-sm text-muted-foreground">
						Loading Digimon roster…
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!details) {
		return <HeroSkeleton />;
	}

	const summary = list.find((entry) => entry.slug === details.slug) ?? null;
	const infoEntries = buildInfoEntries(details, summary);

	const showConditions =
		details.generation?.toLowerCase() !== "in-training i" &&
		details.evolutionConditions.length > 0;

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-2 pb-6">
			<Card className="border border-border/60 bg-gradient-to-br from-card/90 via-card/80 to-muted/50 shadow-[0_50px_120px_-70px_theme(colors.sky.500/80%)] backdrop-blur-xl">
				<CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:gap-8">
					<div className="flex flex-col items-center gap-4 text-center lg:min-w-[220px] lg:text-left">
						{details.icon ? (
							<div className="relative">
								<div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
								<img
									src={details.icon}
									alt={details.name ?? "Digimon"}
									className="relative size-52 rounded-full border border-border/60 bg-muted/40 object-contain p-3 shadow-lg"
								/>
							</div>
						) : (
							<div className="flex size-32 items-center justify-center rounded-full border border-border/60 bg-muted/50 text-4xl font-bold text-muted-foreground">
								{(details.name ?? "?").charAt(0)}
							</div>
						)}
						<div>
							<h2 className="text-balance text-3xl font-black tracking-tight text-foreground drop-shadow-sm">
								{details.name ?? summary?.name ?? "Unknown Digimon"}
							</h2>
							{summary?.number ? (
								<p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground/80">
									#{summary.number}
								</p>
							) : null}
						</div>
					</div>
					<div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
						{infoEntries.map((entry) => (
							<InfoTile
								key={entry.label}
								label={entry.label}
								value={entry.value}
								subtle={entry.subtle}
							/>
						))}
					</div>
				</CardContent>
			</Card>

			{showConditions ? (
				<Card className="border border-border/50 bg-card/80 backdrop-blur">
					<CardContent className="p-4 sm:p-6">
						<header className="mb-4 flex items-center gap-3">
							<Flame className="size-5 text-primary" />
							<div>
								<h3 className="text-lg font-semibold">Evolution Conditions</h3>
								<p className="text-sm text-muted-foreground">
									Requirements to reach the current form.
								</p>
							</div>
						</header>
						<ConditionsTable rows={details.evolutionConditions} />
					</CardContent>
				</Card>
			) : null}

			<EvolutionPanel
				forward={details.evolvesTo}
				backward={details.evolvesFrom}
				onSelect={(nextSlug) => {
					if (nextSlug) {
						navigate(`/digimon/${nextSlug}`);
					}
				}}
			/>
		</div>
	);
}

type InfoEntry = {
	label: string;
	value: string;
	subtle?: boolean;
	icon?: string | null;
};

function buildInfoEntries(
	details: Awaited<ReturnType<typeof fetchDigimonDetails>>,
	summary: DigimonSummary | null,
): InfoEntry[] {
	const entries: InfoEntry[] = [];

	if (details.type) {
		entries.push({ label: "Type", value: details.type });
	}
	if (details.attribute) {
		entries.push({
			label: "Attribute",
			value: details.attribute,
			icon: resolveAttributeIcon(details.attribute),
		});
	}
	if (details.generation) {
		entries.push({ label: "Generation", value: details.generation });
	}
	if (details.basePersonality) {
		entries.push({ label: "Base Personality", value: details.basePersonality });
	}
	if (details.ridable) {
		entries.push({
			label: "Ridable",
			value: details.ridable,
			subtle: details.ridable !== "Yes",
		});
	}
	if (summary?.type && !entries.some((item) => item.label === "Type")) {
		entries.push({ label: "Type", value: summary.type });
	}
	if (
		summary?.attribute &&
		!entries.some((item) => item.label === "Attribute")
	) {
		entries.push({
			label: "Attribute",
			value: summary.attribute,
			icon: resolveAttributeIcon(summary.attribute),
		});
	}

	if (!entries.length) {
		entries.push({
			label: "Status",
			value: "Information unavailable",
			subtle: true,
		});
	}

	return entries.slice(0, 6);
}

function InfoTile({ label, value, subtle = false, icon }: InfoEntry) {
	return (
		<div
			className={cn(
				"rounded-2xl border border-border/40 p-4",
				subtle ? "bg-muted/40" : "bg-muted/20",
			)}
		>
			<span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
				{label}
			</span>
			<p className="mt-2 flex items-center gap-2 text-lg font-semibold leading-tight text-foreground">
				{icon ? (
					<img src={icon} alt="" className="h-5 w-5" loading="lazy" />
				) : null}
				<span>{value}</span>
			</p>
		</div>
	);
}

type ConditionsTableProps = {
	rows: Record<string, string>[];
};

function ConditionsTable({ rows }: ConditionsTableProps) {
	const headers = useMemo(() => {
		const set = new Set<string>();
		rows.forEach((row) => {
			Object.keys(row).forEach((key) => {
				if (row[key]) {
					set.add(key);
				}
			});
		});
		return Array.from(set);
	}, [rows]);

	if (!headers.length) {
		return (
			<p className="text-sm text-muted-foreground">
				No evolution conditions provided.
			</p>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					{headers.map((header) => (
						<TableHead
							key={header}
							className="text-xs uppercase tracking-[0.28em] text-muted-foreground"
						>
							{header}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{rows.slice(0, 3).map((row, index) => (
					<TableRow key={index}>
						{headers.map((header) => (
							<TableCell key={`${header}-${index}`} className="text-sm">
								{row[header] ?? "—"}
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

type EvolutionPanelProps = {
	forward: DigimonEvolutionEntry[];
	backward: DigimonEvolutionEntry[];
	onSelect: (slug: string | null) => void;
};

function EvolutionPanel({ forward, backward, onSelect }: EvolutionPanelProps) {
	if (!forward.length && !backward.length) {
		return null;
	}

	return (
		<Card className="border border-border/50 bg-card/80 backdrop-blur">
			<CardContent className="flex flex-col gap-6 p-6">
				<EvolutionGroup
					direction="back"
					title="Previous Evolutions"
					description="Forms that lead into the current Digimon."
					entries={backward}
					onSelect={onSelect}
				/>
				<EvolutionGroup
					direction="forward"
					title="Next Evolutions"
					description="Potential evolutions branching from here."
					entries={forward}
					onSelect={onSelect}
				/>
			</CardContent>
		</Card>
	);
}

type EvolutionGroupProps = {
	title: string;
	description: string;
	entries: DigimonEvolutionEntry[];
	onSelect: (slug: string | null) => void;
	direction: EvolutionDirection;
};

function EvolutionGroup({
	title,
	description,
	entries,
	onSelect,
	direction,
}: EvolutionGroupProps) {
	if (!entries.length) {
		return (
			<div className="rounded-3xl border border-dashed border-border/50 bg-muted/20 p-6 text-sm text-muted-foreground">
				<p className="font-semibold uppercase tracking-[0.26em] text-muted-foreground/90">
					{title}
				</p>
				<p className="mt-2 text-muted-foreground/70">No data available.</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<div>
				<p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
					{title}
				</p>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
				{entries.map((entry) => (
					<EvolutionOptionCard
						key={`${direction}-${entry.slug ?? entry.name}`}
						entry={entry}
						direction={direction}
						onSelect={(slug) => onSelect(slug)}
					/>
				))}
			</div>
		</div>
	);
}

function HeroSkeleton() {
	return (
		<Card className="border border-border/60 bg-card/60">
			<CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:gap-8">
				<Skeleton className="size-36 rounded-full" />
				<div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
					{Array.from({ length: 6 }).map((_, index) => (
						<Skeleton key={index} className="h-20 rounded-2xl" />
					))}
				</div>
			</CardContent>
		</Card>
	);
}
