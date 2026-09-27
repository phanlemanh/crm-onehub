import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CONG_SAO, GOC_THAT, dungBanSao } from "./ban-sao.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const THUOC = resolve(HERE, "man-xin-quyen.mjs");
const KHO_CHUOI = "apps/app/lib/messages/auth.ts";
const MAN = "apps/app/app/(landing)/grant-access/grant-access.tsx";
const TRANG = "apps/app/app/(landing)/grant-access/page.tsx";

const VET = [
	{
		ten: "E1 o tieu de man",
		lenh: "nam-o",
		mong: 1,
		ghim: "tieu de man",
		sua: (s) =>
			s.replace('title: "Còn một bước nữa"', 'title: "One more step"'),
	},
	{
		ten: "E1 o cau rieng tu",
		lenh: "nam-o",
		mong: 1,
		ghim: "cau rieng tu",
		sua: (s) =>
			s.replace(
				/privacy:\n\t\t\t"Chỉ lưu trao đổi[^"]*"/,
				'privacy:\n\t\t\t"Only conversations with companies in OneHub Center are stored. Personal mail is discarded without being saved."',
			),
	},
	{
		ten: "E1 o chu tren nut dang xuat",
		lenh: "nam-o",
		mong: 1,
		ghim: "chu tren nut dang xuat",
		sua: (s) => s.replace('signOut: "Đăng xuất"', 'signOut: "Sign out"'),
	},
	{
		ten: "E1 o mo ta man",
		lenh: "nam-o",
		mong: 1,
		ghim: "mo ta man",
		sua: (s) =>
			s.replace(
				/both: "OneHub Center đọc thư và lịch[^"]*"/,
				'both: "OneHub Center reads your mail and calendar so meetings and email threads show up on the right company. It is read-only — nothing is ever sent on your behalf."',
			),
	},
	{
		ten: "E1 o chu tren nut cap quyen",
		lenh: "nam-o",
		mong: 1,
		ghim: "chu tren nut cap quyen",
		sua: (s) =>
			s.replace(
				'grant: (ten: string) => `Cấp quyền ${ten}`,\n\t\tgrantOne: "Cấp quyền",\n\t\tgranting: "Đang mở…",\n\t\tsignOut: "Đăng xuất",',
				'grant: (ten: string) => `Grant ${ten} access`,\n\t\tgrantOne: "Cấp quyền",\n\t\tgranting: "Đang mở…",\n\t\tsignOut: "Đăng xuất",',
			),
	},
	{
		ten: "E2 hai nhanh trung nhau",
		lenh: "ba-nhanh",
		mong: 1,
		ghim: "khong khac nhau tung doi mot",
		sua: (s) => {
			const both = s.match(/both: "(OneHub Center đọc[^"]*)"/)?.[1];
			if (!both) return s;
			return s.replace(
				/microsoft:\n\t\t\t"OneHub Center đọc thư Outlook[^"]*"/,
				`microsoft:\n\t\t\t"${both}"`,
			);
		},
	},
	{
		ten: "E3 go dau khong-dich",
		file: MAN,
		lenh: "khong-dich",
		mong: 2,
		ghim: 'phan tu mang translate="no"',
		sua: (s) => s.replace('<span translate="no">', "<span>"),
	},
	{
		ten: "E9 tran o tieu de man",
		lenh: "be-rong",
		mong: 1,
		ghim: 'o "tieu de man"',
		sua: (s) =>
			s.replace(
				'title: "Còn một bước nữa"',
				'title: "Cònmộtbướcnữatrướckhibạnvàođượcphầnchínhcủahệthốngquảntrịquanhệkháchhàngnày"',
			),
	},
	{
		ten: "E9 tran o nut dang xuat",
		lenh: "be-rong",
		mong: 1,
		ghim: 'o "chu tren nut dang xuat"',
		sua: (s) =>
			s.replace(
				'signOut: "Đăng xuất"',
				'signOut: "Đăngxuấtkhỏitàikhoảnhiệntạivàquaylạimànhìnhđăngnhậpbanđầucủahệthống"',
			),
	},
	{
		ten: "E9 mat mot o",
		file: MAN,
		lenh: "be-rong",
		mong: 2,
		ghim: "ban khai ghim 3",
		sua: (s) => {
			const i = s.lastIndexOf("\t\t\t<Button");
			const j = s.indexOf("</Button>", i);
			return i < 0 || j < 0
				? s
				: s.slice(0, i) + s.slice(j + "</Button>".length);
		},
	},
	{
		ten: "E5 chu o trang thai dang cap",
		lenh: "dang-cap",
		mong: 1,
		ghim: "chu tren nut o trang thai dang cap",
		sua: (s) => s.replace('granting: "Đang mở…"', 'granting: "Opening…"'),
	},
	{
		ten: "E6 cau loi nha cung cap",
		lenh: "loi-nha-cung-cap",
		mong: 1,
		ghim: "cau bao loi khi khong toi duoc nha cung cap",
		sua: (s) =>
			s.replace(
				/provider:\n\t\t\t\t"Không kết nối được[^"]*"/,
				'provider:\n\t\t\t\t"Could not reach the provider. Check your connection and try again."',
			),
	},
	{
		ten: "E7 cau loi dang xuat",
		lenh: "loi-dang-xuat",
		mong: 1,
		ghim: "cau bao loi khi dang xuat that bai",
		sua: (s) =>
			s.replace(
				/signOut: "Không đăng xuất được[^"]*"/,
				'signOut: "Could not sign out. Reload the page and try again."',
			),
	},
	{
		ten: "E10 chup nham man",
		file: TRANG,
		lenh: "chup-san",
		mong: 2,
		ghim: "bi day ve",
		sua: (s) =>
			s.replace(
				"if (providers.length === 0) {",
				"if (providers.length >= 0) {",
			),
	},
	{
		ten: "E8 tieu de tai lieu",
		lenh: "tieu-de-tai-lieu",
		mong: 1,
		ghim: "tieu de tai lieu",
		sua: (s) =>
			s.replace('grantAccess: "Cấp quyền",', 'grantAccess: "Grant access",'),
	},
];

