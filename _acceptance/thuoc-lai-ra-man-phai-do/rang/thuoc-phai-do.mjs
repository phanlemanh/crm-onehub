import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { luotCua } from "../../chan-lai-component-ra-man/rang/luot-chay.mjs";

const GOC = join(import.meta.dirname, "..", "..", "..");
const SPEC = "packages/ui/test/lai-ra-man.spec.tsx";
const CHAM = "_acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs";
const KHAI = "_acceptance/thuoc-lai-ra-man-phai-do/khai-khong-ve-duoc.json";

function nodeModules(goc) {
	const ra = [];
	const di = (tuongDoi, sau) => {
		if (sau > 3) return;
		for (const ten of readdirSync(join(goc, tuongDoi), { withFileTypes: true })) {
			if (!ten.isDirectory()) continue;
			const duong = tuongDoi ? join(tuongDoi, ten.name) : ten.name;
			if (ten.name === "node_modules") ra.push(duong);
			else if (!ten.name.startsWith(".")) di(duong, sau + 1);
		}
	};
	di("", 0);
	return ra;
}

function donBanSao(d) {
	rmSync(luotCua(d), { recursive: true, force: true });
	rmSync(d, { recursive: true, force: true });
}

function banSao() {
	const d = mkdtempSync(join(tmpdir(), "tlr-"));
	execFileSync("bash", ["-c", `git -C "${GOC}" archive HEAD | tar -x -C "${d}"`]);
	for (const nm of nodeModules(GOC)) {
		execFileSync("bash", [
			"-c",
			`mkdir -p "${join(d, dirname(nm))}" && ln -s "${join(GOC, nm)}" "${join(d, nm)}"`,
		]);
	}
	return d;
}

