"use client";

import {
	Task,
	TaskContent,
	TaskItem,
	TaskTrigger,
} from "@crm/ui/components/ai-elements/task";
import { KaraRetry } from "@crm/ui/components/kara/state";
import { useMessages } from "@crm/ui/components/locale-provider";
import {
	IndicatorDot,
	type StatusTone,
} from "@crm/ui/components/status-indicator";

export type KaraStep = {
	id: string;
	label: string;
	state: "done" | "running" | "error";
};

export type KaraStepsProps = {
	steps: readonly KaraStep[];
	onRetry?: () => void;
};

const TONE = {
	done: "success",
	running: "info",
	error: "error",
} as const satisfies Record<KaraStep["state"], StatusTone>;

const DAU = {
	done: "xong",
	running: "dang-chay",
	error: "loi",
} as const satisfies Record<KaraStep["state"], string>;

export function KaraSteps({ steps, onRetry }: KaraStepsProps) {
	const msg = useMessages();
	const dangChay = steps.find((b) => b.state === "running");
	const coLoi = steps.some((b) => b.state === "error");
	const tieuDe = dangChay
		? msg.karaKhung.dangLamBuoc(dangChay.label)
		: msg.karaKhung.daLamBuoc(String(steps.length));
	const trangThai = {
		done: msg.karaKhung.buocXong,
		running: msg.karaKhung.buocDangChay,
		error: msg.karaKhung.buocLoi,
	} as const;
	return (
		<Task
			key={dangChay || coLoi ? "mo" : "gap"}
			defaultOpen={Boolean(dangChay) || coLoi}
			data-kara-steps=""
		>
			<TaskTrigger title={tieuDe} />
			<TaskContent>
				{steps.map((b) => (
					<TaskItem
						key={b.id}
						data-trang-thai={DAU[b.state]}
						className="flex items-baseline gap-2"
					>
						<IndicatorDot
							tone={TONE[b.state]}
							pulse={b.state === "running"}
							aria-hidden="true"
						/>
						<span className="min-w-0 text-pretty">{b.label}</span>
						<span className="sr-only">{trangThai[b.state]}</span>
					</TaskItem>
				))}
				{coLoi && onRetry ? <KaraRetry onClick={onRetry} /> : null}
			</TaskContent>
		</Task>
	);
}
