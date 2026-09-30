import { dauTuanVN } from "@crm/db/onboarding-nhac";
import type { MucTuTin } from "@crm/validation/okr-cap-nhat";
import type { KieuKr } from "@crm/validation/okr-kr";
import { OKR_MAU } from "./cau-hinh";
import type { KichBan, KichBanQuy3 } from "./khuon";

export type LanMau = {
	tuan: number;
	giaTri: number;
	tuTin: MucTuTin;
	ghiChu: string;
};

type NhipKichBan = {
	tuan: number[];
	tien: (k: number) => number;
	tuTin: MucTuTin[];
};

const Q = OKR_MAU.tuan.tuanMoiQuy;

const NHIP = {
	deu: {
		tuan: [1, 2, 3, 4, 5, 6],
		tien: (k) => (k / Q) * 1.05,
		tuTin: ["cao", "cao", "cao", "cao", "cao", "cao"],
	},
	cham: {
		tuan: [1, 2, 3, 4, 5, 6],
		tien: (k) => (k / Q) * 0.6,
		tuTin: ["cao", "cao", "vua", "vua", "vua", "vua"],
	},
	tut: {
		tuan: [1, 2, 3, 4, 5, 6],
		tien: (k) => (Math.min(k, 4) / Q) * 0.95,
		tuTin: ["cao", "cao", "cao", "vua", "vua", "thap"],
	},
	bo: {
		tuan: [1, 2, 3],
		tien: (k) => (k / Q) * 0.7,
		tuTin: ["vua", "vua", "thap"],
	},
	vuot: {
		tuan: [1, 2, 3, 4, 5, 6],
		tien: (k) => Math.min(1.1, (k / 6) * 1.1),
		tuTin: ["cao", "cao", "cao", "cao", "cao", "cao"],
	},
	"ghi-chu": {
		tuan: [1, 2, 3, 4, 5, 6],
		tien: (k) => (k / Q) * 0.9,
		tuTin: ["cao", "cao", "cao", "vua", "vua", "vua"],
	},
	"chua-gui": {
		tuan: [1, 2, 3, 4, 5],
		tien: (k) => k / Q,
		tuTin: ["cao", "cao", "vua", "vua", "cao"],
	},
} satisfies Record<KichBan, NhipKichBan>;

const tron = (v: number) => Math.round(v * 10) / 10;

function giaTriTheoKieu(
	kieu: KieuKr,
	khoi: number,
	dich: number,
	tien: number,
	kichBan: KichBan,
	tuan: number,
): number {
	switch (kieu) {
		case "tang-toi":
		case "giam-xuong":
		case "phan-tram":
			return tron(khoi + (dich - khoi) * tien);
		case "giu-tren": {
			const le = Math.abs(dich) * 0.04 || 1;
			return tron(kichBan === "tut" && tuan === 6 ? dich - le : dich + le);
		}
		case "giu-duoi": {
			const le = Math.abs(dich) * 0.04 || 1;
			return tron(kichBan === "tut" && tuan === 6 ? dich + le : dich - le);
		}
		case "moc":
			return kichBan === "vuot" && tuan >= 5 ? 1 : 0;
	}
}

export function dienBien(kr: {
	kieu: KieuKr;
	khoi: number;
	dich: number;
	kichBan: KichBan;
	ghiChu?: Partial<Record<string, string>>;
}): LanMau[] {
	const nhip = NHIP[kr.kichBan];
	return nhip.tuan.map((tuan, i) => ({
		tuan,
		giaTri: giaTriTheoKieu(
			kr.kieu,
			kr.khoi,
			kr.dich,
			nhip.tien(tuan),
			kr.kichBan,
			tuan,
		),
		tuTin: nhip.tuTin[i] ?? "vua",
		ghiChu: kr.ghiChu?.[String(tuan)] ?? "",
	}));
}

const NHIP_QUY3 = {
	deu: ["vua", "vua", "vua", "vua"],
	troi: ["cao", "vua", "vua", "thap"],
} satisfies Record<KichBanQuy3, MucTuTin[]>;

export function lanQuy3(kr: {
	kieu: KieuKr;
	khoi: number;
	dich: number;
	chot: number;
	kichBanQuy3?: KichBanQuy3;
	ghiChu?: Partial<Record<string, string>>;
}): LanMau[] {
	const tuan = [3, 6, 9, 13];
	const cuoi = tuan.length;
	const tuTin = NHIP_QUY3[kr.kichBanQuy3 ?? "deu"];
	return tuan.map((t, i) => {
		const phan = (i + 1) / cuoi;
		const giaTri =
			kr.kieu === "moc"
				? i === cuoi - 1
					? kr.chot
					: 0
				: tron(kr.khoi + (kr.chot - kr.khoi) * phan);
		return {
			tuan: t,
			giaTri,
			tuTin: tuTin[i] ?? "vua",
			ghiChu: kr.ghiChu?.[String(t)] ?? "",
		};
	});
}

export type LichMau = {
	tuan4: string[];
	quy4: { tu: string; den: string };
	quy3: { tu: string; den: string };
	nam: { tu: string; den: string };
	namKe: { tu: string; den: string };
	ngay: (quy: "quy3" | "quy4", tuan: number) => string;
	lucCapNhat: (quy: "quy3" | "quy4", tuan: number) => Date;
};

function congNgay(ngay: string, soNgay: number): string {
	return new Date(
		Date.parse(`${ngay}T00:00:00Z`) + soNgay * OKR_MAU.thoiGian.ngayMs,
	)
		.toISOString()
		.slice(0, 10);
}

export function lichMau(moc: Date): LichMau {
	const { soTuanCapNhat, tuanMoiQuy, gioCapNhat, lechVN } = OKR_MAU.tuan;
	const tuanNay = dauTuanVN(moc);
	const dauQuy4 = congNgay(tuanNay, -7 * (soTuanCapNhat - 1));
	const dauQuy3 = congNgay(dauQuy4, -7 * tuanMoiQuy);
	const cuoiQuy4 = congNgay(dauQuy4, 7 * tuanMoiQuy - 1);
	const ngay = (quy: "quy3" | "quy4", tuan: number) =>
		congNgay(quy === "quy4" ? dauQuy4 : dauQuy3, 7 * (tuan - 1));
	return {
		tuan4: Array.from({ length: soTuanCapNhat }, (_, i) => ngay("quy4", i + 1)),
		quy4: { tu: dauQuy4, den: cuoiQuy4 },
		quy3: { tu: dauQuy3, den: congNgay(dauQuy4, -1) },
		nam: { tu: dauQuy3, den: congNgay(dauQuy3, 7 * 52 - 1) },
		namKe: {
			tu: congNgay(dauQuy3, 7 * 52),
			den: congNgay(dauQuy3, 7 * 104 - 1),
		},
		ngay,
		lucCapNhat: (quy, tuan) => {
			const luc = new Date(
				Date.parse(`${ngay(quy, tuan)}T00:00:00Z`) +
					(gioCapNhat - lechVN) * OKR_MAU.thoiGian.gioMs,
			);
			return luc.getTime() <= moc.getTime() ? luc : new Date(moc.getTime());
		},
	};
}