function chay(cwd, lenh, them = {}) {
	const r = spawnSync("bash", ["-c", lenh], {
		cwd,
		encoding: "utf8",
		env: { ...process.env, ...them },
	});
	return { ma: r.status ?? 1, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

function taoPham(d, ten) {
	return join(luotCua(d), ten);
}

function ve(d) {
	rmSync(taoPham(d, "ve-that.json"), { force: true });
	return chay(
		join(d, "packages/ui"),
		'bun test --preload ./test/setup-dom.ts test/lai-ra-man.spec.tsx -t "lai tung component ra man"',
	);
}

function docVe(d) {
	const p = taoPham(d, "ve-that.json");
	return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
}

function suaTep(d, tuongDoi, tu, den) {
	const p = join(d, tuongDoi);
	const s = readFileSync(p, "utf8");
	if (!s.includes(tu)) {
		console.error(`TIEM-HONG: khong tim thay doan can thay trong ${tuongDoi}`);
		process.exit(2);
	}
	writeFileSync(p, s.replace(tu, den));
	return readFileSync(p, "utf8") !== s;
}

function xoaMotComponent(d) {
	const ve0 = docVe(d);
	const khai = JSON.parse(readFileSync(join(d, KHAI), "utf8"));
	const ung = Object.keys(ve0).find(
		(f) => !(f in khai) && f.startsWith("packages/ui/src/components/"),
	);
	if (!ung) {
		console.error("TIEM-HONG: khong co component nao ngoai ban khai de pha");
		process.exit(2);
	}
	rmSync(join(d, ung));
	return ung;
}

function phaMotComponent(d) {
	const ve0 = docVe(d);
	const khai = JSON.parse(readFileSync(join(d, KHAI), "utf8"));
	const ung = Object.keys(ve0).find(
		(f) => !(f in khai) && f.startsWith("packages/ui/src/components/"),
	);
	if (!ung) {
		console.error("TIEM-HONG: khong co component nao ngoai ban khai de pha");
		process.exit(2);
	}
	const p = join(d, ung);
	const truoc = readFileSync(p, "utf8");
	writeFileSync(p, `throw new Error("vo");\n${truoc}`);
	if (readFileSync(p, "utf8") === truoc) {
		console.error("TIEM-HONG: pha component khong doi duoc mot dong nao");
		process.exit(2);
	}
	return ung;
}

function ketCa(nhan, duong, do_) {
	console.log(`CHIEU-DUONG ma=${duong.ma}`);
	console.log(`CHIEU-DO ma=${do_.ma}`);
	const moi = do_.ra.match(new RegExp(`${nhan}[^\\n]*`, "g")) || [];
	const bat = moi.find((t) => !t.includes("${")) || moi[0] || "";
	console.log(`CHIEU-DO thong-diep=${bat}`);
	if (duong.ma !== 0) {
		console.error(`${nhan}: doi chung duong KHONG xanh — ca chua chay duoc`);
		return 1;
	}
	if (do_.ma === 0) {
		console.error(`${nhan}: chieu do KHONG do — thuoc khong bat duoc vat da pha`);
		return 1;
	}
	if (!bat) {
		console.error(`${nhan}: chieu do do nhung THIEU thong diep ghim nhan`);
		console.error(`--- 600 ky tu cuoi cua chieu do ---\n${do_.ra.slice(-600)}`);
		return 1;
	}
	return 0;
}

const VO_HIEU = process.env.TLR_VO_HIEU_TIEM || "";

function kiemMotNguon(d) {
	const banVe = docVe(d);
	if (!banVe) return { ma: 2, ra: "KHONG DO DUOC: khong co ban ve" };
	const chet = Object.keys(banVe).filter((f) => !existsSync(join(d, f)));
	if (chet.length)
		return {
			ma: 1,
			ra: `MOT-NGUON: ben ve con tro ${chet.join(", ")} ma cay khong con`,
		};
	return { ma: 0, ra: "" };
}

function caMotNguon() {
	const d = banSao();
	try {
		const v = ve(d);
		if (v.ma !== 0) return { ma: 2, ra: `KHONG DO DUOC: ban sao khong ve duoc\n${v.ra.slice(-800)}` };
		const duong = kiemMotNguon(d);
		if (VO_HIEU !== "mot-nguon") {
			suaTep(
				d,
				SPEC,
				"const macDinh = MOI_MAC_DINH.docMacDinh(GOC_KHO);",
				'const macDinh = JSON.parse(readFileSync(join(HO_SO, "evidence", "mac-dinh.json"), "utf8")) as { file: string }[];',
			);
			xoaMotComponent(d);
		}
		ve(d);
		const do_ = kiemMotNguon(d);
		return { ma: ketCa("MOT-NGUON", duong, do_), ra: "" };
	} finally {
		donBanSao(d);
	}
}

function phanNhomTrong(d) {
	rmSync(taoPham(d, "phan-nhom.json"), { force: true });
	return chay(d, `node ${CHAM} phan-nhom`);
}

function docPhanNhom(d) {
	const p = taoPham(d, "phan-nhom.json");
	return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
}

function kiemHongMotChieu(d) {
	const banVe = docVe(d);
	const pn = docPhanNhom(d);
	if (!banVe || !pn) return { ma: 2, ra: "KHONG DO DUOC: thieu ban ve hoac phan nhom" };
	const khongVe = new Set(pn.khong_ve_duoc.map((x) => x.file));
	const loi = [];
	for (const [f, ban] of Object.entries(banVe)) {
		const tron = ban.some((b) => b.loi_dong === null && b.loi_mo === null);
		if (!tron && !khongVe.has(f)) loi.push(f);
	}
	if (loi.length)
		return {
			ma: 1,
			ra: `HONG-MOT-CHIEU: ${loi.join(", ")} hong nhung lot luoi phan nhom`,
		};
	const mau = Object.values(banVe).flat()[0];
	const truongBanVe = new Set(Object.keys(mau || {}));
	for (const t of ["xuat", "dong", "mo", "loi_dong", "loi_mo"]) {
		if (!truongBanVe.has(t))
			return {
				ma: 1,
				ra: `SAN-KHUON: ban cham doc ${t}, ban ve co ${[...truongBanVe].join(",")}`,
			};
	}
	return { ma: 0, ra: "" };
}

function caHongMotChieu() {
	const d = banSao();
	try {
		const v = ve(d);
		if (v.ma !== 0) return { ma: 2, ra: "KHONG DO DUOC: ban sao khong ve duoc" };
		phanNhomTrong(d);
		const duong = kiemHongMotChieu(d);
		if (VO_HIEU !== "hong-mot-chieu") {
			suaTep(
				d,
				CHAM,
				"const tron = ban.filter((b) => b.loi_dong === null && b.loi_mo === null);\n\t\tif (tron.length === 0) {",
				"const tron = ban.filter((b) => b.loi_dong !== null && b.loi_mo !== null);\n\t\tif (tron.length === ban.length && ban.length > 0) {",
			);
		}
		phanNhomTrong(d);
		const do_ = kiemHongMotChieu(d);
		return { ma: ketCa("HONG-MOT-CHIEU", duong, do_), ra: "" };
	} finally {
		donBanSao(d);
	}
}

function caBoVeChet() {
	const d = banSao();
	try {
		const v = ve(d);
		if (v.ma !== 0) return { ma: 2, ra: "KHONG DO DUOC: ban sao khong ve duoc" };
		const duong = phanNhomTrong(d);
		if (VO_HIEU !== "bo-ve-chet")
			suaTep(d, SPEC, "import { expect, test } from \"bun:test\";", "import { expect, test } from \"bun:test\"; const ((((;");
		const do_ = phanNhomTrong(d);
		return { ma: ketCa("BO-VE-CHET", duong, do_), ra: "" };
	} finally {
		donBanSao(d);
	}
}

function boMotMucKhoiKhai(d) {
	const p = join(d, KHAI);
	const khai = JSON.parse(readFileSync(p, "utf8"));
	const ten = Object.keys(khai)[0];
	if (!ten) {
		console.error("TIEM-HONG: ban khai rong, khong co muc de bo");
		process.exit(2);
	}
	delete khai[ten];
	writeFileSync(p, `${JSON.stringify(khai, null, "\t")}\n`);
	return ten;
}

function caDemDu() {
	const d = banSao();
	try {
		const duong = ve(d);
		if (duong.ma === 0 && VO_HIEU !== "dem-du") boMotMucKhoiKhai(d);
		const do_ = ve(d);
		return { ma: ketCa("DEM-DU", duong, do_), ra: "" };
	} finally {
		donBanSao(d);
	}
}

function banChung(d) {
	return chay(
		d,
		'git status --porcelain -- _acceptance/chan-lai-component-ra-man/evidence/',
	);
}

function caKhongBanCay() {
	const d = banSao();
	try {
		chay(d, "git init -q . && git add -A && git -c user.email=t@t -c user.name=t commit -qm nen");
		const v = ve(d);
		const banVe = docVe(d);
		if (v.ma !== 0 || !banVe || Object.keys(banVe).length === 0)
			return { ma: 2, ra: "KHONG DO DUOC: luot chay khong song" };
		const sach = banChung(d);
		const duong = {
			ma: sach.ra.trim() === "" ? 0 : 1,
			ra: sach.ra.trim() === "" ? "" : `KHONG-BAN-CAY: ${sach.ra.trim()}`,
		};
		if (VO_HIEU !== "khong-ban-cay")
			suaTep(
				d,
				"_acceptance/chan-lai-component-ra-man/rang/luot-chay.mjs",
				"export const LUOT = luotCua(GOC);",
				'export const LUOT = join(GOC, "_acceptance", "chan-lai-component-ra-man", "evidence");',
			);
		ve(d);
		const ban = banChung(d);
		const do_ = {
			ma: ban.ra.trim() === "" ? 0 : 1,
			ra: ban.ra.trim() === "" ? "" : `KHONG-BAN-CAY: ${ban.ra.trim().split("\n")[0]}`,
		};
		return { ma: ketCa("KHONG-BAN-CAY", duong, do_), ra: "" };
	} finally {
		donBanSao(d);
	}
}

function docLenhCong(d) {
	const cfg = readFileSync(join(d, "_acceptance/config.yaml"), "utf8");
	const dong = cfg
		.split("\n")
		.find((l) => l.trim().startsWith("cl_tieng_viet_den_man:"));
	if (!dong) {
		console.error(
			"QUA-CONG: config khong con khoa cl_tieng_viet_den_man — cong khong con duong nao goi toi thuoc nay",
		);
		process.exit(1);
	}
	return dong.slice(dong.indexOf(":") + 1).trim().replace(/^"|"$/g, "");
}

function lenhCong(d) {
	const r = chay(d, docLenhCong(d));
	return {
		ma: r.ma,
		ra: r.ma === 0 ? r.ra : `QUA-CONG: lenh cong thoat ${r.ma}\n${r.ra.slice(-600)}`,
	};
}

function caQuaLenhCong() {
	const d = banSao();
	try {
		const duong = lenhCong(d);
		if (duong.ma !== 0) return { ma: 2, ra: `KHONG DO DUOC: lenh cong khong xanh tren ban sao nguyen ven\n${duong.ra.slice(-800)}` };
		ve(d);
		if (VO_HIEU !== "qua-lenh-cong") phaMotComponent(d);
		const do_ = lenhCong(d);
		return { ma: ketCa("QUA-CONG", duong, do_), ra: "" };
	} finally {
		donBanSao(d);
	}
}

const CA = {
	"mot-nguon": caMotNguon,
	"hong-mot-chieu": caHongMotChieu,
	"bo-ve-chet": caBoVeChet,
	"dem-du": caDemDu,
	"khong-ban-cay": caKhongBanCay,
	"qua-lenh-cong": caQuaLenhCong,
};

const NHAN = {
	"mot-nguon": "MOT-NGUON",
	"hong-mot-chieu": "HONG-MOT-CHIEU",
	"bo-ve-chet": "BO-VE-CHET",
	"dem-du": "DEM-DU",
	"khong-ban-cay": "KHONG-BAN-CAY",
	"qua-lenh-cong": "QUA-CONG",
};

function caCapHaiChieu() {
	let loi = 0;
	for (const ten of Object.keys(NHAN)) {
		const r = chay(
			GOC,
			`node ${join("_acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs")} ${ten}`,
		);
		const duong = r.ra.match(/CHIEU-DUONG ma=(\d+)/);
		const do_ = r.ra.match(/CHIEU-DO ma=(\d+)/);
		const td = r.ra.match(/CHIEU-DO thong-diep=(.*)/);
		if (!duong || !do_ || !td) {
			console.error(`CAP-HAI-CHIEU: ca ${ten} khong phat du ba so lieu may doc duoc`);
			loi += 1;
			continue;
		}
		if (duong[1] !== "0") {
			console.error(`CAP-HAI-CHIEU: ca ${ten} chieu duong ma=${duong[1]}, phai 0`);
			loi += 1;
		}
		if (do_[1] === "0") {
			console.error(`CAP-HAI-CHIEU: ca ${ten} chieu do ma=0 — chua bao gio do`);
			loi += 1;
		}
		if (!td[1].includes(NHAN[ten])) {
			console.error(
				`CAP-HAI-CHIEU: ca ${ten} thieu nhan ${NHAN[ten]} trong thong diep chieu do`,
			);
			loi += 1;
		}
		console.log(`${ten}: duong=${duong[1]} do=${do_[1]} nhan=${NHAN[ten]}`);
	}
	if (loi > 0) return { ma: 1, ra: "" };
	const r = chay(
		GOC,
		"node _acceptance/thuoc-lai-ra-man-phai-do/rang/thuoc-phai-do.mjs dem-du",
		{ TLR_VO_HIEU_TIEM: "dem-du" },
	);
	const voHieu = r.ra.match(/CHIEU-DO ma=(\d+)/);
	console.log(`vo-hieu-tiem dem-du: chieu-do ma=${voHieu ? voHieu[1] : "?"}`);
	if (!voHieu || voHieu[1] !== "0") {
		console.error(
			"CAP-HAI-CHIEU: vo hieu phep tiem cua dem-du ma ca do van bao chieu-do khac 0 — ca dang do vi ly do khac, khong vi vat bi pha",
		);
		return { ma: 1, ra: "" };
	}
	console.log("XANH: moi ca deu co cap hai chieu do bang ma thoat.");
	return { ma: 0, ra: "" };
}

CA["cap-hai-chieu"] = caCapHaiChieu;

const dong_tu = process.argv[2];
if (!CA[dong_tu]) {
	console.error(
		`dong tu khong biet: ${dong_tu} — nhan ${Object.keys(CA).join(" | ")}`,
	);
	process.exit(2);
}
const kq = CA[dong_tu]();
if (kq.ra) console.error(kq.ra);
console.log(`THUOC KET LUAN: ${dong_tu} — ma thoat cua lenh ${kq.ma}`);
process.exit(kq.ma);
