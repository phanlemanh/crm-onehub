"use client";

import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { useMessages } from "@crm/ui/components/locale-provider";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import * as React from "react";

export type GiuNguCanh = {
	coThayDoi: boolean;
	danhDau: (target: EventTarget | null, noi: EventTarget | null) => void;
	nhoO: (target: EventTarget | null, noi: EventTarget | null) => void;
	hoiLai: () => void;
	boQuaLanToi: () => void;
	dong: () => void;
	hoiRoi: (tiep: () => void) => void;
	khai: (id: string, coChu: boolean, loiHoi?: LoiHoi) => void;
};

export type LoiHoi = {
	tieuDe: string;
	than: string;
	nut: string;
	thoi: string;
};

type Khai = { coChu: boolean; loiHoi?: LoiHoi };

export type GiuGocVao = {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	coThayDoi?: boolean;
	giuThayDoi?: boolean;
	tuNhanThayDoi?: boolean;
};

export type GiuGocRa = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	coThayDoi: boolean;
	hopHoi: React.ReactNode;
	ngucCanh: GiuNguCanh;
};

export const GiuContext = React.createContext<GiuNguCanh | null>(null);

export function laOLoc(target: EventTarget | null): boolean {
	if (!(target instanceof Element)) return true;
	if (target instanceof HTMLInputElement && target.type === "search") {
		return true;
	}
	if (target.getAttribute("role") === "combobox") return true;
	return target.closest("[data-khong-giu]") !== null;
}

const NOI_DUNG_HOP =
	"[data-slot=dialog-content],[data-slot=sheet-content],[data-slot=drawer-content]";

function thuocHopKhac(
	target: EventTarget | null,
	noi: EventTarget | null,
): boolean {
	if (!(target instanceof Element)) return false;
	const hop = target.closest(NOI_DUNG_HOP);
	return hop !== null && hop !== noi;
}

function laOGo(target: EventTarget | null): target is HTMLElement {
	if (laOLoc(target)) return false;
	return (
		target instanceof HTMLInputElement ||
		target instanceof HTMLTextAreaElement ||
		(target instanceof HTMLElement && target.isContentEditable)
	);
}

