"use client";

import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import { useQueryStates } from "nuqs";
import type { onboardingMessages } from "@/lib/messages/onboarding";
import {
	DANH_MUC_CACH_CHIA,
	DANH_MUC_CACH_XEM,
	type DanhMucCachChia,
	type DanhMucCachXem,
	danhMucSearchParams,
	ONBOARDING_TRANG_THAI,
	type OnboardingTrangThai,
	onboardingParsers,
} from "./onboarding-search-params";

type Messages = ReturnType<typeof onboardingMessages>;

export function useBoLoc(): () => void {
	const [, setList] = useQueryStates(danhMucSearchParams.parsers);
	const [, setOnboarding] = useQueryStates(onboardingParsers);

	return () => {
		setList({
			q: null,
			page: null,
			boPhan: null,
			nguoiCam: null,
			nguoiGiao: null,
			division: null,
		});
		setOnboarding({ trangThai: null });
	};
}

export function TrangThaiToggle({
	m,
	value,
	counts,
	onChange,
}: {
	m: Messages;
	value: OnboardingTrangThai;
	counts: Record<string, number> | undefined;
	onChange: (next: OnboardingTrangThai) => void;
}) {
	return (
		<ToggleGroup
			type="single"
			variant="outline"
			size="sm"
			spacing={0}
			value={value}
			aria-label={m.facets.status}
			onValueChange={(next) => {
				const chon = ONBOARDING_TRANG_THAI.find((tt) => tt === next);
				if (chon) onChange(chon);
			}}
		>
			{ONBOARDING_TRANG_THAI.map((tt) => (
				<ToggleGroupItem count={counts?.[tt] ?? 0} key={tt} value={tt}>
					{tt === "dang-chay" ? m.facets.running : m.facets.closed}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}

export function CachXemToggle({
	m,
	value,
	onChange,
}: {
	m: Messages;
	value: DanhMucCachXem;
	onChange: (next: DanhMucCachXem) => void;
}) {
	return (
		<ViewSwitch
			items={DANH_MUC_CACH_XEM.map((cx) => ({ value: cx, label: m.view[cx] }))}
			label={m.view.label}
			value={value}
			onValueChange={(next) => {
				const chon = DANH_MUC_CACH_XEM.find((cx) => cx === next);
				if (chon) onChange(chon);
			}}
		/>
	);
}

export function CachChiaToggle({
	m,
	value,
	onChange,
}: {
	m: Messages;
	value: DanhMucCachChia;
	onChange: (next: DanhMucCachChia) => void;
}) {
	return (
		<ViewSwitch
			items={DANH_MUC_CACH_CHIA.map((cc) => ({ value: cc, label: m.chia[cc] }))}
			label={m.chia.label}
			value={value}
			onValueChange={(next) => {
				const chon = DANH_MUC_CACH_CHIA.find((cc) => cc === next);
				if (chon) onChange(chon);
			}}
		/>
	);
}

export function KhongKhop({
	m,
	onClear,
}: {
	m: Messages;
	onClear: () => void;
}) {
	return (
		<Empty data-trang-thai="ST-danhmuc-khongkhop">
			<EmptyHeader>
				<EmptyTitle>{m.noMatch.title}</EmptyTitle>
				<EmptyDescription>{m.noMatch.body}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button variant="outline" onClick={onClear}>
					{m.noMatch.action}
				</Button>
			</EmptyContent>
		</Empty>
	);
}
