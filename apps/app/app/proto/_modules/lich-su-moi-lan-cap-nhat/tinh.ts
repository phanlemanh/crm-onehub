import type { TargetLinePoint } from "@crm/ui/components/target-line-chart";
import { formatDay, formatDayShort, formatNgayGio } from "@crm/ui/lib/format";
import { type KrMau, KY, type LanCapNhat } from "./du-lieu";

const MUI_GIO_VN = "Asia/Ho_Chi_Minh";

const NGAY_MS = 86_400_000;

const TUAN_MS = 7 * NGAY_MS;

const msNgay = (ngay: string): number => Date.parse(`${ngay}T00:00:00Z`);

const ngayTuMs = (ms: number): string =>
	new Date(ms).toISOString().slice(0, 10);

export function ngayVn(luc: string): string {
	const [d, m, y] = formatNgayGio(luc, "vi", {
		timeZone: MUI_GIO_VN,
		phan: "ngay",
	}).split("/");
	return `${y}-${m}-${d}`;
}

export function nhanLuc(luc: string): string {
	const ngay = formatNgayGio(luc, "vi", { timeZone: MUI_GIO_VN, phan: "ngay" });
	const gio = formatNgayGio(luc, "vi", { timeZone: MUI_GIO_VN, phan: "gio" });
	return `${ngay} ${gio}`;
}

export function tuanCua(ngay: string): string {
	const ms = msNgay(ngay);
	const thu = (new Date(ms).getUTCDay() + 6) % 7;
	return ngayTuMs(ms - thu * NGAY_MS);
}

const cacTuan = (): string[] =>
	Array.from({ length: KY.soTuan }, (_, i) =>
		ngayTuMs(msNgay(KY.batDau) + i * TUAN_MS),
	);

function kyVong(kr: KrMau, i: number): number {
	const v = kr.batDau + ((kr.dich - kr.batDau) * (i + 1)) / KY.soTuan;
	return Math.round(v * 100) / 100;
}

const lanTrongTuan = (kr: KrMau, tuan: string): LanCapNhat[] =>
	kr.lan.filter((l) => tuanCua(ngayVn(l.luc)) === tuan);

export function chuoiMoiLan(kr: KrMau): TargetLinePoint[] {
	return cacTuan().flatMap((tuan, i) => {
		const trong = lanTrongTuan(kr, tuan);
		if (trong.length === 0)
			return [
				{
					x: formatDayShort(tuan, "vi"),
					value: null,
					expected: kyVong(kr, i),
				},
			];
		return trong.map((l) => ({
			x: formatDayShort(ngayVn(l.luc), "vi"),
			value: l.giaTri,
			expected: kyVong(kr, i),
		}));
	});
}

export type DongTuan = { tuan: string; lan: LanCapNhat };

export function cuoiMoiTuan(kr: KrMau): DongTuan[] {
	return cacTuan().flatMap((tuan) => {
		const cuoi = lanTrongTuan(kr, tuan).at(-1);
		return cuoi ? [{ tuan, lan: cuoi }] : [];
	});
}

export function chuoiTheoTuan(kr: KrMau): TargetLinePoint[] {
	const dong = cuoiMoiTuan(kr);
	return cacTuan().map((tuan, i) => ({
		x: formatDayShort(tuan, "vi"),
		value: dong.find((d) => d.tuan === tuan)?.lan.giaTri ?? null,
		expected: kyVong(kr, i),
	}));
}

export const nhanTuan = (tuan: string): string => formatDay(tuan, "vi");

const SO = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });

export function dinhDangSo(kr: KrMau, so: number): string {
	if (kr.kieu === "moc") return so >= 1 ? "Xong" : "Chưa xong";
	return kr.donVi === "%"
		? `${SO.format(so)}%`
		: `${SO.format(so)} ${kr.donVi}`;
}

export function moiNhat(kr: KrMau): LanCapNhat | undefined {
	return kr.lan.at(-1);
}

export function tienDo(kr: KrMau): number {
	const moi = moiNhat(kr);
	if (kr.kieu === "moc" || !moi || moi.giaTri === null) return 0;
	const p = ((moi.giaTri - kr.batDau) / (kr.dich - kr.batDau)) * 100;
	return Math.max(0, Math.min(100, Math.round(p)));
}

export function tienDoKyVong(): number {
	const daQua = (msNgay(KY.homNay) - msNgay(KY.batDau)) / NGAY_MS;
	return Math.round((daQua / (KY.soTuan * 7)) * 100);
}

export function lanGuiThu(kr: KrMau, thu: number): LanCapNhat {
	const cuoi = moiNhat(kr);
	const buoc = (kr.dich - kr.batDau) / 40;
	const giaTri =
		kr.kieu === "moc"
			? null
			: Math.round(((cuoi?.giaTri ?? kr.batDau) + buoc) * 100) / 100;
	const luc = new Date(Date.parse(KY.lucGuiThu) + thu * 7 * 60_000);
	return {
		checkInId: `ci-thu-${kr.id}-${thu}`,
		luc: luc.toISOString(),
		giaTri,
		tuTin: cuoi?.tuTin ?? "vua",
		ghiChu: `Lần gửi thử thứ ${thu + 1} từ bản mẫu.`,
		camXuc: {},
	};
}
