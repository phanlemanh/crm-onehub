"use client";

import {
	Task,
	TaskContent,
	TaskItem,
	TaskTrigger,
} from "@crm/ui/components/ai-elements/task";
import { KaraRetry } from "@crm/ui/components/kara/state";
import { useMessages } from "@crm/ui/components/locale-provider";
import { useEffect, useState } from "react";
import {
	IndicatorDot,
	type StatusTone,
} from "@crm/ui/components/status-indicator";

export type KaraStep = {
	id: string;
	label: string;
	state: "done" | "running" | "error" | "unsaved";
};

export type KaraStepsProps = {
	steps: readonly KaraStep[];
	onRetry?: () => void;
};

const TONE = {
	done: "success",
	running: "info",
	error: "error",
	unsaved: "warning",
} as const satisfies Record<KaraStep["state"], StatusTone>;

const DAU = {
	done: "xong",
	running: "dang-chay",
	error: "loi",
	unsaved: "chua-luu",
} as const satisfies Record<KaraStep["state"], string>;

export function KaraSteps({ steps, onRetry }: KaraStepsProps) {
	const msg = useMessages();
	const dangChay = steps.find((b) => b.state === "running");
	const buocLoi = steps.find((b) => b.state === "error");
	const coLoi = buocLoi !== undefined;
	const buocChuaLuu = steps.find((b) => b.state === "unsaved");
	const canMo = Boolean(dangChay) || coLoi || buocChuaLuu !== undefined;
	const [mo, datMo] = useState(canMo);
	useEffect(() => {
		if (canMo) datMo(true);
	}, [canMo]);
	const tieuDe = dangChay
		? msg.karaKhung.dangLamBuoc(dangChay.label)
		: buocLoi
			? msg.karaKhung.buocLoiTieuDe(buocLoi.label)
			: buocChuaLuu
				? msg.karaKhung.buocChuaLuuTieuDe(buocChuaLuu.label)
				: msg.karaKhung.daLamBuoc(String(steps.length));
	const trangThai = {
		done: msg.karaKhung.buocXong,
		running: msg.karaKhung.buocDangChay,
		error: msg.karaKhung.buocLoi,
		unsaved: msg.karaKhung.buocChuaLuu,
	} as const;
	return (
		<Task
			open={mo}
			onOpenChange={datMo}
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
