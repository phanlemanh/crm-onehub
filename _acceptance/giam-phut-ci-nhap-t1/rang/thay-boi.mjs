import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chepVao, docTai, GOC, Ket, SHA_GHIM, SLUG, thuMucSach } from "./chung.mjs";

const yeuCau = createRequire(import.meta.url);
const BANG = [
	["giam-phut-acceptance", "E1", "AC-5"],
	["giam-phut-acceptance", "E2", "AC-6"],
	["giam-phut-acceptance", "E3", "AC-7"],
	["giam-phut-acceptance", "E5", "AC-12"],
	["ci-ma-tran-ba-o", "E1", "AC-4"],
	["ci-ma-tran-ba-o", "E3", "AC-3"],
];
const HO_SO_CU = [...new Set(BANG.map(([h]) => h))];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const giaTri = (v) => String(v ?? "").replace(/\s+#.*$/, "").trim().replace(/^["'](.*)["']$/, "$1");

function kiemCauTruc(goc, ghi) {
	const ey = yeuCau(join(GOC, "lib/eval-yaml.cjs"));
	const ac = yeuCau(join(GOC, "lib/ac-line.cjs"));
	const hopDong = readFileSync(join(goc, "_acceptance", SLUG, "contract.md"), "utf8");
	const thietKe = readFileSync(join(goc, "_acceptance", SLUG, "design.md"), "utf8");
	const acCo = new Set(ac.parseACBlock(hopDong).map((x) => x.id));
	const evMoi = ey.parseEvals(readFileSync(join(goc, "_acceptance", SLUG, "evals.yaml"), "utf8"), ["criterion", "status"]);
	for (const [hs, id, acId] of BANG) {
		const ev = ey.parseEvals(readFileSync(join(goc, "_acceptance", hs, "evals.yaml"), "utf8"), ["status", "superseded_by"]).find((e) => e.id === id);
		const conTro = giaTri(ev?.superseded_by);
		ghi(giaTri(ev?.status) === "not-run" && conTro === `${SLUG}#${acId}`, `${hs}/${id} -> ${acId}`, `status ${giaTri(ev?.status)}, superseded_by ${conTro}`);
		ghi(new RegExp(`(?<![\\w/-])${esc(hs)}/${esc(id)}(?![\\w-])`).test(thietKe), `the ${hs}/${id} trong design`, "the vang");
		ghi(acCo.has(acId), `${acId} co trong hop dong`, `${acId} khong co`);
		const song = evMoi.some((e) => giaTri(e.status) !== "not-run" && (String(e.criterion).match(/AC-\d+/g) ?? []).includes(acId));
		ghi(song, `${acId} co eval song`, `${acId} khong co eval song`);
	}
	for (const hs of HO_SO_CU) {
		const ghim = docTai(SHA_GHIM, `_acceptance/${hs}/evals.yaml`).split("\n");
		const nay = readFileSync(join(goc, "_acceptance", hs, "evals.yaml"), "utf8").split("\n");
		const them = BANG.filter(([h]) => h === hs).length * 2;
		const boThem = [...nay];
		let dungCho = true;
		for (const [, id, acId] of BANG.filter(([h]) => h === hs)) {
			const iId = boThem.indexOf(`  - id: ${id}`);
			const iCmd = boThem.findIndex((d, i) => i > iId && /^ {4}cmd: /.test(d));
			const hai = boThem.slice(iCmd + 1, iCmd + 3);
			if (iId < 0 || iCmd < 0 || hai[0] !== "    status: not-run" || hai[1] !== `    superseded_by: ${SLUG}#${acId}`) dungCho = false;
			else boThem.splice(iCmd + 1, 2);
		}
		ghi(dungCho && nay.length - ghim.length === them && boThem.join("\n") === ghim.join("\n"), `${hs}/evals.yaml chi them ${them} dong`, "doi dong khac");
	}
}

function kiemKit(goc, ghi, { daKy }) {
	const ec = yeuCau(join(GOC, "lib/evidence-core.cjs"));
	const baoCao = (() => {
		try {
			return readFileSync(join(goc, "_acceptance", SLUG, "evidence-report.md"), "utf8");
		} catch {
			return null;
		}
	})();
	const coKhoi = baoCao ? ec.extractEvalBlockExits(baoCao) : new Map();
	for (const [hs, id, acId] of BANG) {
		const r = ec.chungThayBoi({ root: goc, slug: hs, id, conTro: `${SLUG}#${acId}` });
		const hopLe = daKy ? r.ok || (r.lyDo === "ac-thay-khong-con-eval" && coKhoi.size === 0) : !r.ok && r.lyDo === "ho-so-thay-chua-ky";
		ghi(hopLe, `kit ${hs}/${id}: ${r.ok ? "ok" : r.lyDo}`, JSON.stringify(r));
	}
}

const k = new Ket();
const ghiK = (ok, nhan, ly) => k.kiem(ok, nhan, ly);
const ec = yeuCau(join(GOC, "lib/evidence-core.cjs"));
const tienLe = ec.chungThayBoi({ root: GOC, slug: "ci-ma-tran-ba-o", id: "E5", conTro: "thuoc-7-ngay-loc-pr#AC-4" });
k.kiem(tienLe.ok === true, "doi-chung-duong tien le ci-ma-tran-ba-o/E5", JSON.stringify(tienLe));
kiemCauTruc(GOC, ghiK);
const trangThai = readFileSync(join(GOC, "_acceptance", SLUG, "contract.md"), "utf8").match(/^status:\s*(\S+)/m)?.[1];
kiemKit(GOC, ghiK, { daKy: trangThai === "signed-off" });

const dungBan = (ten) => {
	const ban = thuMucSach(`thay-thu/${ten}`);
	chepVao(ban, `_acceptance/${SLUG}`, ...HO_SO_CU.map((h) => `_acceptance/${h}`));
	const p = join(ban, "_acceptance", SLUG, "contract.md");
	writeFileSync(p, readFileSync(p, "utf8").replace(/^status:\s*\S+/m, "status: signed-off"));
	return ban;
};
const banLanh = dungBan("lanh");
kiemKit(banLanh, (ok, nhan, ly) => k.kiem(ok, `ban-ky ${nhan}`, ly), { daKy: true });

const DOT_BIEN = [
	["tro-ac-99", (b) => {
		const p = join(b, "_acceptance/giam-phut-acceptance/evals.yaml");
		writeFileSync(p, readFileSync(p, "utf8").replace(`${SLUG}#AC-5`, `${SLUG}#AC-99`));
		return ec.chungThayBoi({ root: b, slug: "giam-phut-acceptance", id: "E1", conTro: `${SLUG}#AC-99` }).lyDo === "ac-thay-vang";
	}, "giam-phut-acceptance/E1 -> AC-5"],
	["xoa-the", (b) => {
		const p = join(b, "_acceptance", SLUG, "design.md");
		writeFileSync(p, readFileSync(p, "utf8").replaceAll("ci-ma-tran-ba-o/E3", "ci-ma-tran-ba-o E3"));
		return ec.chungThayBoi({ root: b, slug: "ci-ma-tran-ba-o", id: "E3", conTro: `${SLUG}#AC-3` }).lyDo === "thay-khong-nhan";
	}, "the ci-ma-tran-ba-o/E3 trong design"],
	["doi-dong-khac", (b) => {
		const p = join(b, "_acceptance/ci-ma-tran-ba-o/evals.yaml");
		writeFileSync(p, readFileSync(p, "utf8").replace("criterion: AC-2", "criterion: AC-2, AC-9"));
		return true;
	}, "ci-ma-tran-ba-o/evals.yaml chi them 4 dong"],
];
for (const [ca, pha, nhanSai] of DOT_BIEN) {
	const ban = dungBan(ca);
	const kitBat = pha(ban);
	const sai = [];
	kiemCauTruc(ban, (ok, nhan) => ok || sai.push(nhan));
	k.bat(ca, kitBat && sai.includes(nhanSai), `kit ${kitBat}, sai: ${sai.join(", ")}`);
}
k.xong();
