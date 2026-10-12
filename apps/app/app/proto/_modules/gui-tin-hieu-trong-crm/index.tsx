"use client";

import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { TIN_HIEU } from "@crm/validation/tin-hieu";
import { useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { DanhSachTinHieu } from "@/components/tin-hieu/danh-sach-tin-hieu";
import {
	type GiaiDoanGui,
	HopGuiTinHieu,
} from "@/components/tin-hieu/hop-gui-tin-hieu";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import { CHU_MAU, dongTheoState, MAN_MAU, STATE } from "./du-lieu";

const HOP = {
	[STATE.nut]: { chu: "", giaiDoan: "soan", loi: null, mo: false },
	[STATE.hopTrong]: { chu: "", giaiDoan: "soan", loi: null, mo: true },
	[STATE.hopDangGo]: { chu: CHU_MAU, giaiDoan: "soan", loi: null, mo: true },
	[STATE.hopDangGui]: {
		chu: CHU_MAU,
		giaiDoan: "dang-gui",
		loi: null,
		mo: true,
	},
	[STATE.hopDaGui]: { chu: "", giaiDoan: "da-gui", loi: null, mo: true },
	[STATE.hopQuaTran]: { chu: CHU_MAU, giaiDoan: "soan", loi: "tran", mo: true },
	[STATE.hopLoi]: { chu: CHU_MAU, giaiDoan: "soan", loi: "may-chu", mo: true },
} satisfies Record<
	string,
	{
		chu: string;
		giaiDoan: GiaiDoanGui;
		loi: "tran" | "may-chu" | null;
		mo: boolean;
	}
>;

const HOP_DONG = {
	chu: "",
	giaiDoan: "soan" as GiaiDoanGui,
	loi: null,
	mo: false,
};

function HopMau({ state, khung = true }: { state: string; khung?: boolean }) {
	const m = tinHieuMessages("vi");
	const dau = state in HOP ? HOP[state as keyof typeof HOP] : HOP_DONG;
	const [mo, setMo] = useState(dau.mo);
	const [chu, setChu] = useState(dau.chu);
	const [giaiDoan, setGiaiDoan] = useState<GiaiDoanGui>(dau.giaiDoan);
	const loi =
		dau.loi === "tran"
			? dien(m.hop.quaTran, { tran: String(TIN_HIEU.tranMoiNgay) })
			: dau.loi === "may-chu"
				? m.hop.chuaGui
				: null;
	const hop = (
		<HopGuiTinHieu
			chu={chu}
			giaiDoan={giaiDoan}
			hrefDaGui="/proto/gui-tin-hieu-trong-crm?state=ST-ds-co"
			loi={loi}
			ma="crm-42"
			man={MAN_MAU}
			onChuChange={setChu}
			onGui={() => setGiaiDoan("da-gui")}
			onOpenChange={setMo}
			open={mo}
		/>
	);
	return khung ? (
		<div className="flex items-center justify-end gap-2 rounded-lg border p-2">
			{hop}
		</div>
	) : (
		hop
	);
}

function TrangMau({ state }: { state: string }) {
	const m = tinHieuMessages("vi").trang;
	const dong = dongTheoState(state);
	let than: React.ReactNode;
	if (state === STATE.dsDangTai) {
		than = (
			<div className="flex flex-col gap-2" data-tin-hieu-dang-tai="">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
			</div>
		);
	} else if (state === STATE.dsLoi) {
		than = (
			<VungTaiLoi
				moTa={m.taiLoiMoTa}
				onThuLai={() => {}}
				tieuDe={m.taiLoiTieuDe}
			/>
		);
	} else {
		than = (
			<DanhSachTinHieu
				banVeDocDuoc={state !== STATE.dsKhongDocBanVe}
				dangXoa={null}
				dong={dong}
				hoiXoaBanDau={state === STATE.dsXacNhanXoa ? "t41" : undefined}
				nutGui={<HopMau khung={false} state={STATE.nut} />}
				onXoa={() => {}}
			/>
		);
	}
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.tieuDe}</PageShellTitle>
					<PageShellDescription>{m.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>{than}</PageShellContent>
		</PageShell>
	);
}

export function GuiTinHieuMau({ state }: { state: string }) {
	return (
		<LocaleProvider locale="vi">
			{state in HOP ? (
				<HopMau key={state} state={state} />
			) : (
				<TrangMau key={state} state={state} />
			)}
		</LocaleProvider>
	);
}
