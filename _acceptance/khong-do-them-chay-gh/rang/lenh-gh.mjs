import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	bat,
	dungBan,
	GOC,
	git,
	Ket,
	khongDoDuoc,
	lenhCauHinh,
	moiTruongSach,
	shaHead,
	shaMergeBase,
	thuMucRa,
} from "./nen.mjs";

const LENH = ["gpct_nen_gop", "gpct_luot_that"];
const ket = new Ket();
const nhatKy = thuMucRa("lenh-gh");
const lenh = Object.fromEntries(LENH.map((k) => [k, lenhCauHinh(k)]));

function chay(khoa, cwd, nhan) {
	const r = spawnSync("bash", ["-c", lenh[khoa]], {
		cwd,
		encoding: "utf8",
		env: moiTruongSach(),
		maxBuffer: 64 * 1024 * 1024,
	});
	const chu = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	const log = join(nhatKy, `${khoa}-${nhan}.log`);
	writeFileSync(log, chu);
	return { ma: r.status ?? `tin-hieu ${r.signal}`, chu, log };
}

const dongMa2 = (chu) =>
	chu.split("\n").find((d) => d.startsWith("MA 2:")) ?? null;

for (const k of LENH) {
	const g = chay(k, GOC, "goc");
	if (g.ma !== 0)
		khongDoDuoc(
			`tien de: ${k} ma ${g.ma} o cay goc (${dongMa2(g.chu) ?? g.log})`,
		);
	console.log(`goc ${k}: ma 0`);
}

const sha = { head: shaHead(), mb: shaMergeBase() };
let dat = 0;
for (const [nhan, s] of Object.entries(sha)) {
	const b = dungBan(s, `f26-lenh-${nhan}`, GOC, { nen: true });
	try {
		for (const k of LENH) {
			const r = chay(k, b.goc, nhan);
			const maDung = nhan === "head" ? r.ma === 0 : r.ma === 0 || r.ma === 1;
			const ma2 = dongMa2(r.chu);
			if (
				ket.kiem(
					maDung && !ma2,
					`${k} ${nhan}: ma ${r.ma}`,
					`${ma2 ?? `ma ${r.ma}`} (${r.log})`,
				)
			)
				dat += 1;
		}
	} finally {
		b.don();
	}
	const tran = dungBan(s, `f26-lenh-tran-${nhan}`, GOC, { nen: false });
	try {
		const r = chay("gpct_nen_gop", tran.goc, `tran-${nhan}`);
		bat(
			ket,
			`nen-gop-ban-tran-${nhan}`,
			dongMa2(r.chu)?.startsWith("MA 2: gh repo view") === true,
			`ma ${r.ma}: ${dongMa2(r.chu)} (${r.log})`,
		);
		git(
			tran.goc,
			"remote",
			"set-url",
			"origin",
			git(GOC, "remote", "get-url", "origin").trim(),
		);
		const t = chay("gpct_luot_that", tran.goc, `tach-${nhan}`);
		bat(
			ket,
			`luot-that-ban-tach-${nhan}`,
			dongMa2(t.chu) === "MA 2: nhanh HEAD khong co PR mo",
			`ma ${t.ma}: ${dongMa2(t.chu)} (${t.log})`,
		);
	} finally {
		tran.don();
	}
}
ket.kiem(dat === 4, `ma tran 4 o: dat ${dat}/4`, `chi dat ${dat}/4`);
ket.ket();
