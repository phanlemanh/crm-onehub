"use client";

import { Button } from "@crm/ui/components/button";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { useState } from "react";
import { toast } from "sonner";
import { DetailSheetProse } from "@/components/detail-sheet";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import {
	DS_HOP_TUAN,
	DS_THUONG,
	KR_DAI_LY,
	KR_DAI_LY_DA_CAP_NHAT,
	KR_DAI_LY_VUA_GUI,
	type KrNgan,
	LAN_VUA_GUI,
	NGUOI,
} from "./du-lieu";
import { HopThoaiCu } from "./hop-thoai-cu";
import { BangHopTuan } from "./hop-tuan";
import { type CheDo, NganKr, type Quyen } from "./ngan";
import {
	CAU_HINH,
	denHanChuaCapNhat,
	lanMoi,
	MOC,
	type Nhap,
	nhapBanDau,
} from "./tinh";

const ST = {
	homNay: "ST-cnk-hom-nay",
	moSan: "ST-cnk-mo-san",
	xemTruoc: "ST-cnk-xem-truoc",
	thu: "ST-cnk-thu",
	vuaGui: "ST-cnk-vua-gui",
	loi: "ST-cnk-loi",
	moc: "ST-cnk-moc",
	ghiHo: "ST-cnk-ghi-ho",
	giuNhap: "ST-cnk-giu-nhap",
	chiDoc: "ST-cnk-chi-doc",
	tuHopTuan: "ST-cnk-tu-hop-tuan",
} as const;

type Canh = {
	cheDo: CheDo;
	quyen: Quyen;
	ds: readonly KrNgan[];
	viTri: number;
	nhap?: Partial<Nhap>;
	loi?: boolean;
	tieuDiem?: boolean;
	theoBang?: boolean;
	lanVuaGui?: string;
	hopCu?: boolean;
	hoiGiu?: boolean;
};

const NHAP_DANG_GO: Partial<Nhap> = {
	giaTri: "14",
	tuTin: "vua",
	ghiChu: "Huế ký sớm; còn sáu tỉnh chưa có đại lý độc quyền.",
};

const thayDau = (kr: KrNgan): readonly KrNgan[] => [kr, ...DS_THUONG.slice(1)];

const TRONG_NGAN = { cheDo: "trong-ngan", quyen: "ghi" } as const;

const CANH = new Map<string, Canh>([
	[
		ST.homNay,
		{ cheDo: "hom-nay", quyen: "ghi", ds: DS_THUONG, viTri: 0, hopCu: true },
	],
	[ST.moSan, { ...TRONG_NGAN, ds: DS_THUONG, viTri: 0 }],
	[
		ST.xemTruoc,
		{
			...TRONG_NGAN,
			ds: DS_THUONG,
			viTri: 0,
			nhap: { giaTri: "14", tuTin: "vua" },
		},
	],
	[ST.thu, { ...TRONG_NGAN, ds: thayDau(KR_DAI_LY_DA_CAP_NHAT), viTri: 0 }],
	[
		ST.vuaGui,
		{
			...TRONG_NGAN,
			ds: thayDau(KR_DAI_LY_VUA_GUI),
			viTri: 0,
			lanVuaGui: LAN_VUA_GUI.checkInId,
		},
	],
	[
		ST.loi,
		{ ...TRONG_NGAN, ds: DS_THUONG, viTri: 0, nhap: NHAP_DANG_GO, loi: true },
	],
	[
		ST.moc,
		{
			...TRONG_NGAN,
			ds: DS_THUONG,
			viTri: 1,
			nhap: {
				giaTri: MOC.xong,
				tuTin: "cao",
				ghiChu: "Hai giám đốc đã ký sáng nay tại Đà Nẵng.",
				bangChung: "https://drive.onehub.vn/hop-dong/khung-da-nang-2027.pdf",
			},
		},
	],
	[
		ST.ghiHo,
		{
			cheDo: "trong-ngan",
			quyen: "ghi-ho",
			ds: DS_THUONG,
			viTri: 0,
			nhap: { giaTri: "13" },
		},
	],
	[
		ST.giuNhap,
		{
			...TRONG_NGAN,
			ds: DS_THUONG,
			viTri: 0,
			nhap: NHAP_DANG_GO,
			hoiGiu: true,
		},
	],
	[
		ST.chiDoc,
		{ cheDo: "trong-ngan", quyen: "chi-doc", ds: DS_THUONG, viTri: 0 },
	],
	[
		ST.tuHopTuan,
		{
			...TRONG_NGAN,
			ds: DS_HOP_TUAN,
			viTri: 1,
			tieuDiem: true,
			theoBang: true,
		},
	],
]);

const CANH_GOC: Canh = { ...TRONG_NGAN, ds: DS_THUONG, viTri: 0 };