const chon = process.argv[2];
const chay = chon ? VET.filter((v) => v.ten.startsWith(chon)) : VET;
if (!chay.length) {
	console.error(`khong co vet nao khop "${chon}"`);
	process.exit(2);
}

const app = `http://localhost:${CONG_SAO}`;
const ketQua = [];

const { goc, don } = await dungBanSao({ sua: () => {} });

try {
	for (const vet of chay) {
		const duong = `${goc}/${vet.file ?? KHO_CHUOI}`;
		const goc_chuoi = readFileSync(duong, "utf8");
		const sau = vet.sua(goc_chuoi);
		if (sau === goc_chuoi) {
			ketQua.push({
				...vet,
				ma: null,
				do: "VET KHONG CAY DUOC — chuoi nguon khong khop",
			});
			continue;
		}
		writeFileSync(duong, sau);
		await new Promise((r) => setTimeout(r, 4000));

		const ra = spawnSync("node", [THUOC, vet.lenh], {
			cwd: GOC_THAT,
			encoding: "utf8",
			env: { ...process.env, APP_URL: app, KHO_GOC: goc },
			timeout: 180000,
		});
		const dong = `${ra.stdout ?? ""}${ra.stderr ?? ""}`
			.split("\n")
			.filter((d) => d.startsWith("DO:") || d.startsWith("KHONG DO DUOC:"));
		ketQua.push({ ...vet, ma: ra.status, do: dong.join(" | ") });
		writeFileSync(duong, goc_chuoi);
		await new Promise((r) => setTimeout(r, 2000));
	}
} finally {
	await don();
}

let hong = 0;
for (const r of ketQua) {
	const maDung = r.ma === r.mong;
	const ghimDung = r.do.includes(r.ghim);
	const dat = maDung && ghimDung;
	if (!dat) hong++;
	console.log(
		`${dat ? "DAT " : "HONG"} ${r.ten} — ma=${r.ma} (mong ${r.mong}) ghim="${r.ghim}" ${ghimDung ? "co" : "THIEU"}`,
	);
	if (!dat) console.log(`      ${r.do || "(khong co dong DO nao)"}`);
}

console.log(
	`\n${ketQua.length - hong}/${ketQua.length} vet lam thuoc DO dung cho`,
);
process.exit(hong ? 1 : 0);
