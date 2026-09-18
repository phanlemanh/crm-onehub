import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dungBanSao } from "../../man-xin-quyen-co-rang/rang/ban-sao.mjs";

const THUOC = "_acceptance/truong-tu-tao-o-cai-dat/rang/bo-goi-y.mjs";
const GOI_Y = "packages/validation/src/field-templates.ts";
const KHOA = "packages/db/src/fields-shape.ts";
const TU_DIEN = "CONTEXT.md";

function sua(duong, doi) {
	const truoc = readFileSync(duong, "utf8");
	const sau = doi(truoc);
	if (sau === truoc) throw new Error(`dot bien khong doi gi trong ${duong}`);
	writeFileSync(duong, sau);
}

function thay(duong, a, b) {
	sua(duong, (s) => {
		if (!s.includes(a))
			throw new Error(`khong tim thay trong ${duong}: ${a.slice(0, 60)}`);
		return s.replace(a, b);
	});
}

const CA = [
	{
		ten: "goi y bo cu quay lai",
		che: "nhom-cong-ty",
		thay: ["AMER", "Territory"],
		pha: (goc) =>
			thay(
				`${goc}/${GOI_Y}`,
				"\tCOMPANY: [\n",
				'\tCOMPANY: [\n\t\t{ label: "Territory", type: "SELECT", options: ["AMER", "EMEA"] },\n',
			),
	},
	{
		ten: "nhom Thoa thuan rong",
		che: "ba-thuc-the",
		thay: ["DEAL"],
		pha: (goc) =>
			sua(`${goc}/${GOI_Y}`, (s) => {
				const i = s.indexOf("\tDEAL: [");
				const j = s.indexOf("\n\t],", i) + 4;
				return `${s.slice(0, i)}\tDEAL: [],\n${s.slice(j)}`;
			}),
	},
	{
		ten: "nhan Ca nhan thanh tieng Anh",
		che: "ba-thuc-the",
		thay: ["Segment"],
		pha: (goc) => thay(`${goc}/${GOI_Y}`, '"Vai trò trong sàn"', '"Segment"'),
	},
	{
		ten: "goi y trung khoa bo cao",
		che: "khong-trung-bo-cao",
		thay: ["dia_ban"],
		pha: (goc) =>
			thay(
				`${goc}/${GOI_Y}`,
				"\tCONTACT: [\n",
				'\tCONTACT: [\n\t\t{ label: "Địa bàn", type: "SELECT", options: ["Quận 1", "Quận 7"] },\n',
			),
	},
	{
		ten: "bo cao doi so khoa",
		che: "khong-trung-bo-cao",
		thay: ["10", "9"],
		pha: (goc) =>
			thay(
				`${goc}/apps/api/src/listings/listings-config.ts`,
				'{ key: "trang_nhatot", label: "Trang nhatot", type: "URL" },',
				'{ key: "trang_nhatot", label: "Trang nhatot", type: "URL" },\n\t\t{ key: "khoa_thu_muoi", label: "Khoa thu muoi", type: "TEXT" },',
			),
	},
	{
		ten: "thieu mot dong cua bang",
		che: "bang-muoi-lam",
		thay: ["Kênh liên lạc quen"],
		pha: (goc) =>
			sua(`${goc}/${GOI_Y}`, (s) => {
				const a =
					'\t\t{\n\t\t\tlabel: "Kênh liên lạc quen",\n\t\t\ttype: "SELECT",\n\t\t\toptions: ["Zalo", "Điện thoại", "Email", "Facebook"],\n\t\t},\n';
				if (!s.includes(a))
					throw new Error("khong tim thay dong Kenh lien lac quen");
				return s.replace(a, "");
			}),
	},
	{
		ten: "doi kieu mot dong",
		che: "bang-muoi-lam",
		thay: ["Tỷ lệ chia hoa hồng", "SELECT", "NUMBER"],
		pha: (goc) =>
			thay(
				`${goc}/${GOI_Y}`,
				'{ label: "Tỷ lệ chia hoa hồng", type: "NUMBER" }',
				'{ label: "Tỷ lệ chia hoa hồng", type: "SELECT", options: ["Thấp", "Cao"] }',
			),
	},
	{
		ten: "thieu mot lua chon",
		che: "bang-muoi-lam",
		thay: ["Đất nền"],
		pha: (goc) => thay(`${goc}/${GOI_Y}`, '\t"Đất nền",\n', ""),
	},
	{
		ten: "sai thu tu lua chon",
		che: "bang-muoi-lam",
		thay: ["SAI THU TU"],
		pha: (goc) =>
			thay(
				`${goc}/${GOI_Y}`,
				'\t"Căn hộ",\n\t"Nhà phố",\n',
				'\t"Nhà phố",\n\t"Căn hộ",\n',
			),
	},
	{
		ten: "cum bi tu dien tranh quay lai",
		che: "tranh-tu-dien",
		thay: ["Công ty môi giới", "Công ty"],
		pha: (goc) =>
			thay(
				`${goc}/${GOI_Y}`,
				'\t\t\t"Đơn vị môi giới",\n',
				'\t\t\t"Công ty môi giới",\n',
			),
	},
	{
		ten: "chu Phan khuc dung lai",
		che: "khong-dung-lai-phan-khuc",
		thay: ["Phân khúc chuyên"],
		pha: (goc) =>
			thay(
				`${goc}/${GOI_Y}`,
				'\t\t\tlabel: "Loại bất động sản",\n\t\t\ttype: "SELECT",\n\t\t\toptions: LOAI_BAT_DONG_SAN,\n\t\t},\n\t\t{\n\t\t\tlabel: "Vai trò trong sàn"',
				'\t\t\tlabel: "Phân khúc chuyên",\n\t\t\ttype: "SELECT",\n\t\t\toptions: LOAI_BAT_DONG_SAN,\n\t\t},\n\t\t{\n\t\t\tlabel: "Vai trò trong sàn"',
			),
	},
	{
		ten: "doi ten ma khong con truong noi dung thu no chua",
		che: "khong-dung-lai-phan-khuc",
		thay: ["Loại bất động sản"],
		pha: (goc) =>
			sua(`${goc}/${GOI_Y}`, (x) => {
				if (!x.includes('label: "Loại bất động sản"'))
					throw new Error("khong tim thay nhan Loai bat dong san");
				return x.replaceAll('label: "Loại bất động sản"', 'label: "Dòng hàng"');
			}),
	},
	{
		ten: "tu dien thieu dong Avoid",
		che: "tu-dien",
		thay: ["_Avoid_"],
		pha: (goc) =>
			thay(
				`${goc}/${TU_DIEN}`,
				"_Avoid_: thuộc tính, property, custom field, trường tuỳ chỉnh\n",
				"",
			),
	},
	{
		ten: "bo xu ly Esc khoi vung chua o sua",
		che: "ban-phim-va-kho-hep",
		thay: ["Esc"],
		mayChu: true,
		pha: (goc) =>
			thay(
				`${goc}/apps/app/app/(app)/[slug]/settings/fields/fields-settings.tsx`,
				'\t\t\t\t\t\tonKeyDown={(su) => {\n\t\t\t\t\t\t\tif (su.key !== "Escape") return;\n\t\t\t\t\t\t\tsu.stopPropagation();\n\t\t\t\t\t\t\tonEdit(null);\n\t\t\t\t\t\t}}\n',
				"",
			),
	},
	{
		ten: "ham sinh khoa tra ve ban cu",
		che: "khong-trung-bo-cao",
		thay: ["dia_ban"],
		khac: true,
		pha: (goc) => {
			thay(
				`${goc}/${KHOA}`,
				'\treturn label\n\t\t.normalize("NFD")\n\t\t.replace(/[\\u0300-\\u036f]/g, "")\n\t\t.replace(/[đĐ]/g, "d");',
				"\treturn label;",
			);
			thay(
				`${goc}/${GOI_Y}`,
				"\tCONTACT: [\n",
				'\tCONTACT: [\n\t\t{ label: "Địa bàn", type: "SELECT", options: ["Quận 1", "Quận 7"] },\n',
			);
		},
	},
];

