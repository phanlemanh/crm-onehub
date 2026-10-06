import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const LA_CHAN = '[ -f "$f" ] || exit 0; ';
const MONG_MATCHER = { PreToolUse: "Workflow|Bash", Notification: "idle_prompt|permission_prompt" };
const SU_KIEN = ["PreToolUse", "PostToolUse", "Notification", "UserPromptSubmit"];

let sai = 0;
const ghi = (s) => process.stdout.write(`${s}\n`);
const do_ = (ca, lyDo) => {
	sai++;
	ghi(`DO: ${ca}: ${lyDo}`);
};

function docLenh() {
	const cfg = JSON.parse(readFileSync(join(GOC, ".claude", "settings.json"), "utf8"));
	const lenh = {};
	for (const sk of SU_KIEN) {
		const muc = cfg.hooks?.[sk];
		if (!Array.isArray(muc) || muc.length === 0) {
			ghi(`KHONG DO DUOC: settings.json thieu hook ${sk}`);
			process.exit(2);
		}
		const cuaDieuPhoi = muc.filter((m) => (m.hooks ?? []).some((h) => String(h.command).includes("scripts/dieu-phoi/")));
		if (cuaDieuPhoi.length !== 1) {
			ghi(`KHONG DO DUOC: ${sk} co ${cuaDieuPhoi.length} muc tro scripts/dieu-phoi`);
			process.exit(2);
		}
		const m = cuaDieuPhoi[0];
		if (MONG_MATCHER[sk] !== undefined && m.matcher !== MONG_MATCHER[sk]) do_(`matcher ${sk}`, `'${m.matcher}' khac '${MONG_MATCHER[sk]}'`);
		lenh[sk] = m.hooks.find((h) => String(h.command).includes("scripts/dieu-phoi/")).command;
		ghi(`lenh ${sk}: ${lenh[sk]}`);
	}
	return lenh;
}

function banSao(coScript) {
	const d = realpathSync(mkdtempSync(join(tmpdir(), "dph-hook-")));
	execFileSync("git", ["init", "-q"], { cwd: d });
	if (coScript) cpSync(join(GOC, "scripts", "dieu-phoi"), join(d, "scripts", "dieu-phoi"), { recursive: true });
	return d;
}

function dauVao(sk, cwd) {
	if (sk === "PreToolUse") return { hook_event_name: sk, tool_name: "Workflow", cwd, tool_input: { scriptPath: "/x/workflows/acceptance-verify.js" } };
	if (sk === "PostToolUse") return { hook_event_name: sk, tool_name: "Bash", cwd, tool_input: { command: "ls" } };
	if (sk === "Notification") return { hook_event_name: sk, notification_type: "idle_prompt", message: "cho", cwd, session_id: "s" };
	return { hook_event_name: sk, prompt: "tiep", cwd, session_id: "s" };
}

function chay(lenh, sk, du) {
	const r = spawnSync("sh", ["-c", lenh], {
		cwd: du,
		input: JSON.stringify(dauVao(sk, du)),
		env: { ...process.env, CLAUDE_PROJECT_DIR: du },
		encoding: "utf8",
		timeout: 20_000,
	});
	return { ma: r.status, loi: (r.stderr ?? "").trim() };
}

function moDot(du) {
	const dot = join(du, ".acceptance-runs", "dieu-phoi-thu");
	mkdirSync(dot, { recursive: true });
	writeFileSync(join(dot, "dieu-phoi.config.json"), "{}");
	writeFileSync(join(dot, "hang-viec.json"), JSON.stringify({ dot: "thu", day: [], hang: [] }));
	symlinkSync(dot, join(du, ".acceptance-runs", "dieu-phoi-hien-tai"));
}

const lenh = docLenh();
const tam = [];
try {
	const co = banSao(true);
	tam.push(co);
	for (const sk of SU_KIEN) {
		const r = chay(lenh[sk], sk, co);
		ghi(`ngoai-dot ${sk}: ma ${r.ma}${r.loi ? ` stderr '${r.loi}'` : ""}`);
		if (r.ma !== 0 || r.loi) do_(`ngoai-dot ${sk}`, `ma ${r.ma}, stderr '${r.loi}'`);
	}
	moDot(co);
	for (const sk of SU_KIEN) {
		const r = chay(lenh[sk], sk, co);
		ghi(`trong-dot ${sk}: ma ${r.ma}${r.loi ? ` stderr '${r.loi}'` : ""}`);
		const mong = sk === "PreToolUse" ? 2 : 0;
		if (r.ma !== mong) do_(`trong-dot ${sk}`, `ma ${r.ma}, mong ${mong}`);
		if (sk === "PreToolUse" && !r.loi.startsWith("chan-s4:")) do_("trong-dot PreToolUse", `stderr khong bat dau 'chan-s4:': '${r.loi}'`);
	}
	const khong = banSao(false);
	tam.push(khong);
	for (const sk of SU_KIEN) {
		const r = chay(lenh[sk], sk, khong);
		ghi(`khong-script ${sk}: ma ${r.ma}`);
		if (r.ma !== 0) do_(`khong-script ${sk}`, `ma ${r.ma}`);
	}
	let sot = 0;
	for (const sk of SU_KIEN) {
		if (!lenh[sk].includes(LA_CHAN)) {
			ghi(`MOC VANG la-chan ${sk}`);
			process.exit(2);
		}
		const r = chay(lenh[sk].replace(LA_CHAN, ""), sk, khong);
		if (r.ma !== 0) ghi(`  ban sao go la chan: DO: khong-script ${sk} ma ${r.ma}`);
		else {
			sot++;
			ghi(`SOT go-la-chan ${sk}: van ma 0`);
		}
	}
	if (sot > 0) sai++;
} finally {
	for (const d of tam) rmSync(d, { recursive: true, force: true });
}
ghi(`KET LUAN: ${sai === 0 ? "xanh" : `${sai} sai`}`);
process.exit(sai === 0 ? 0 : 1);
