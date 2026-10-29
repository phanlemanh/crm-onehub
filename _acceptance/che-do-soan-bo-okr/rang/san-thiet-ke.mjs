import { spawnSync } from "node:child_process";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chayTrongSao, donSao, dungSao } from "./man-soan-chieu-do.mjs";
import { DO } from "./man-soan-du-lieu.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const HO_SO = "che-do-soan-bo-okr";
const HTML_CUA = (cay) => join(cay, ".acceptance-runs", HO_SO, "html");
const DUOI_HTML = new Set([".html", ".htm"]);
const LUAT_MAU = new Set(["low-contrast", "gray-on-color"]);
const EVAL_DUNG_HTML = "E16";
const DAU_KIEU_DA_TINH = /<html[^>]*\sdata-kieu-da-tinh=/;
const DAU_DOC_BYTE = 4096;
const MA = { dat: 0, sai: 1, khongDo: 2 };
const VET_DO = {
	tep: "apps/app/app/(app)/[slug]/okr/soan-bo/khoi-chat-luong.tsx",
	cu: 'className="font-medium text-sm tabular-nums"',
	moi: 'className="font-medium text-sm tabular-nums text-[#e5e5e5]"',
	mau: "#e5e5e5",
	trangThai: "gop-y",
};

const HTML_MONG = DO.html.flatMap((tt) => [
	`${tt}-${DO.kho.rong.ten}.html`,
	`${tt}-${DO.kho.hep.ten}.html`,
]);

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(MA.khongDo);
}

function timDesignGate() {
	const r = spawnSync(
		"node",
		[
			join(GOC, "scripts", "resolve-plugin.mjs"),
			"--plugin",
			"acceptance-gate",
			"--require",
			"scripts/design-gate.mjs",
			"--require",
			"scripts/design-scan.js",
		],
		{ encoding: "utf8" },
	);
	if (r.status !== 0)
		khongDo(
			`khong tim duoc design-gate.mjs cua bo kit acceptance-gate: ${(r.stderr ?? "").trim()}`,
		);
	return join(r.stdout.trim(), "scripts", "design-gate.mjs");
}

function cham(gate, tep) {
	const laHtml = DUOI_HTML.has(extname(tep).toLowerCase());
	const thamSo = laHtml
		? [gate, tep, "--mode", "dom", "--jsdom", GOC]
		: [gate, tep, "--mode", "static"];
	const r = spawnSync("node", thamSo, { encoding: "utf8" });
	let kq;
	try {
		kq = JSON.parse(r.stdout);
	} catch {
		return {
			tep,
			khongDo: `design-gate khong tra JSON (ma ${r.status}): ${(r.stderr || r.stdout || "").trim().slice(0, 300)}`,
		};
	}
	if (kq.do_duoc === false)
		return { tep, khongDo: kq.ly_do_khong_do_duoc ?? kq.verdict };
	if (!laHtml)
		return { tep, khongDo: "khong phai HTML da dung (--require-html)" };
	if (!DAU_KIEU_DA_TINH.test(readFileSync(tep, "utf8").slice(0, DAU_DOC_BYTE)))
		return {
			tep,
			khongDo:
				"HTML chua mang kieu da tinh (data-kieu-da-tinh) — jsdom cua design-gate bo moi luat trong @layer nen khong thay mau Tailwind",
		};
	if (kq.verdict !== "PASS" && kq.verdict !== "REJECT")
		return { tep, khongDo: `${kq.verdict}: ${kq.reason ?? ""}`.trim() };
	const p0 = (kq.findings ?? []).filter((f) => f.pTier === "P0");
	return { tep, ma: r.status, verdict: kq.verdict, p0 };
}

function chamDanhSach(gate, cacTep) {
	const ketQua = cacTep.map((t) => cham(gate, t));
	const khong = ketQua.filter((k) => k.khongDo);
	for (const k of khong)
		console.log(`KHONG DO DUOC: ${relative(GOC, k.tep)} — ${k.khongDo}`);
	for (const k of ketQua.filter((x) => !x.khongDo)) {
		if (k.p0.length === 0) {
			console.log(`dat ${relative(GOC, k.tep)} (p0 0, ma ${k.ma})`);
			continue;
		}
		for (const f of k.p0)
			console.log(
				`HONG ${relative(GOC, k.tep)}: P0 ${f.rule} — ${f.detail} (ma ${k.ma})`,
			);
	}
	return ketQua;
}

function htmlMoi(thuMuc, tu) {
	const thieu = HTML_MONG.filter((ten) => {
		try {
			return statSync(join(thuMuc, ten)).mtimeMs < tu;
		} catch {
			return true;
		}
	});
	return { thieu, cacTep: HTML_MONG.map((ten) => join(thuMuc, ten)) };
}

