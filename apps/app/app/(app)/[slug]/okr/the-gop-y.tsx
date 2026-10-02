"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import {
	ProposedChange,
	type ProposedChangeAction,
} from "@crm/ui/components/proposed-change";
import { type KeyboardEvent, useState } from "react";
import { okrGopYMessages } from "@/lib/messages/okr-gop-y";
import type { GopY } from "./cot-gop-y";
import {
	type DongHien,
	type HanhDongThe,
	type KetQuyet,
	propsThe,
} from "./the-gop-y-props";

const CHON_THE = "[data-the-cho]";
const BUOC_PHIM = { j: 1, k: -1 } as const;
const O_GO_CHU = "input, textarea, select, [contenteditable='true']";

function nutCuaPhim(the: HTMLElement, phim: string): HTMLButtonElement | null {
	if (phim === "enter") {
		return the.querySelector<HTMLButtonElement>(
			'button[data-variant="default"]',
		);
	}
	if (phim === "e") {
		return the.querySelector<HTMLButtonElement>('button[data-hanh-dong="sua"]');
	}
	return null;
}

export function phimCot(e: KeyboardEvent<HTMLElement>): void {
	if (e.altKey || e.ctrlKey || e.metaKey) return;
	const dich = e.target;
	if (!(dich instanceof HTMLElement) || dich.closest(O_GO_CHU)) return;
	const the = dich.closest<HTMLElement>(CHON_THE);
	const phim = e.key.toLowerCase();
	if (phim === "j" || phim === "k") {
		const ds = [...e.currentTarget.querySelectorAll<HTMLElement>(CHON_THE)];
		const i = the ? ds.indexOf(the) : -1;
		const toi = ds[Math.min(ds.length - 1, Math.max(0, i + BUOC_PHIM[phim]))];
		if (!toi) return;
		e.preventDefault();
		toi.focus();
		return;
	}
	if (the === null || dich !== the) return;
	const nut = nutCuaPhim(the, phim);
	if (!nut || nut.disabled) return;
	e.preventDefault();
	nut.click();
}

export function TheGopY({
	dong,
	gopY,
	ket,
	khoaNhan,
}: {
	dong: DongHien;
	gopY: GopY;
	ket: KetQuyet | undefined;
	khoaNhan: boolean;
}) {
	const m = okrGopYMessages(useLocale());
	const [dangSua, setDangSua] = useState(false);
	const [chuSua, setChuSua] = useState(dong.sau ?? "");
	const lyDoDongKhac =
		gopY.dangQuyet !== null && gopY.dangQuyet !== dong.id
			? m.dong.dangGhiKhac
			: undefined;
	const p = propsThe(dong, {
		m,
		ket,
		dangSua,
		dangGui: gopY.dangQuyet === dong.id,
		loi: gopY.loiDong[dong.id],
		lyDoKhoa: khoaNhan ? m.dong.khoaODangSua : lyDoDongKhac,
		coMoKr: gopY.moKr !== undefined,
		lyDoKhoaMoKr: gopY.coSuaChuaLuu ? m.dong.khoaMoKr : undefined,
	});
	const lam = {
		nhan: () => gopY.quyet(dong, "nhan"),
		"can-chinh": () => gopY.quyet(dong, "nhan"),
		bac: () => gopY.quyet(dong, "bac"),
		"bo-qua": () => gopY.quyet(dong, "bo-qua"),
		sua: () => {
			setChuSua(dong.sau ?? "");
			setDangSua(true);
		},
		"huy-sua": () => setDangSua(false),
		"nhan-ban-sua": () => {
			const chu = chuSua.trim();
			if (chu !== "") gopY.quyet(dong, "sua", chu);
		},
		"mo-kr": () => {
			if (dong.keyResultId) gopY.moKr?.(dong.keyResultId);
		},
	} satisfies Record<HanhDongThe, () => void>;
	const actions: ProposedChangeAction[] = p.nut.map((n) => ({
		...n,
		onClick: lam[n.id],
	}));
	const chi = (bat: boolean) => {
		if (p.truongChi) gopY.chiO(bat ? p.truongChi : null);
	};
	const cho = ket === undefined;
	return (
		<ProposedChange
			{...p.the}
			density="card"
			actions={actions}
			editing={
				dangSua && cho
					? {
							value: chuSua,
							onChange: setChuSua,
							onCancel: () => setDangSua(false),
						}
					: undefined
			}
			data-dong={dong.id}
			data-the-cho={cho ? "" : undefined}
			tabIndex={cho ? 0 : undefined}
			onPointerEnter={() => chi(true)}
			onPointerLeave={() => chi(false)}
			onFocus={() => chi(true)}
			onBlur={() => chi(false)}
		/>
	);
}
