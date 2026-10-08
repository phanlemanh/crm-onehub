import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	realpathSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const SLUG = "chen-lien-ket-khong-lac";
const UI = join(GOC, "packages", "ui");
const TP = join(UI, "src", "components");
const TEP_KIEM = "test/trinh-soan-lien-ket.dom.tsx";
const SHA_GHIM = "0426cc9d0bebd747b1e75eacb3bcd4069ef161e1";
const BAN_GHIM = join(
	GOC,
	"_acceptance",
	SLUG,
	"fixtures",
	"test-truoc.dom.tsx.txt",
);
const TRAN_LUOT_MS = 180_000;
const DAU_KHOI_MOI = '\ndescribe("chen-lien-ket-go"';
const BAI_MOI =
	"chen-lien-ket-go > chen-lien-ket: go trinh soan khi hop dang mo thi khong loi chua bat";
const CHU_LOI = "commandManager";
const LOP_CHAN = "if (editor && !editor.isDestroyed) editor.commands.focus();";
const GOI_CU = "editor?.commands.focus();";
const DAU_SO_SANH = "error: expect(received).toEqual(expected)";
const DAU_SO_SANH_ESC = "error: expect(received).toBe(expected)";
const BAI_ESC = "chen-lien-ket: Esc dong hop va tra focus ve trinh soan";
const DONG_FOCUS =
	"\t\texpect(editor.view.dom.contains(document.activeElement)).toBe(true);\n";
const DONG_CHO = "\t\tawait choTraFocus(editor);\n";
const CHO_CHAM_MS = 60;
const HAN_ESC_MS = { duoi: 1500, tren: 4000 };
const CHE_DO = ["xanh", "do", "cham", "mat"];
const DOT_BIEN = {
	do: GOI_CU,
	cham: `setTimeout(() => { ${LOP_CHAN} }, ${CHO_CHAM_MS});`,
	mat: "",
};

const NOI = {
	"trinh-soan-lien-ket.dom.tsx": [
		['from "../src/components/trinh-soan"', 'from "./trinh-soan"'],
		[
			'from "../src/components/trinh-soan-lien-ket-trang"',
			'from "./trinh-soan-lien-ket-trang"',
		],
		['from "./trinh-soan-vat"', `from "${join(UI, "test", "trinh-soan-vat")}"`],
	],
	"trinh-soan.tsx": [
		[
			'from "@crm/ui/components/trinh-soan-thanh-cong-cu"',
			'from "./trinh-soan-thanh-cong-cu"',
		],
		[
			'from "@crm/ui/components/trinh-soan-lien-ket-trang"',
			'from "./trinh-soan-lien-ket-trang"',
		],
	],
	"trinh-soan-thanh-cong-cu.tsx": [],
	"trinh-soan-lien-ket-trang.tsx": [],
};

class KhongDo extends Error {}

function dem(chu, con) {
	return chu.split(con).length - 1;
}

function thayMotLan(chu, cu, moi, ten) {
	if (dem(chu, cu) !== 1)
		throw new KhongDo(`moc ${ten} xuat hien ${dem(chu, cu)} lan, can 1`);
	return chu.replace(cu, moi);
}

function nguon(ten) {
	return ten.endsWith(".dom.tsx") ? join(UI, TEP_KIEM) : join(TP, ten);
}

function kiemBanGhim() {
	const ghim = readFileSync(BAN_GHIM, "utf8");
	const git = spawnSync(
		"git",
		["show", `${SHA_GHIM}:packages/ui/${TEP_KIEM}`],
		{ cwd: GOC, encoding: "utf8" },
	);
	if (git.status !== 0) throw new KhongDo(`git show ${SHA_GHIM} that bai`);
	if (git.stdout !== ghim)
		throw new KhongDo("ban ghim khong con la writer that (lech git show)");
	const hien = readFileSync(join(UI, TEP_KIEM), "utf8");
	const i = hien.indexOf(DAU_KHOI_MOI);
	if (i < 0 || dem(hien, DAU_KHOI_MOI) !== 1)
		throw new KhongDo("khong thay dung mot khoi chen-lien-ket-go");
	return (
		hien.slice(0, i) ===
		thayMotLan(ghim, DONG_FOCUS, `${DONG_CHO}${DONG_FOCUS}`, "khang dinh focus")
	);
}