export function useGiuGoc({
	open,
	defaultOpen,
	onOpenChange,
	coThayDoi,
	giuThayDoi,
	tuNhanThayDoi,
}: GiuGocVao): GiuGocRa {
	const msg = useMessages();
	const [moNoi, datMoNoi] = React.useState(defaultOpen ?? false);
	const mo = open ?? moNoi;
	const [tuNhan, datTuNhan] = React.useState(false);
	const [khaiCon, datKhaiCon] = React.useState<Record<string, Khai>>({});
	const [khaiTruoc, datKhaiTruoc] = React.useState(coThayDoi);
	const [moTruoc, datMoTruoc] = React.useState(mo);
	const [hoi, datHoi] = React.useState(false);
	const boQua = React.useRef(false);
	const oCuoi = React.useRef<HTMLElement | null>(null);
	const dangBo = React.useRef(false);
	const tiepRoi = React.useRef<(() => void) | null>(null);
	if (mo !== moTruoc) {
		datMoTruoc(mo);
		if (mo) {
			datTuNhan(false);
			datKhaiCon({});
		} else datHoi(false);
	}
	const doiHoi = React.useCallback((v: boolean) => {
		if (!v) tiepRoi.current = null;
		datHoi(v);
	}, []);
	if (coThayDoi !== khaiTruoc) {
		datKhaiTruoc(coThayDoi);
		if (khaiTruoc === true && coThayDoi === false) datTuNhan(false);
	}
	const bat = giuThayDoi !== false;
	const nhan = tuNhanThayDoi !== false;
	const conKhai = Object.values(khaiCon).some((k) => k.coChu);
	const loiHoi = Object.values(khaiCon).find((k) => k.coChu && k.loiHoi)
		?.loiHoi ?? {
		tieuDe: msg.dialog.boThayDoi.tieuDe,
		than: msg.dialog.boThayDoi.than,
		nut: msg.dialog.boThayDoi.bo,
		thoi: msg.dialog.boThayDoi.tiepTuc,
	};
	const ban = bat && ((nhan && tuNhan) || coThayDoi === true || conKhai);
	const dongThat = React.useCallback(() => {
		datTuNhan(false);
		datKhaiCon({});
		if (open === undefined) datMoNoi(false);
		onOpenChange?.(false);
	}, [open, onOpenChange]);
	const doiMo = React.useCallback(
		(v: boolean) => {
			if (v) {
				if (open === undefined) datMoNoi(true);
				onOpenChange?.(true);
				return;
			}
			if (ban && !boQua.current) {
				tiepRoi.current = null;
				datHoi(true);
				return;
			}
			boQua.current = false;
			dongThat();
		},
		[ban, open, onOpenChange, dongThat],
	);
	const ngucCanh = React.useMemo<GiuNguCanh>(
		() => ({
			coThayDoi: ban,
			danhDau: (t, noi) => {
				if (bat && nhan && !laOLoc(t) && !thuocHopKhac(t, noi)) {
					datTuNhan(true);
				}
			},
			nhoO: (t, noi) => {
				if (laOGo(t) && !thuocHopKhac(t, noi)) oCuoi.current = t;
			},
			hoiLai: () => {
				tiepRoi.current = null;
				datHoi(true);
			},
			boQuaLanToi: () => {
				boQua.current = true;
			},
			dong: () => {
				boQua.current = false;
				dongThat();
			},
			hoiRoi: (tiep) => {
				tiepRoi.current = tiep;
				datHoi(true);
			},
			khai: (id, coChu, loiHoi) =>
				datKhaiCon((cu) =>
					cu[id]?.coChu === coChu && cu[id]?.loiHoi === loiHoi
						? cu
						: { ...cu, [id]: { coChu, loiHoi } },
				),
		}),
		[ban, bat, nhan, dongThat],
	);
	const hopHoi = (
		<ConfirmDialog
			tieuDe={loiHoi.tieuDe}
			than={loiHoi.than}
			nut={loiHoi.nut}
			thoi={loiHoi.thoi}
			open={hoi}
			onOpenChange={doiHoi}
			pending={false}
			onConfirm={() => {
				dangBo.current = true;
				const tiep = tiepRoi.current;
				tiepRoi.current = null;
				datHoi(false);
				if (tiep) tiep();
				else dongThat();
			}}
			onCloseAutoFocus={(e) => {
				if (dangBo.current) {
					dangBo.current = false;
					e.preventDefault();
					return;
				}
				if (!oCuoi.current?.isConnected) return;
				e.preventDefault();
				oCuoi.current.focus();
			}}
		/>
	);
	return { open: mo, onOpenChange: doiMo, coThayDoi: ban, hopHoi, ngucCanh };
}

export function useGiuNoiDung(): GiuNguCanh | null {
	return React.useContext(GiuContext);
}

export function useKhaiThayDoi(loiHoi?: LoiHoi): (coChu: boolean) => void {
	const g = React.useContext(GiuContext);
	const id = React.useId();
	const khai = g?.khai;
	useMountEffect(() => () => khai?.(id, false));
	return React.useCallback(
		(coChu: boolean) => g?.khai(id, coChu, loiHoi),
		[g, id, loiHoi],
	);
}

export function hrefNoiBo(e: MouseEvent): string | null {
	if (e.defaultPrevented || e.button !== 0) return null;
	if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
	if (!(e.target instanceof Element)) return null;
	const a = e.target.closest("a[href]");
	if (!(a instanceof HTMLAnchorElement)) return null;
	if (a.target !== "" && a.target !== "_self") return null;
	if (a.hasAttribute("download")) return null;
	if (a.closest("[contenteditable='true']")) return null;
	const den = new URL(a.href, window.location.href);
	const day = window.location;
	if (den.origin !== day.origin) return null;
	if (den.pathname === day.pathname && den.search === day.search) return null;
	return `${den.pathname}${den.search}${den.hash}`;
}

export function useChanLienKet(
	bat: boolean,
	chan: (href: string) => void,
): void {
	React.useEffect(() => {
		if (!bat) return;
		const nghe = (e: MouseEvent) => {
			const href = hrefNoiBo(e);
			if (href === null) return;
			e.preventDefault();
			e.stopPropagation();
			chan(href);
		};
		document.addEventListener("click", nghe, true);
		return () => document.removeEventListener("click", nghe, true);
	}, [bat, chan]);
}

export function useChanLienKetTrongHop(
	dieuHuong: (href: string) => void,
): void {
	const g = React.useContext(GiuContext);
	const hoiRoi = g?.hoiRoi;
	const chan = React.useCallback(
		(href: string) => hoiRoi?.(() => dieuHuong(href)),
		[hoiRoi, dieuHuong],
	);
	useChanLienKet(g?.coThayDoi === true, chan);
}
