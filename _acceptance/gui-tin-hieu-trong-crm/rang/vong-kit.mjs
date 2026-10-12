import { spawnSync } from "node:child_process";
import {
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { tinHieuMessages } from "../../../apps/app/lib/messages/tin-hieu.ts";
import { docTrangThaiTinHieu } from "../../../apps/app/lib/tin-hieu/trang-thai.ts";
import {
	TIN_HIEU,
	tepTuBanGhi,
} from "../../../packages/validation/src/tin-hieu.ts";
import { chayKeoVe } from "../../../scripts/tin-hieu/keo-ve.ts";
import { KHOA_GIA, mayChuGia } from "./may-chu-gia.ts";
import { dungKhoMau, GOC, layKit, vietGom } from "./sinh-mau.mjs";

const ketQua = [];
const dong = (ok, ten, chi = "") =>
	ketQua.push(`${ok ? "DUNG" : "SAI"} ${ten}${chi ? ` — ${chi}` : ""}`);

const DANH_TINH = [
	{
		so: 501,
		ten: "Nguyễn Văn Thử",
		email: "thu.nguyen@onehub.test",
		nguoi: "user_vong_kit_501",
		phongBan: "Phòng Thử Nghiệm",
	},
	{
		so: 502,
		ten: "Trần Thị Mẫu",
		email: "mau.tran@onehub.test",
		nguoi: "user_vong_kit_502",
		phongBan: null,
	},
	{
		so: 503,
		ten: "Lê Văn Đo",
		email: "do.le@onehub.test",
		nguoi: "user_vong_kit_503",
		phongBan: "Phòng Đo",
	},
];

function danhSachMau() {
	return DANH_TINH.map((d, i) => ({
		id: `crm-${d.so}`,
		tep: tepTuBanGhi({
			tieuDe: `điều gặp ${i + 1}`,
			muonLam: `việc muốn làm ${i + 1}`,
			daXayRa: `điều gặp ${i + 1}`,
			man: "/okr/kr",
			guiLuc: new Date(`2026-10-1${i + 1}T03:00:00Z`),
		}),
		phongBan: d.phongBan,
	}));
}

const { thuMuc: kit, sha } = layKit();
console.log(`kit origin/main ${sha}`);
const tam = [];
try {
	const TH = await import(
		pathToFileURL(path.join(kit, "scripts", "tin-hieu.mjs")).href
	);
	const ds = danhSachMau();

	const r = mkdtempSync(path.join(tmpdir(), "gth-vong-doc-"));
	tam.push(r);
	const sv = mayChuGia(ds);
	const kq = await chayKeoVe({
		root: r,
		url: sv.url,
		key: KHOA_GIA,
		now: new Date("2026-10-20T00:00:00Z"),
	});
	sv.dung();
	if (kq.ma !== 0)
		dong(false, "doc: lenh keo ve", `ma ${kq.ma} ${kq.loi ?? ""}`);
	const doc = TH.docTinHieu(r, [TIN_HIEU.thuMucNguon]);
	const sachLoai = doc.tinHieu.every(
		(t) =>
			t.loai === "tin-hieu" &&
			t.tieu_de &&
			t.noi_dung?.muon_lam &&
			t.noi_dung?.da_xay_ra,
	);
	dong(
		doc.loi.length === 0 && doc.tinHieu.length === ds.length && sachLoai,
		"doc: bo doc kit doc moi tep keo ve 0 loi",
		doc.loi.length
			? `bo doc kit tu choi tep: ${doc.loi.join(" | ")}`
			: `${doc.tinHieu.length}/${ds.length} tep`,
	);
	const chu = readdirSync(path.join(r, TIN_HIEU.thuMucNguon))
		.map((f) => readFileSync(path.join(r, TIN_HIEU.thuMucNguon, f), "utf8"))
		.join("\n");
	const lo = DANH_TINH.flatMap((d) =>
		[d.ten, d.email, d.nguoi, d.phongBan].filter(Boolean),
	).filter((x) => chu.includes(x));
	dong(
		lo.length === 0,
		"doc: tep khong mang danh tinh",
		lo.length ? `tep mang danh tinh: ${lo.join(", ")}` : "",
	);

	const KHOA = createRequire(import.meta.url)(
		path.join(kit, "scripts", "tin-hieu-khoa.cjs"),
	);
	const khai = KHOA.khoaTinHieu(
		readFileSync(path.join(GOC, "_acceptance", "config.yaml"), "utf8"),
	);
	dong(
		JSON.stringify(khai?.nguon) === JSON.stringify([TIN_HIEU.thuMucNguon]) &&
			khai?.gom === "tin-hieu/gom",
		"ve: kho khai cua tin hieu",
		JSON.stringify(khai),
	);

	const ids = ds.map((t) => t.id);
	const cfgKho = readFileSync(path.join(GOC, "_acceptance", "config.yaml"), "utf8");
	const khaiKho = cfgKho.match(/^tin_hieu:\n(?: {2}.*\n)*/m)?.[0] ?? "";
	const kho = dungKhoMau(kit, { tins: ds, khai: khaiKho });
	tam.push(kho);
	writeFileSync(
		path.join(kho, "tin-hieu", "gom", "gom-1.md"),
		vietGom(kit, {
			dot: "gom-1",
			den: "2026-10-28T00:00:00Z",
			nhom: [["G1", "Trưởng phòng ban thấy số tuần trước", [ids[0]]]],
			le: [[ids[1], "lời cảm ơn"]],
			phu: [[ids[2], "giao-x"]],
		}),
	);
	spawnSync("git", ["-C", kho, "add", "-A"]);
	spawnSync("git", [
		"-C",
		kho,
		"-c",
		"commit.gpgsign=false",
		"commit",
		"-qm",
		"gom vong kit",
	]);
	const ve = spawnSync(
		process.execPath,
		[path.join(kit, "scripts", "product-map.mjs"), "--root", kho],
		{ encoding: "utf8" },
	);
	const html = readFileSync(path.join(kho, "LO-TRINH.html"), "utf8");
	const m = html.match(
		/<script type="application\/json" id="lo-trinh-du-lieu">([\s\S]*?)<\/script>/,
	);
	const khoi = m ? JSON.parse(m[1]) : null;
	const idKhoi = (khoi?.tin_hieu ?? []).map((t) => t.id).sort();
	dong(
		ve.status === 0 &&
			JSON.stringify(idKhoi) === JSON.stringify([...ids].sort()),
		"ve: khoi mang danh sach tin hieu dung ma tep keo ve",
		khoi?.tin_hieu ? idKhoi.join(",") : "ban ve khong mang danh sach tin hieu",
	);
	const m2 = tinHieuMessages("vi");
	const tt = docTrangThaiTinHieu(
		html,
		ids.map((ma) => ({ ma, daKeoVe: true })),
		m2,
	);
	const lech = (khoi?.tin_hieu ?? [])
		.filter((t) => tt.trangThai[t.id]?.cau !== t.cau)
		.map((t) => t.id);
	dong(
		tt.banVe === "co" && lech.length === 0,
		"ve: bo doc CRM ra dung cau kit",
		lech.length ? `cau trang thai lech cau kit: ${lech.join(",")}` : "",
	);

	const khoDu = dungKhoMau(kit);
	tam.push(khoDu);
	const khoiDu = JSON.parse(
		readFileSync(path.join(khoDu, "LO-TRINH.html"), "utf8").match(
			/id="lo-trinh-du-lieu">([\s\S]*?)<\/script>/,
		)[1],
	);
	const bang = Object.fromEntries(
		(khoiDu.tin_hieu ?? []).map((t) => [t.cho, t.cau]),
	);
	const BC = path.join(
		GOC,
		"_acceptance",
		"gui-tin-hieu-trong-crm",
		"evidence",
	);
	mkdirSync(BC, { recursive: true });
	writeFileSync(
		path.join(BC, "cau-kit-mau.json"),
		`${JSON.stringify({ kit_origin_main: sha, cau_theo_cho: bang }, null, 2)}\n`,
	);
	dong(
		Object.keys(bang).length === 7,
		"cau-kit-mau: du bay cho",
		Object.keys(bang).join(","),
	);
} finally {
	for (const d of [...tam, kit]) rmSync(d, { recursive: true, force: true });
}

for (const d of ketQua) console.log(d);
const sai = ketQua.filter((d) => d.startsWith("SAI")).length;
console.log(`KET LUAN: ${sai === 0 ? "moi dong DUNG" : `${sai} dong SAI`}`);
process.exit(sai === 0 ? 0 : 1);