function ganGoi(thuMuc) {
	const nm = join(thuMuc, "node_modules");
	const crm = join(nm, "@crm");
	mkdirSync(crm, { recursive: true });
	for (const ten of readdirSync(join(UI, "node_modules"))) {
		if (ten === "@crm") continue;
		symlinkSync(realpathSync(join(UI, "node_modules", ten)), join(nm, ten));
	}
	for (const ten of readdirSync(join(UI, "node_modules", "@crm")))
		symlinkSync(
			realpathSync(join(UI, "node_modules", "@crm", ten)),
			join(crm, ten),
		);
	symlinkSync(UI, join(crm, "ui"));
}

function dungBanSao(chieu) {
	const thuMuc = join(
		GOC,
		".acceptance-runs",
		SLUG,
		`sao-${chieu}-${process.pid}`,
	);
	rmSync(thuMuc, { recursive: true, force: true });
	mkdirSync(thuMuc, { recursive: true });
	ganGoi(thuMuc);
	for (const [ten, doi] of Object.entries(NOI)) {
		let chu = readFileSync(nguon(ten), "utf8");
		for (const [cu, moi] of doi)
			chu = thayMotLan(chu, cu, moi, `${ten}: ${cu}`);
		if (ten === "trinh-soan-lien-ket-trang.tsx" && chieu in DOT_BIEN)
			chu = thayMotLan(chu, LOP_CHAN, DOT_BIEN[chieu], "lop chan");
		if (
			ten === "trinh-soan-lien-ket-trang.tsx" &&
			chieu === "xanh" &&
			dem(chu, LOP_CHAN) !== 1
		)
			throw new KhongDo("thanh phan HEAD khong co lop chan");
		writeFileSync(join(thuMuc, ten), chu);
	}
	return thuMuc;
}

function vietBanGhimVao(thuMuc) {
	let chu = readFileSync(BAN_GHIM, "utf8");
	for (const [cu, moi] of NOI["trinh-soan-lien-ket.dom.tsx"])
		chu = thayMotLan(chu, cu, moi, `ban ghim: ${cu}`);
	writeFileSync(join(thuMuc, "trinh-soan-lien-ket.dom.tsx"), chu);
}

function chay(thuMuc, loc) {
	const kq = spawnSync(
		"bun",
		[
			"test",
			"--preload",
			join(UI, "test", "setup-dom.ts"),
			"./trinh-soan-lien-ket.dom.tsx",
			...(loc ? ["-t", loc] : []),
		],
		{
			cwd: thuMuc,
			encoding: "utf8",
			timeout: TRAN_LUOT_MS,
			env: { ...process.env, TZ: "Asia/Ho_Chi_Minh" },
		},
	);
	if (kq.error) throw new KhongDo(`bun khong chay xong: ${kq.error.message}`);
	return { ma: kq.status, dong: `${kq.stdout}\n${kq.stderr}`.split("\n") };
}

function khoiBaiMoi(dong) {
	const ket = dong.findIndex((d) => d.startsWith(`(fail) ${BAI_MOI}`));
	if (ket < 0) return null;
	const dau = dong
		.slice(0, ket)
		.findLastIndex((d) => d.startsWith(DAU_SO_SANH));
	return dau < 0 ? null : { dau, ket };
}

function khoiEsc(dong) {
	const ket = dong.findIndex((d) =>
		d.includes(`(fail) chen-lien-ket-ui > ${BAI_ESC}`),
	);
	if (ket < 0) return null;
	const dau = dong
		.slice(0, ket)
		.findLastIndex((d) => d.startsWith(DAU_SO_SANH_ESC));
	return dau < 0
		? null
		: { khoi: dong.slice(dau, ket + 1), dongFail: dong[ket] };
}

function motBaiChay(dong) {
	return dong.some((d) => /^Ran 1 test across 1 file/.test(d));
}

function chamCham(thuMuc) {
	const moi = chay(thuMuc, BAI_ESC);
	const okMoi =
		moi.ma === 0 &&
		motBaiChay(moi.dong) &&
		moi.dong.some((d) => /^\s*1 pass$/.test(d));
	vietBanGhimVao(thuMuc);
	const cu = chay(thuMuc, BAI_ESC);
	const k = khoiEsc(cu.dong);
	const okCu =
		cu.ma !== 0 &&
		motBaiChay(cu.dong) &&
		k !== null &&
		[
			"Expected: true",
			"Received: false",
			"trinh-soan-lien-ket.dom.tsx:205",
		].every((c) => k.khoi.some((d) => d.includes(c)));
	const ra = [
		`bai Esc moi tren ban sao cham: ${okMoi ? "pass" : `KHONG pass (ma ${moi.ma})`}`,
		`bai Esc cu tren ban sao cham: ${okCu ? "do dung chu ky :205 Expected true / Received false" : `KHONG do dung chu ky (ma ${cu.ma})`}`,
	];
	if (!okMoi) ra.push("bai Esc moi khong cho du", ...moi.dong.slice(-30));
	if (!okCu)
		ra.push("ban sao cham khong tai hien loi cu", ...cu.dong.slice(-30));
	return { ma: okMoi && okCu ? 0 : 1, ra };
}

