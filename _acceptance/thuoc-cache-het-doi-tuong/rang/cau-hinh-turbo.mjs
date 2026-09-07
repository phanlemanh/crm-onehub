import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const GOC = join(import.meta.dirname, "..", "..", "..");

export function docGoi() {
	const mau = JSON.parse(readFileSync(join(GOC, "package.json"), "utf8"))
		.workspaces;
	if (!Array.isArray(mau) || mau.length === 0) return null;
	const ra = [];
	for (const m of mau) {
		const goc = m.replace(/\/\*$/, "");
		let ten = [];
		try {
			ten = readdirSync(join(GOC, goc));
		} catch {
			continue;
		}
		for (const t of ten) {
			const d = join(goc, t);
			if (existsSync(join(GOC, d, "package.json"))) ra.push(d);
		}
	}
	return { mau, goi: ra.sort() };
}

export function docTask() {
	const goc = JSON.parse(readFileSync(join(GOC, "turbo.json"), "utf8")).tasks;
	const kho = docGoi();
	if (kho === null) return null;
	const ra = [];
	for (const g of kho.goi) {
		let rieng = {};
		try {
			rieng = JSON.parse(readFileSync(join(GOC, g, "turbo.json"), "utf8")).tasks;
		} catch {
			rieng = {};
		}
		const script =
			JSON.parse(readFileSync(join(GOC, g, "package.json"), "utf8")).scripts ??
			{};
		for (const t of new Set([...Object.keys(goc), ...Object.keys(rieng ?? {})])) {
			if (script[t] === undefined) continue;
			const dem = rieng?.[t]?.cache ?? goc[t]?.cache ?? true;
			ra.push({
				goi: g,
				task: t,
				dem: dem !== false,
				khai_rieng: rieng?.[t] !== undefined,
				inputs: rieng?.[t]?.inputs ?? goc[t]?.inputs ?? null,
				inputs_o_goi: rieng?.[t]?.inputs !== undefined,
			});
		}
	}
	return { mau: kho.mau, so_goi: kho.goi.length, task: ra };
}

export function docCauHinhCong() {
	const nguon = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");
	const khoi = nguon.match(/^ {2}suite_keys:\n((?: {4}- .+\n)+)/m);
	const khoa =
		khoi === null
			? []
			: khoi[1]
					.trimEnd()
					.split("\n")
					.map((d) => d.replace(/^\s*- /, "").trim());
	const script = JSON.parse(readFileSync(join(GOC, "package.json"), "utf8"))
		.scripts;
	const oCam = khoa.map((k) => {
		const ten = k.split(".").pop();
		const m = nguon.match(new RegExp(`^\\s+${ten}: "?(.+?)"?$`, "m"));
		return { khoa: k, ten, lenh: m === null ? null : m[1] };
	});
	return { oCam, script };
}

export function giaiThan(lenh, script) {
	const ra = [];
	for (const doan of String(lenh).split("&&").map((d) => d.trim())) {
		const m = doan.match(/^bun run ([\w:-]+)(.*)$/);
		ra.push(m === null ? doan : `${script[m[1]] ?? doan}${m[2] ?? ""}`);
	}
	return ra;
}

export function taskCuaLenh(lenh, script) {
	const ten = new Set();
	for (const than of giaiThan(lenh, script)) {
		for (const m of than.matchAll(/turbo\s+run\s+([\w:-]+)/g)) ten.add(m[1]);
		for (const m of than.matchAll(/test-run\.ts/g)) ten.add("test");
	}
	return [...ten];
}

export function epChayLai(lenh, script) {
	return giaiThan(lenh, script).some((t) => /--force\b/.test(t));
}