async function dungHtml(cay) {
	const tu = Date.now();
	console.log(
		`-- dung lai HTML: ban do man ${EVAL_DUNG_HTML} trong phien do rieng (${relative(GOC, cay) || "."})`,
	);
	const { ma } = await chayTrongSao(cay, EVAL_DUNG_HTML);
	const { thieu, cacTep } = htmlMoi(HTML_CUA(cay), tu);
	if (thieu.length > 0)
		return {
			khongDo: `HTML thieu hay cu hon lan dung nay (${thieu.join(", ")}) — ban do ${EVAL_DUNG_HTML} ma ${ma}`,
		};
	if (ma === MA.khongDo)
		return { khongDo: `ban do ${EVAL_DUNG_HTML} ma 2 — HTML khong tin duoc` };
	console.log(
		`-- HTML ${cacTep.length}/${HTML_MONG.length} moi (ban do ${EVAL_DUNG_HTML} ma ${ma}${ma === MA.sai ? ", SAI cua E16 tu cham — khong thuoc E18" : ""})`,
	);
	return { cacTep };
}

async function lanhThuong(gate) {
	const { khongDo: kd, cacTep } = await dungHtml(GOC);
	if (kd) khongDo(kd);
	const ketQua = chamDanhSach(gate, cacTep);
	const khong = ketQua.filter((k) => k.khongDo);
	const p0 = ketQua.flatMap((k) => k.p0 ?? []);
	if (khong.length > 0) {
		console.log(
			`KET LUAN vk10 san thiet ke: KHONG DO DUOC ${khong.length}/${cacTep.length} tep`,
		);
		return MA.khongDo;
	}
	console.log(
		`KET LUAN vk10 san thiet ke: ${cacTep.length}/${HTML_MONG.length} HTML, ${p0.length} P0`,
	);
	return p0.length === 0 ? MA.dat : MA.sai;
}

function lanhTep(gate, cacTep) {
	console.log(`-- cham tep cho san, khong dung lai HTML: ${cacTep.join(", ")}`);
	const ketQua = chamDanhSach(
		gate,
		cacTep.map((t) => resolve(t)),
	);
	const khong = ketQua.filter((k) => k.khongDo);
	const p0 = ketQua.flatMap((k) => k.p0 ?? []);
	if (khong.length > 0) {
		console.log(
			`KET LUAN vk10 san thiet ke (--tep): KHONG DO DUOC ${khong.length}/${cacTep.length} tep`,
		);
		return MA.khongDo;
	}
	console.log(
		`KET LUAN vk10 san thiet ke (--tep): ${cacTep.length} tep, ${p0.length} P0`,
	);
	return p0.length === 0 ? MA.dat : MA.sai;
}

async function chieuDo(gate) {
	console.log(
		`== chieu do E18: ${VET_DO.tep} them ${VET_DO.mau} vao className`,
	);
	const s = dungSao("thiet-ke");
	try {
		const duong = join(s.sao, VET_DO.tep);
		const truoc = readFileSync(duong, "utf8");
		if (truoc.split(VET_DO.cu).length - 1 !== 1) {
			console.log(
				`KET LUAN chieu do E18: KHONG DO DUOC — vet khong cam duoc vao ${VET_DO.tep}`,
			);
			return MA.khongDo;
		}
		writeFileSync(duong, truoc.replace(VET_DO.cu, VET_DO.moi));
		const { khongDo: kd, cacTep } = await dungHtml(s.sao);
		if (kd) {
			console.log(`KET LUAN chieu do E18: KHONG DO DUOC — ${kd}`);
			return MA.khongDo;
		}
		const ketQua = chamDanhSach(gate, cacTep);
		const trung = ketQua.flatMap((k) =>
			(k.p0 ?? [])
				.filter(
					(f) =>
						LUAT_MAU.has(f.rule) &&
						String(f.detail).toLowerCase().includes(VET_DO.mau) &&
						k.ma !== 0,
				)
				.map((f) => ({ tep: k.tep, f, ma: k.ma })),
		);
		const tuTrangThai = trung.filter((x) =>
			x.tep.includes(`${VET_DO.trangThai}-`),
		);
		if (tuTrangThai.length > 0) {
			const { tep, f, ma } = tuTrangThai[0];
			console.log(
				`KET LUAN chieu do E18: DO DUNG GHIM — design-gate ma ${ma}, P0 ${f.rule} «${f.detail}» o ${relative(s.sao, tep)}`,
			);
			return MA.sai;
		}
		console.log(
			`KET LUAN chieu do E18: LOT — design-gate khong bao P0 ${[...LUAT_MAU].join("/")} cho ${VET_DO.mau}`,
		);
		return MA.dat;
	} finally {
		donSao(s);
	}
}

const gate = timDesignGate();
console.log(`design-gate: ${gate}`);
const argv = process.argv.slice(2);
const cacTep = argv.flatMap((a, i) =>
	a === "--tep" && argv[i + 1] ? [argv[i + 1]] : [],
);
const ma = argv.includes("--chieu-do")
	? await chieuDo(gate)
	: cacTep.length > 0
		? lanhTep(gate, cacTep)
		: await lanhThuong(gate);
process.exit(ma);