function chamMat(thuMuc) {
	const r = chay(thuMuc, BAI_ESC);
	const k = khoiEsc(r.dong);
	const ms = k ? Number(/\[([\d.]+)ms\]/.exec(k.dongFail)?.[1]) : Number.NaN;
	const loi = [];
	if (!k) loi.push("(a) khong co dong (fail) cua bai Esc");
	else {
		if (
			!["Expected: true", "Received: false"].every((c) =>
				k.khoi.some((d) => d.includes(c)),
			)
		)
			loi.push("(b) khoi bai Esc thieu Expected true / Received false");
		if (!(ms >= HAN_ESC_MS.duoi && ms <= HAN_ESC_MS.tren))
			loi.push(
				`(d) thoi gian bai ${ms}ms ngoai ${HAN_ESC_MS.duoi}–${HAN_ESC_MS.tren}`,
			);
	}
	if (r.dong.some((d) => /timed out/i.test(d))) loi.push("(c) co timed out");
	if (!motBaiChay(r.dong)) loi.push("khong dung 1 bai duoc chay");
	return {
		ma: loi.length === 0 ? 0 : 1,
		ra: [
			`bai Esc tren ban sao khong tra focus: ${loi.length === 0 ? `do dung sau ${ms}ms` : "LECH"}`,
			...loi,
			...(loi.length ? r.dong.slice(-30) : []),
		],
	};
}

function cham(chieu, { ma, dong }) {
	const dongLoi = dong
		.map((d, i) => [d, i])
		.filter(([d]) => d.includes(CHU_LOI));
	const fail = dong.filter((d) => d.startsWith("(fail) "));
	if (chieu === "xanh") {
		const ok =
			ma === 0 &&
			dong.some((d) => /^\s*0 fail$/.test(d)) &&
			dongLoi.length === 0 &&
			fail.length === 0;
		return {
			ma: ok ? 0 : 1,
			ra: [
				`bun ma ${ma}, ${fail.length} bai do, ${dongLoi.length} dong ${CHU_LOI}`,
				...(ok ? [] : dong.slice(-40)),
			],
		};
	}
	const khoi = khoiBaiMoi(dong);
	const trong = khoi
		? dongLoi.filter(([, i]) => i >= khoi.dau && i <= khoi.ket).length
		: 0;
	const ngoai = dongLoi.length - trong;
	const ok =
		ma !== 0 && fail.length === 1 && khoi !== null && trong > 0 && ngoai >= 2;
	return {
		ma: ok ? 0 : 1,
		ra: [
			`bun ma ${ma}, bai do: ${fail.map((d) => d.slice(7, 80)).join(" | ") || "khong"}`,
			`${CHU_LOI} trong khoi bai moi: ${trong}, ngoai khoi: ${ngoai}`,
			...(ok ? [] : dong.slice(-40)),
		],
	};
}

function chinh() {
	const chieu = process.argv[2];
	if (!CHE_DO.includes(chieu)) {
		console.log(`KHONG DO DUOC: doi so phai la ${CHE_DO.join(" | ")}`);
		process.exit(2);
	}
	let thuMuc;
	try {
		for (const ten of Object.keys(NOI))
			if (!existsSync(nguon(ten))) throw new KhongDo(`vang ${nguon(ten)}`);
		console.log(`goc: ${GOC}`);
		if (chieu === "xanh" && !kiemBanGhim()) {
			console.log("tep test cu bi doi ngoai khoi moi");
			process.exitCode = 1;
			return;
		}
		thuMuc = dungBanSao(chieu);
		const ket =
			chieu === "cham"
				? chamCham(thuMuc)
				: chieu === "mat"
					? chamMat(thuMuc)
					: cham(chieu, chay(thuMuc));
		for (const d of ket.ra) console.log(d);
		process.exitCode = ket.ma;
	} catch (e) {
		if (!(e instanceof KhongDo)) {
			console.log(
				`KHONG DO DUOC: ${e instanceof Error ? e.message : String(e)}`,
			);
			process.exitCode = 2;
			return;
		}
		console.log(`KHONG DO DUOC: ${e.message}`);
		process.exitCode = 2;
	} finally {
		if (thuMuc) rmSync(thuMuc, { recursive: true, force: true });
	}
}

if (import.meta.main) chinh();
