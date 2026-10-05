import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { CAU_HINH } from "./cau-hinh.mjs";

export const GOC = join(import.meta.dirname, "..", "..", "..");

export function nguonHienTai() {
	return readFileSync(join(GOC, CAU_HINH.tep), "utf8");
}

export function nguonNeo() {
	return execFileSync("git", ["show", `${CAU_HINH.neo}:${CAU_HINH.tep}`], {
		cwd: GOC,
		encoding: "utf8",
	});
}

export function thuMucRa(eval_) {
	const d = join(GOC, CAU_HINH.raGoc, `${eval_}-${process.pid}`);
	mkdirSync(d, { recursive: true });
	return d;
}

export function banSao(ten, nguon) {
	const tuongDoi = `${CAU_HINH.thuMucBanSao}/${ten}-${process.pid}${CAU_HINH.duoiBanSao}`;
	mkdirSync(join(GOC, CAU_HINH.goiApp, CAU_HINH.thuMucBanSao), {
		recursive: true,
	});
	writeFileSync(
		join(GOC, CAU_HINH.goiApp, tuongDoi),
		nguon.replaceAll('from "../', 'from "../../'),
	);
	return tuongDoi;
}

export function xoaBanSao(dsTuongDoi) {
	for (const t of dsTuongDoi)
		rmSync(join(GOC, CAU_HINH.goiApp, t), { force: true });
	const thuMuc = join(GOC, CAU_HINH.goiApp, CAU_HINH.thuMucBanSao);
	return existsSync(thuMuc)
		? readdirSync(thuMuc).filter((f) =>
				f.includes(`-${process.pid}${CAU_HINH.duoiBanSao}`),
			)
		: [];
}

export function chayBun(tuongDoi, them = []) {
	const r = spawnSync(
		"bun",
		["test", "--preload", CAU_HINH.preload, `./${tuongDoi}`, ...them],
		{
			cwd: join(GOC, CAU_HINH.goiApp),
			env: { ...process.env, TZ: CAU_HINH.tz },
			encoding: "utf8",
			timeout: CAU_HINH.tranLuotMs,
			maxBuffer: 256 * 1024 * 1024,
		},
	);
	return {
		ma: r.status,
		ra: `${r.stdout ?? ""}${r.stderr ?? ""}`,
		loi: r.error ?? null,
	};
}

function giaiXml(s) {
	return s
		.replaceAll("&quot;", '"')
		.replaceAll("&apos;", "'")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&amp;", "&");
}

export function docJunit(duong) {
	if (!existsSync(duong)) return null;
	const xml = readFileSync(duong, "utf8");
	const ca = [];
	const re = /<testcase name="([^"]*)"[^>]*?(\/>|>([\s\S]*?)<\/testcase>)/g;
	for (const m of xml.matchAll(re))
		ca.push({ ten: giaiXml(m[1]), hong: (m[3] ?? "").includes("<failure") });
	return ca;
}

export function dongHong(ra) {
	return ra
		.split("\n")
		.filter((d) => d.startsWith("(fail) "))
		.map((d) => d.replace(/^\(fail\) /, "").replace(/ \[[\d.]+m?s\]$/, ""));
}

export function doanTruocDongHong(ra, ten) {
	const dong = ra.split("\n");
	const doan = [];
	let gom = [];
	for (const d of dong) {
		if (d.startsWith("(fail) ")) {
			if (d.includes(ten)) doan.push(gom.join("\n"));
			gom = [];
		} else gom.push(d);
	}
	return doan;
}

export function tongKet(ra) {
	const so = (nhan) => {
		const m = ra.match(new RegExp(`^\\s*(\\d+) ${nhan}$`, "m"));
		return m ? Number(m[1]) : null;
	};
	return { pass: so("pass"), fail: so("fail") };
}
