import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { chayRang, daiCuaVong, GOC, git } from "./dai.mjs";

const THU_MUC = "apps/app/app/proto";
const NAP_OKR = /from\s+["'](@\/lib\/messages\/okr[a-z-]*|[./]*lib\/messages\/okr[a-z-]*)["']/;

function tepDuoi(goc) {
	return readdirSync(goc).flatMap((ten) => {
		const duong = join(goc, ten);
		return statSync(duong).isDirectory() ? tepDuoi(duong) : /\.(ts|tsx)$/.test(ten) ? [duong] : [];
	});
}

export function napChuOkr(goc) {
	return tepDuoi(goc).filter((t) => NAP_OKR.test(readFileSync(t, "utf8")));
}

chayRang(() => {
	const tam = mkdtempSync(join(tmpdir(), "dnk-proto-"));
	writeFileSync(join(tam, "mau.tsx"), 'import { okrMessages } from "@/lib/messages/okr";\n');
	const bat = napChuOkr(tam);
	rmSync(tam, { recursive: true, force: true });
	if (bat.length !== 1) {
		console.log("proto: doi chung duong khong bat tep nap chu okr");
		return 1;
	}
	const dai = daiCuaVong();
	const doi = git("diff", "--name-only", dai.tu, dai.den, "--", THU_MUC).split("\n").filter(Boolean);
	const nap = napChuOkr(join(GOC, THU_MUC)).map((t) => relative(GOC, t));
	const loi = [...doi.map((t) => `proto doi: ${t}`), ...nap.map((t) => `proto nap chu okr: ${t}`)];
	if (loi.length) {
		console.log(loi.join("\n"));
		return 1;
	}
	console.log(`proto: 0 tep doi, 0 tep nap chu okr (dai ${dai.kieu} ${dai.soCommit} commit)`);
	return 0;
});
