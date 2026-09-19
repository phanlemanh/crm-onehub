import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CHAN_UI } from "../../ho-so-khai-dung-tieng/rang/bang-dot-bien.mjs";
import { bang, chay, GOC, ghim, giuKhoa, thoat } from "./chung.mjs";

const nhaKhoa = await giuKhoa("ban-khai-khop");
process.on("exit", nhaKhoa);

const HO_SO = "_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs";
const VUNG = "_acceptance/ho-so-khai-dung-tieng/evidence/vung-khai.json";
const EVALS = "_acceptance/ho-so-khai-dung-tieng/evals.yaml";

const evals = readFileSync(join(GOC, EVALS), "utf8");

function cacO(noi_dung) {
	const ra = [];
	const dong = noi_dung.split("\n");
	let nay = null;
	for (const d of dong) {
		const mo = /^ {2}- id: (\S+)\s*$/.exec(d);
		if (mo) {
			if (nay) ra.push(nay);
			nay = { id: mo[1], expected: [], paths: [], trong: null };
			continue;
		}
		if (!nay) continue;
		if (/^ {4}expected:/.test(d)) nay.trong = "expected";
		else if (/^ {4}paths:/.test(d)) nay.trong = "paths";
		else if (/^ {4}\w/.test(d)) nay.trong = null;
		else if (nay.trong === "expected") nay.expected.push(d);
		else if (nay.trong === "paths") {
			const m = /^\s*-\s*"?([^"]+?)"?\s*$/.exec(d);
			if (m) nay.paths.push(m[1]);
		}
	}
	if (nay) ra.push(nay);
	return ra;
}

function docDuong(d) {
	if (!d.includes("*")) {
		try {
			return readFileSync(join(GOC, d), "utf8");
		} catch {
			return null;
		}
	}
	const tienTo = d.replace(/\*+$/, "").replace(/\/+$/, "");
	const r = chay("git", [
		"-C",
		GOC,
		"ls-files",
		"--cached",
		"--others",
		"--exclude-standard",
		...(tienTo === "" ? [] : ["--", tienTo]),
	]);
	if (r.ma !== 0) return null;
	return r.ra
		.trim()
		.split("\n")
		.filter((t) => t !== "")
		.map((t) => {
			try {
				return readFileSync(join(GOC, t), "utf8");
			} catch {
				return null;
			}
		})
		.join("\n");
}

const O = cacO(evals);
ghim("so o trong evals.yaml cua ho so kia", O.length, 12);

console.log(
	"-- HAI VE cua AC-7, ca hai do QUAN HE giua BAN KHAI va BAN THAT.\n" +
		"   (a) moi hinh dang ma mot o mo ta trong dau nhay nguoc phai CON TON TAI trong\n" +
		"       chinh cac tep ma o do liet o `paths`. Ban cu chi grep evals.yaml tim hai\n" +
		'       chuoi chep cung ("CHUOI TRAN"), tuc do CHI DAN chu khong do DAU RA:\n' +
		"       mot API khac bi bo trong tuong lai se lot han. Hoi dong S4 vong 2 bat.\n" +
		"   (b) moi KHOA ma o hoi dong bao cham phai co chan do ghi ra. Danh sach khoa\n" +
		"       DOC TU `expected` cua o hoi dong, khong go lai lan hai.",
);

let hong = 0;
const hangA = [];
let soHinhDang = 0;

// Tu vung cua BAN KHAI, khong phai hinh dang cua BAN THAT: chung nam trong dau
// nhay nguoc vi o dang noi VE cau truc eval, nen quet chung se bao dong gia.
const BO_QUA = new Set([
	"bun",
	"git",
	"node",
	"exit",
	"PASS",
	"FAIL",
	"UNCERTAIN",
	"expected",
	"paths",
	"cmd",
	"criterion",
	"executor",
	"inputs",
	"status",
	"not-run",
	"evidence_required",
]);

