import { useMemo, useState } from "react";
import { Download, Upload, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TeamSlot } from "@/store/team-builder-atoms";

type TeamImportExportControlsProps = {
	slots: TeamSlot[];
	onImport: (slots: TeamSlot[]) => void;
	className?: string;
};

type DialogMode = "import" | "export";

export function TeamImportExportControls({ slots, onImport, className }: TeamImportExportControlsProps) {
	const [open, setOpen] = useState(false);
	const [mode, setMode] = useState<DialogMode>("export");
	const [value, setValue] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const exportJSON = useMemo(() => JSON.stringify(slots, null, 2), [slots]);

	const handleExportClick = () => {
		setMode("export");
		setValue(exportJSON);
		setError(null);
		setCopied(false);
		setOpen(true);
	};

	const handleImportClick = () => {
		setMode("import");
		setValue("");
		setError(null);
		setCopied(false);
		setOpen(true);
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(value || exportJSON);
			setCopied(true);
			setTimeout(() => setCopied(false), 1800);
		} catch (cause) {
			console.warn("Failed to copy team JSON", cause);
		}
	};

	const handleImport = () => {
		try {
			const raw = JSON.parse(value);
			const payload = Array.isArray(raw)
				? raw
				: Array.isArray(raw?.slots)
					? raw.slots
					: null;

			if (!payload) {
				throw new Error("Expected an array of slots or { \"slots\": [...] }");
			}

			const sanitized: TeamSlot[] = payload
				.map((slot) => sanitizeSlot(slot))
				.filter((slot): slot is TeamSlot => slot !== null);

			if (!sanitized.length) {
				throw new Error("No valid slots found in the provided JSON.");
			}

			onImport(sanitized);
			setOpen(false);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Unable to import JSON");
		}
	};

	return (
		<>
			<div className={cn("flex items-center gap-2", className)}>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={handleImportClick}
							className="rounded-full border-border/60 bg-background/80"
						>
							<Upload className="size-4" />
							<span className="sr-only">Import team</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent sideOffset={8}>Import Team</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={handleExportClick}
							disabled={!slots.length}
							className="rounded-full border-border/60 bg-background/80 disabled:cursor-not-allowed disabled:opacity-70"
						>
							<Download className="size-4" />
							<span className="sr-only">Export team</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent sideOffset={8}>Export Team</TooltipContent>
				</Tooltip>
			</div>

			<Dialog
				open={open}
				onOpenChange={(next) => {
					setOpen(next);
					if (!next) {
						setError(null);
						setCopied(false);
						setMode("export");
					}
				}}
			>
				<DialogContent className="max-w-xl rounded-3xl border border-border/60 bg-background/95 p-6 shadow-2xl backdrop-blur" showCloseButton={false}>
					<DialogHeader className="items-start text-left">
						<DialogTitle className="text-lg font-semibold text-foreground">
							{mode === "import" ? "Import Team" : "Export Team"}
						</DialogTitle>
						<DialogDescription className="text-sm text-muted-foreground">
							{mode === "import"
								? "Paste a team JSON export to replace your current squad."
								: "Copy or download this JSON to back up your current team."}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3">
						<textarea
							value={mode === "export" ? exportJSON : value}
							onChange={(event) => {
								if (mode === "export") return;
								setValue(event.target.value);
							}}
							className="min-h-[220px] w-full resize-y rounded-2xl border border-border/50 bg-muted/20 p-4 font-mono text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
							placeholder="Paste your exported JSON here"
							spellCheck={false}
						/>
						{error ? (
							<p className="text-sm text-destructive">{error}</p>
						) : null}
					</div>
					<DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
						<div className="flex items-center gap-2">
							<Button variant="ghost" onClick={() => setOpen(false)}>
								Cancel
							</Button>
						</div>
						<div className="flex items-center gap-2">
							{mode === "export" ? (
								<Button type="button" variant="outline" onClick={handleCopy} className="gap-2">
									<ClipboardCheck className="size-4" />
									{copied ? "Copied" : "Copy JSON"}
								</Button>
							) : (
								<Button type="button" variant="default" onClick={handleImport}>
									Import Team
								</Button>
							)}
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

function sanitizeSlot(candidate: unknown): TeamSlot | null {
	if (!candidate || typeof candidate !== "object") {
		return null;
	}

	const source = candidate as Partial<TeamSlot> & Record<string, unknown>;
	const forms = Array.isArray(source.forms)
		? source.forms.filter((slug): slug is string => typeof slug === "string" && slug.trim().length > 0)
		: [];

	if (forms.length === 0) {
		return null;
	}

	const personality = typeof source.personality === "string" ? source.personality : null;
	const skill = sanitizeSkill(source.skill);

	return {
		id: ensureId(source.id),
		forms,
		personality,
		skill,
	};
}

function sanitizeSkill(candidate: unknown): TeamSlot["skill"] {
	if (!candidate || typeof candidate !== "object") {
		return null;
	}

	const source = candidate as Partial<TeamSlot["skill"]> & Record<string, unknown>;
	if (typeof source?.name !== "string" || !source.name.trim()) {
		return null;
	}

	const origin = source.origin === "category" || source.origin === "personality" ? source.origin : "personality";

	return {
		name: source.name,
		effect: typeof source.effect === "string" ? source.effect : "",
		origin,
	};
}

function ensureId(id: unknown): string {
	if (typeof id === "string" && id.trim().length > 0) {
		return id;
	}

	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}

	return `slot-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