const CHU = {
	daCapNhat: "Đã cập nhật",
	moNgan: "Mở ngăn KR",
	mucTieu: "Mục tiêu",
	mucTieuMoTa: `Bộ OKR ${NGUOI.donVi}, Quý 4/2026.`,
	hopTuan: "Họp tuần",
	hopTuanMoTa: `Bộ OKR ${NGUOI.donVi} · tuần 26/10–01/11.`,
	huongDan:
		"Ngăn KR mở bên phải. Đóng ngăn rồi bấm «Mở ngăn KR» để mở lại; gõ vào khối cập nhật để thấy chấm xem trước trên biểu đồ Lịch sử.",
} as const;

function NoiDung({ state }: { state: string }) {
	const canh = CANH.get(state) ?? CANH_GOC;
	const krDau = canh.ds[canh.viTri] ?? KR_DAI_LY;
	const [ds, setDs] = useState<readonly KrNgan[]>(canh.ds);
	const [viTri, setViTri] = useState(canh.viTri);
	const [nhap, setNhap] = useState<Nhap>(() => ({
		...nhapBanDau(krDau),
		...canh.nhap,
	}));
	const [moKhoi, setMoKhoi] = useState(
		() => canh.nhap !== undefined || denHanChuaCapNhat(krDau),
	);
	const [loi, setLoi] = useState(canh.loi ?? false);
	const [lanVuaGui, setLanVuaGui] = useState<string | null>(
		canh.lanVuaGui ?? null,
	);
	const [tieuDiem, setTieuDiem] = useState(canh.tieuDiem ?? false);
	const [hopCu, setHopCu] = useState(canh.hopCu ?? false);
	const [mo, setMo] = useState(true);
	const [soLanGui, setSoLanGui] = useState(0);
	const [phien, setPhien] = useState(0);
	const kr = ds[viTri];

	useMountEffect(() => {
		if (canh.lanVuaGui) toast.success(CHU.daCapNhat, { id: CAU_HINH.toastId });
	});

	const doiViTri = (v: number) => {
		const k = ds[v];
		if (!k) return;
		setViTri(v);
		setNhap(nhapBanDau(k));
		setMoKhoi(denHanChuaCapNhat(k));
		setLoi(false);
		setLanVuaGui(null);
		setTieuDiem(false);
	};

	const themLan = (gui: Nhap) => {
		if (!kr) return;
		const lan = lanMoi(
			kr,
			gui,
			soLanGui,
			canh.quyen === "ghi-ho" ? NGUOI.truongDonVi : null,
		);
		const krMoi: KrNgan = { ...kr, lan: [...kr.lan, lan] };
		setDs((cu) => cu.map((k) => (k.id === kr.id ? krMoi : k)));
		setNhap(nhapBanDau(krMoi));
		setMoKhoi(false);
		setLoi(false);
		setLanVuaGui(lan.checkInId);
		setSoLanGui((n) => n + 1);
		setHopCu(false);
		toast.success(CHU.daCapNhat, { id: CAU_HINH.toastId });
	};

	const moTuBang = (v: number) => {
		doiViTri(v);
		setMoKhoi(true);
		setTieuDiem(true);
		setPhien((p) => p + 1);
		setMo(true);
	};

	const laHopTuan = canh.theoBang === true;

	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>
						{laHopTuan ? CHU.hopTuan : CHU.mucTieu}
					</PageShellTitle>
					<PageShellDescription>
						{laHopTuan ? CHU.hopTuanMoTa : CHU.mucTieuMoTa}
					</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<Button onClick={() => setMo(true)} size="sm" variant="outline">
						{CHU.moNgan}
					</Button>
				</PageShellActions>
			</PageShellHeader>
			<PageShellContent>
				{laHopTuan ? (
					<BangHopTuan
						dangMo={mo ? viTri : null}
						ds={ds}
						onCapNhat={moTuBang}
					/>
				) : (
					<DetailSheetProse>{CHU.huongDan}</DetailSheetProse>
				)}
			</PageShellContent>
			<NganKr
				h={{
					onDoiViTri: doiViTri,
					onNhap: setNhap,
					onMoKhoi: setMoKhoi,
					onGui: () => themLan(nhap),
					onMoHopCu: () => setHopCu(true),
				}}
				hoiGiuNgay={canh.hoiGiu === true}
				key={phien}
				mo={mo}
				onMo={setMo}
				t={{
					cheDo: canh.cheDo,
					quyen: canh.quyen,
					ds,
					viTri,
					nhap,
					moKhoi,
					loi,
					tieuDiem,
					theoBang: laHopTuan,
					lanVuaGui,
				}}
			/>
			{hopCu && kr ? (
				<HopThoaiCu kr={kr} onDong={() => setHopCu(false)} onGui={themLan} />
			) : null}
		</PageShell>
	);
}

export function CapNhatTrongNganKrMau({ state }: { state: string }) {
	return (
		<LocaleProvider locale="vi">
			<NoiDung key={state} state={state} />
		</LocaleProvider>
	);
}