for (const o of O) {
	if (o.paths.length === 0) continue;
	const doc = o.paths.map((d) => ({ d, noi: docDuong(d) }));
	for (const x of doc.filter((y) => y.noi === null)) {
		hangA.push(
			`DUONG CHET [duong-trong-paths-khong-doc-duoc:${o.id}:${x.d}]\n` +
				"        Nuot loi doc TUNG duong roi chi bao khi GOP LAI rong nghia la: doi ten\n" +
				"        mot tep trong paths thi o van do tren cac tep con song, va ket luan\n" +
				'        "moi hinh dang con ton tai" noi ve mot tap KHAC voi tap da khai.',
		);
		hong += 1;
	}
	const noi_dung = doc
		.filter((x) => x.noi !== null)
		.map((x) => x.noi)
		.join("\n");
	if (noi_dung.trim() === "") {
		hangA.push(
			`KHONG DOC DUOC GI [o-khai-duong-khong-doc-duoc:${o.id}] ${o.paths.join(" · ")}`,
		);
		hong += 1;
		continue;
	}
	const van = o.expected.join("\n");
	const hinh = [
		...new Set([
			// ten component / kieu: PascalCase, it nhat mot chu hoa o giua
			...[...van.matchAll(/\b([A-Z][a-z]+(?:[A-Z][a-z]+)+)\b/g)].map(
				(m) => m[1],
			),
			// thuoc tinh DOM viet nguyen van: lang="en", data-slot="..."
			...[...van.matchAll(/\b([a-z-]+="[^"]+")/g)].map((m) => m[1]),
			// tuyen tRPC / khoa long nhau: companies.byId
			...[...van.matchAll(/\b([a-z][a-zA-Z]*\.[a-z][a-zA-Z]+)\b/g)]
				.map((m) => m[1])
				.filter((t) => !/\.(tsx?|mjs|json|png|ya?ml|md|spec)$/.test(t)),
		]),
	].filter((t) => !BO_QUA.has(t));
	for (const h of hinh) {
		soHinhDang += 1;
		const coi = h.replace(/^[.$]/, "").split(/[(\s]/)[0];
		if (noi_dung.includes(coi)) {
			hangA.push(`con ton tai  ${o.id.padEnd(4)} ${JSON.stringify(h)}`);
		} else {
			hangA.push(
				`HINH DANG DA CHET [ban-khai-ta-hinh-dang-da-bo:${o.id}:${coi}] o ${o.id} mo ta ${JSON.stringify(h)} ma khong tep nao trong paths cua no con mang chuoi do`,
			);
			hong += 1;
		}
	}
}
bang(
	`-- VE (a): ${soHinhDang} hinh dang rut tu \`expected\` cua ${O.length} o:`,
	hangA,
);

const oHoiDong = O.find(
	(x) =>
		evals
			.slice(evals.indexOf(`  - id: ${x.id}`))
			.startsWith(`  - id: ${x.id}`) &&
		/executor: judgment/.test(
			evals.slice(
				evals.indexOf(`  - id: ${x.id}`),
				evals.indexOf(`  - id: ${x.id}`) + 200,
			),
		),
);
if (!oHoiDong) {
	thoat(
		2,
		"KHONG DO DUOC: khong tim thay o hoi dong (executor: judgment) trong evals.yaml.",
	);
}
const khai = oHoiDong.expected.join("\n");
const mKhoa =
	/KHOA BAT BUOC[^:]*:\s*o moi muc ([^;]+);\s*o moi phan tu cua\s*mang `cho`:\s*([^.]+)\./s.exec(
		khai.replace(/\n\s*/g, " "),
	);
if (!mKhoa) {
	thoat(
		2,
		`KHONG DO DUOC: o hoi dong ${oHoiDong.id} khong khai "KHOA BAT BUOC" theo khuon may doc duoc.`,
		"   Khong co ban khai thi chan nay chi con cach GO LAI danh sach — dung cai",
		"   hinh dang ma hoi dong S4 vong 2 vua bat.",
	);
}
const rut = (t) => [...t.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
const KHOA_MOI_MUC = rut(mKhoa[1]);
const KHOA_PHAN_TU = rut(mKhoa[2]);
console.log(
	`\n-- VE (b): doc TU o ${oHoiDong.id}: moi muc can ${KHOA_MOI_MUC.map((x) => JSON.stringify(x)).join(", ")};\n` +
		`   moi phan tu cua \`cho\` can ${KHOA_PHAN_TU.map((x) => JSON.stringify(x)).join(", ")}.`,
);
ghim("so khoa hoi dong bao cham", KHOA_MOI_MUC.length + KHOA_PHAN_TU.length, 6);

console.log(
	`\n-- Chay lai ${CHAN_UI.length} chan ui-check that de sinh lai ${VUNG}.`,
);
for (const c of CHAN_UI) {
	const r = chay("bun", [HO_SO, c]);
	if (r.ma !== 0) {
		thoat(
			2,
			`KHONG DO DUOC: chan ${c} thoat ${r.ma} tren cay sach — tien de hong.`,
			r.ra
				.split("\n")
				.slice(-10)
				.map((d) => `     ${d}`)
				.join("\n"),
		);
	}
}

const vung = JSON.parse(readFileSync(join(GOC, VUNG), "utf8"));
ghim("so muc trong vung-khai.json", Object.keys(vung).length, 8);

const MUC_CO_CHO = [
	"gioi-thieu",
	"tom-tat-lien-he",
	"nganh",
	"dong-thoi-gian",
	"khong-khai-thua",
	"khong-khai-thua-chuc-danh",
];
ghim("so muc phai co mang `cho`", MUC_CO_CHO.length, 6);

const hangB = [];
for (const [ten, m] of Object.entries(vung)) {
	for (const k of KHOA_MOI_MUC) {
		if (m[k] === undefined) {
			hangB.push(`THIEU KHOA [khoa-hoi-dong-khong-co-chan-do-ghi:${ten}.${k}]`);
			hong += 1;
		} else {
			hangB.push(`co khoa    ${ten}.${k}`);
		}
	}
	if (!Array.isArray(m.cho)) {
		if (MUC_CO_CHO.includes(ten)) {
			hangB.push(
				`THIEU MANG [khoa-hoi-dong-khong-co-chan-do-ghi:${ten}.cho]\n` +
					"        Bo qua LANG khi `cho` vang nghia la: mot hoi quy lam ghiVung thoi\n" +
					"        nhan `cho` se xoa sach NAM khang dinh tren tung phan tu, ma chan\n" +
					"        van xanh — vi phep kiem nam SAU cai guard nay.",
			);
			hong += 1;
		}
		continue;
	}
	for (const [i, pt] of m.cho.entries()) {
		for (const k of KHOA_PHAN_TU) {
			if (pt[k] === undefined) {
				hangB.push(
					`THIEU KHOA [khoa-hoi-dong-khong-co-chan-do-ghi:${ten}.cho[${i}].${k}]`,
				);
				hong += 1;
			} else {
				hangB.push(`co khoa    ${ten}.cho[${i}].${k}`);
			}
		}
	}
}
bang("-- VE (b): tung khoa da doi chieu:", hangB);

console.log(`ket qua: ${hong} cho ban khai lech ban that`);
process.exit(hong > 0 ? 1 : 0);