const ket = [];

for (const ca of CA) {
	let ban = null;
	try {
		ban = await dungBanSao({
			sua: ca.pha,
			khongDungMayChu: ca.mayChu !== true,
		});
	} catch (loi) {
		ket.push({
			ten: ca.ten,
			dat: false,
			vi: `khong dung duoc ban sao da dot bien: ${String(loi?.message ?? loi).slice(0, 200)}`,
		});
		continue;
	}

	try {
		let ra = "";
		let ma = 0;
		try {
			const tep = ca.mayChu
				? `${ban.goc}/_acceptance/truong-tu-tao-o-cai-dat/rang/trang-truong.mjs`
				: `${ban.goc}/${THUOC}`;
			const moi = { ...process.env, GOC_CAY: ban.goc };
			if (ca.mayChu) {
				moi.APP_URL = ban.app;
				moi.API_URL = process.env.API_URL ?? "http://localhost:3001";
			}
			ra = execFileSync("bun", [tep, ca.che], {
				encoding: "utf8",
				env: moi,
			});
		} catch (loi) {
			ma = loi.status ?? 1;
			ra = `${loi.stdout ?? ""}${loi.stderr ?? ""}`;
		}

		const thieu = ca.thay.filter((x) => !ra.includes(x));

		if (ca.khac) {
			ket.push({
				ten: ca.ten,
				dat: ma === 0,
				vi:
					ma === 0
						? ""
						: `cho XANH (ham cu thi hai tap khoa khong giao nhau) nhung thoat ${ma}`,
			});
		} else if (ma === 0) {
			ket.push({ ten: ca.ten, dat: false, vi: "thuoc VAN XANH sau khi pha" });
		} else if (thieu.length > 0) {
			ket.push({
				ten: ca.ten,
				dat: false,
				vi: `do nhung KHONG goi ten: ${thieu.map((x) => JSON.stringify(x)).join(", ")}`,
			});
		} else {
			ket.push({ ten: ca.ten, dat: true, vi: "" });
		}
	} catch (loi) {
		ket.push({
			ten: ca.ten,
			dat: false,
			vi: `than ca nem: ${String(loi?.message ?? loi).slice(0, 200)}`,
		});
	} finally {
		await ban.don();
	}
}

let do_ = 0;
for (const k of ket) {
	console.log(`${k.dat ? "dat " : "SAI "} ${k.ten}${k.vi ? ` — ${k.vi}` : ""}`);
	if (!k.dat) do_++;
}

if (ket.length !== CA.length) {
	console.log(
		`\nSAI: chay ${ket.length} ca nhung khai ${CA.length}. Mot ca bien mat khong ` +
			"duoc coi la mot ca dat.",
	);
	process.exit(1);
}

console.log(`\n${ket.length - do_}/${ket.length} ca pha thu dat`);
process.exit(do_ === 0 ? 0 : 1);
