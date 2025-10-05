import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Suspense, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TeamSlot } from "@/store/team-builder-atoms";
import { TeamSlotCard } from "./TeamSlotCard";

type TeamBuilderBoardProps = {
	slots: TeamSlot[];
	onReorder: (activeId: string, overId: string) => void;
	onUpdate: (slot: TeamSlot) => void;
	onRemove: (id: string) => void;
};

export function TeamBuilderBoard({
	slots,
	onReorder,
	onUpdate,
	onRemove,
}: TeamBuilderBoardProps) {
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 6 },
		}),
	);

	const ids = useMemo(() => slots.map((slot) => slot.id), [slots]);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) {
			return;
		}

		const activeId = String(active.id);
		const overId = String(over.id);
		onReorder(activeId, overId);
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={ids} strategy={verticalListSortingStrategy}>
				<div className="grid gap-4">
					{slots.map((slot) => (
						<Suspense key={slot.id} fallback={<TeamSlotSkeleton />}>
							<TeamSlotCard
								slot={slot}
								onUpdate={onUpdate}
								onRemove={() => onRemove(slot.id)}
							/>
						</Suspense>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}

export function TeamSlotSkeleton() {
	return (
		<Card className="relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur">
			<CardContent className="flex flex-col gap-2">
				<div className="flex flex-wrap items-start gap-3">
					<Skeleton className="h-9 w-9 rounded-full" />
					<div className="flex min-w-0 flex-1 items-center justify-between gap-3">
						<Skeleton className="h-10 w-48 rounded-2xl" />
						<Skeleton className="h-10 w-10 rounded-full" />
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					{Array.from({ length: 4 }).map((_, index) => (
						<Skeleton
							key={`sk-${index.toString()}`}
							className="h-12 w-32 rounded-full"
						/>
					))}
				</div>
				<div className="grid gap-3 rounded-2xl border border-border/40 bg-muted/10 p-4">
					<Skeleton className="h-4 w-40" />
					<div className="grid gap-3 md:grid-cols-2">
						{Array.from({ length: 2 }).map((_, index) => (
							<Skeleton
								key={`sk-${index.toString()}`}
								className="h-20 rounded-2xl"
							/>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
