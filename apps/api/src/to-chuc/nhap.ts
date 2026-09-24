import { TO_CHUC } from "./to-chuc-config";

const N = TO_CHUC.thongDiep.nhap;

export type SnapNhap = {
	members: { id: string; email: string }[];
	departments: { id: string; name: string; divisionId: string | null }[];
	divisions: { id: string; name: string }[];
};

export type LoaiTruong = "phong-ban" | "bo-phan" | null;

export type DongHopLe = {
	line: number;
	userId: string;
	departmentName: string;
	departmentId: string | null;
	divisionName: string | null;
	divisionId: string | null;
	head: LoaiTruong;
};

export type DongNhap = {
	line: number;
	email: string;
	department: string;
	division: string;
	head: string;
	error: string | null;
};

export type KetQuaNhap = {
	rows: DongNhap[];
	hopLe: DongHopLe[];
	summary: {
		valid: number;
		invalid: number;
		newDepartments: number;
		newDivisions: number;
	};
};

export const khoa = (s: string) => s.trim().toLocaleLowerCase("vi");

export function boDau(s: string): string {
	return s
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase()
		.trim();
}

export function tachO(dong: string): string[] {
	if (dong.includes("\t")) return dong.split("\t").map((o) => o.trim());
	const o: string[] = [];
	let hienTai = "";
	let trongNgoac = false;
	for (let i = 0; i < dong.length; i += 1) {
		const k = dong[i];
		if (k === '"') {
			if (trongNgoac && dong[i + 1] === '"') {
				hienTai += '"';
				i += 1;
			} else trongNgoac = !trongNgoac;
		} else if (k === "," && !trongNgoac) {
			o.push(hienTai.trim());
			hienTai = "";
		} else hienTai += k;
	}
	o.push(hienTai.trim());
	return o;
}

export function tachDong(chu: string): { line: number; o: string[] }[] {
	const dong = chu
		.split(/\r?\n/)
		.map((d, i) => ({ line: i + 1, d }))
		.filter((x) => x.d.trim() !== "")
		.map((x) => ({ line: x.line, o: tachO(x.d) }));
	if (dong.length > 0 && !(dong[0]?.o[0] ?? "").includes("@"))
		return dong.slice(1);
	return dong;
}

function loaiTruong(o: string): LoaiTruong | "la" {
	const b = boDau(o);
	if (b === "") return null;
	if (b === "phong ban") return "phong-ban";
	if (b === "bo phan") return "bo-phan";
	return "la";
}

export function phanTichLo(chu: string, snap: SnapNhap): KetQuaNhap {
	const nguoi = new Map(snap.members.map((m) => [khoa(m.email), m.id]));
	const pbTheoTen = new Map<string, SnapNhap["departments"][number]>();
	for (const d of snap.departments)
		if (!pbTheoTen.has(khoa(d.name))) pbTheoTen.set(khoa(d.name), d);
	const bpTheoTen = new Map<string, SnapNhap["divisions"][number]>();
	for (const d of snap.divisions)
		if (!bpTheoTen.has(khoa(d.name))) bpTheoTen.set(khoa(d.name), d);
	const bpTheoId = new Map(snap.divisions.map((d) => [d.id, d]));

	const tho = tachDong(chu).map(({ line, o }) => {
		const [email = "", department = "", division = "", head = ""] = o;
		return {
			line,
			email,
			department,
			division,
			head,
			error: null as string | null,
		};
	});

	const bpHieuLuc = (r: (typeof tho)[number]) => {
		if (r.division !== "") return khoa(r.division);
		const pb = pbTheoTen.get(khoa(r.department));
		const bp = pb?.divisionId ? bpTheoId.get(pb.divisionId) : undefined;
		return bp ? khoa(bp.name) : "";
	};

	for (const r of tho) {
		const lt = loaiTruong(r.head);
		if (
			r.email === "" ||
			r.department === "" ||
			(lt === "bo-phan" && bpHieuLuc(r) === "")
		)
			r.error = N.thieuCot;
		else if (!nguoi.has(khoa(r.email))) r.error = N.emailKhongPhaiThanhVien;
		else if (lt === "la") r.error = N.truongLa;
		else {
			const pb = pbTheoTen.get(khoa(r.department));
			const bp = pb?.divisionId ? bpTheoId.get(pb.divisionId) : undefined;
			if (bp && r.division !== "" && khoa(bp.name) !== khoa(r.division)) {
				r.error = N.phongBanBoPhanKhac(pb?.name ?? r.department, bp.name);
			}
		}
	}

	const nhom = <K>(chon: (r: (typeof tho)[number]) => K | null) => {
		const m = new Map<K, (typeof tho)[number][]>();
		for (const r of tho) {
			const k = chon(r);
			if (k === null) continue;
			m.set(k, [...(m.get(k) ?? []), r]);
		}
		return m;
	};
	const danhCap = (
		m: Map<unknown, (typeof tho)[number][]>,
		loi: (r: (typeof tho)[number]) => string,
		hong: (ds: (typeof tho)[number][]) => boolean,
	) => {
		for (const ds of m.values())
			if (hong(ds)) for (const r of ds) if (r.error === null) r.error = loi(r);
	};

	danhCap(
		nhom((r) => (r.email === "" ? null : khoa(r.email))),
		() => N.emailLap,
		(ds) => ds.length > 1,
	);
	danhCap(
		nhom((r) =>
			r.department === "" || r.division === "" ? null : khoa(r.department),
		),
		(r) => N.phongBanHaiBoPhan(r.department),
		(ds) => new Set(ds.map((r) => khoa(r.division))).size > 1,
	);
	danhCap(
		nhom((r) => {
			const lt = loaiTruong(r.head);
			if (lt === "phong-ban") return `pb:${khoa(r.department)}`;
			if (lt === "bo-phan") return `bp:${bpHieuLuc(r)}`;
			return null;
		}),
		(r) =>
			N.haiTruong(
				loaiTruong(r.head) === "bo-phan"
					? r.division || bpHieuLuc(r)
					: r.department,
			),
		(ds) => ds.length > 1,
	);

	const hopLe: DongHopLe[] = tho
		.filter((r) => r.error === null)
		.map((r) => {
			const pb = pbTheoTen.get(khoa(r.department));
			const tenBp = r.division !== "" ? r.division : null;
			const bp = tenBp ? bpTheoTen.get(khoa(tenBp)) : undefined;
			const lt = loaiTruong(r.head);
			return {
				line: r.line,
				userId: nguoi.get(khoa(r.email)) as string,
				departmentName: pb?.name ?? r.department,
				departmentId: pb?.id ?? null,
				divisionName: bp?.name ?? tenBp,
				divisionId: bp?.id ?? pb?.divisionId ?? null,
				head: lt === "la" ? null : lt,
			};
		});

	return {
		rows: tho,
		hopLe,
		summary: {
			valid: hopLe.length,
			invalid: tho.length - hopLe.length,
			newDepartments: new Set(
				hopLe
					.filter((h) => h.departmentId === null)
					.map((h) => khoa(h.departmentName)),
			).size,
			newDivisions: new Set(
				hopLe
					.filter(
						(h) =>
							h.divisionName !== null && !bpTheoTen.has(khoa(h.divisionName)),
					)
					.map((h) => khoa(h.divisionName as string)),
			).size,
		},
	};
}
