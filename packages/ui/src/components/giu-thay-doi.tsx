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
	khai: (id: string, coChu: boolean) => void;
};

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
	const [khaiCon, datKhaiCon] = React.useState<Record<string, boolean>>({});
	const [khaiTruoc, datKhaiTruoc] = React.useState(coThayDoi);
	const [moTruoc, datMoTruoc] = React.useState(mo);
	const [hoi, datHoi] = React.useState(false);
	const boQua = React.useRef(false);
	const oCuoi = React.useRef<HTMLElement | null>(null);
	const dangBo = React.useRef(false);
	if (mo !== moTruoc) {
		datMoTruoc(mo);
		if (mo) {
			datTuNhan(false);
			datKhaiCon({});
		} else datHoi(false);
	}
	if (coThayDoi !== khaiTruoc) {
		datKhaiTruoc(coThayDoi);
		if (khaiTruoc === true && coThayDoi === false) datTuNhan(false);
	}
	const bat = giuThayDoi !== false;
	const nhan = tuNhanThayDoi !== false;
	const conKhai = Object.values(khaiCon).some(Boolean);
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
			hoiLai: () => datHoi(true),
			boQuaLanToi: () => {
				boQua.current = true;
			},
			dong: () => {
				boQua.current = false;
				dongThat();
			},
			khai: (id, coChu) =>
				datKhaiCon((cu) => (cu[id] === coChu ? cu : { ...cu, [id]: coChu })),
		}),
		[ban, bat, nhan, dongThat],
	);
	const hopHoi = (
		<ConfirmDialog
			tieuDe={msg.dialog.boThayDoi.tieuDe}
			than={msg.dialog.boThayDoi.than}
			nut={msg.dialog.boThayDoi.bo}
			thoi={msg.dialog.boThayDoi.tiepTuc}
			open={hoi}
			onOpenChange={datHoi}
			pending={false}
			onConfirm={() => {
				dangBo.current = true;
				datHoi(false);
				dongThat();
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

export function useKhaiThayDoi(): (coChu: boolean) => void {
	const g = React.useContext(GiuContext);
	const id = React.useId();
	const khai = g?.khai;
	useMountEffect(() => () => khai?.(id, false));
	return React.useCallback((coChu: boolean) => g?.khai(id, coChu), [g, id]);
}
