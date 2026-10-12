import { existsSync, readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { basename, join } from "node:path";
import { docTai, GOC, Ket, khongDoDuoc, MB } from "./chung.mjs";
import { giaiGoi } from "./goi.mjs";

const TEP = ".claude/settings.json";
const MUC_THEM = "dieu-phoi@acceptance-gate-kit";
const DUONG_KHO = /\$CLAUDE_PROJECT_DIR\/scripts\/([^"\s;]+)/;
const ket = new Ket();
const goi = giaiGoi();

function boHook(settings, mauDuong) {
	const ra = [];
	for (const [suKien, khoi] of Object.entries(settings.hooks ?? {})) {
		for (const k of khoi) {
			for (const h of k.hooks ?? []) {
				const m = mauDuong.exec(String(h.command ?? ""));
				if (m) ra.push({ suKien, matcher: k.matcher ?? null, tep: basename(m[1]) });
			}
		}
	}
	return ra;
}

function do_(cu, moi, hooksGoi, gocGoi, inRa = false) {
	const doDs = [];
	const go = boHook(cu, DUONG_KHO);
	if (go.length !== 4) khongDoDuoc(`${go.length} bo hook goi kho o merge-base, mong 4`);
	const con = boHook(moi, DUONG_KHO);
	for (const h of con) doDs.push(`DO con hook goi kho ${h.suKien} ${h.tep}`);
	const boKhoa = (s) => Object.fromEntries(Object.entries(s).filter(([k]) => k !== "hooks"));
	const a = boKhoa(cu);
	const b = boKhoa(moi);
	const bPlugin = { ...(b.enabledPlugins ?? {}) };
	if (bPlugin[MUC_THEM] === true && !(MUC_THEM in (a.enabledPlugins ?? {}))) delete bPlugin[MUC_THEM];
	for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
		const giaTriB = k === "enabledPlugins" ? bPlugin : b[k];
		if (!isDeepStrictEqual(a[k], giaTriB)) doDs.push(`DO khoa khac doi ${k}`);
	}
	const goiBo = boHook(hooksGoi, /\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/([^"\s;]+)/);
	for (const h of go) {
		const phu = goiBo.some((g) => g.suKien === h.suKien && g.matcher === h.matcher && g.tep === h.tep);
		const coTep = existsSync(join(gocGoi, "scripts", h.tep));
		if (!phu || !coTep) doDs.push(`DO thieu ${h.suKien} ${h.matcher ?? "-"} ${h.tep}${coTep ? "" : " (tep vang)"}`);
		else if (inRa) console.log(`phu ${h.suKien} ${h.matcher ?? "-"} ${h.tep}`);
	}
	return doDs;
}

const cu = JSON.parse(docTai(MB, TEP));
const moi = JSON.parse(readFileSync(join(GOC, TEP), "utf8"));
const hooksGoi = JSON.parse(readFileSync(join(goi.goc, "hooks", "hooks.json"), "utf8"));
const that = do_(cu, moi, hooksGoi, goi.goc, true);
console.log(`hook goi kho: ${boHook(moi, DUONG_KHO).length}`);
ket.kiem(that.length === 0, "bon hook go di deu do goi phu; khoa khac giu", that.join(" | "));

const sao = (x) => structuredClone(x);
const hg1 = sao(hooksGoi);
delete hg1.hooks.Notification;
ket.bat("goi-mat-notification", do_(cu, moi, hg1, goi.goc), "DO thieu Notification");
const hg2 = sao(hooksGoi);
for (const k of hg2.hooks.PostToolUse) k.matcher = "Bash";
ket.bat("goi-doi-matcher-posttooluse", do_(cu, moi, hg2, goi.goc), "DO thieu PostToolUse");
const m1 = sao(moi);
m1.hooks = { PreToolUse: sao(cu.hooks.PreToolUse) };
ket.bat("settings-giu-pretooluse", do_(cu, m1, hooksGoi, goi.goc), "DO con hook goi kho PreToolUse");
const m2 = sao(moi);
delete m2.enabledPlugins["acceptance-gate@acceptance-gate-kit"];
ket.bat("settings-doi-enabledplugins", do_(cu, m2, hooksGoi, goi.goc), "DO khoa khac doi enabledPlugins");
const m3 = sao(moi);
m3.enabledPlugins = { ...m3.enabledPlugins, [MUC_THEM]: true };
ket.kiem(do_(cu, m3, hooksGoi, goi.goc).length === 0, "doi-chung-duong them dung muc dieu-phoi khong do", "them muc dieu-phoi bi tinh la doi");
ket.ket();
