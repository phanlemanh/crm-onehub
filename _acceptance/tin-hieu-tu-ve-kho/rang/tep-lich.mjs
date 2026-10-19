import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TEP = join(GOC, ".github", "workflows", "tin-hieu-keo-ve.yml");
const LICH = ["0 21 * * *", "0 9 * * *"];
const QUYEN = { contents: "write", "pull-requests": "write" };
const CAM = ["gh pr merge", "--auto", "git push origin onehub"];
const LENH = "bun scripts/tin-hieu/lich.ts";

function kiem(chu) {
	const y = Bun.YAML.parse(chu);
	const on = y.on ?? y[true] ?? {};
	const buoc = Object.values(y.jobs ?? {}).flatMap((j) => j.steps ?? []);
	const chay = buoc.map((b) => String(b.run ?? "")).join("\n");
	const env = buoc.find((b) => String(b.run ?? "").includes(LENH))?.env ?? {};
	const cron = (on.schedule ?? []).map((s) => s.cron).sort();
	return [
		[
			"1 lich hai lan moi ngay 21:00Z va 09:00Z",
			JSON.stringify(cron) === JSON.stringify([...LICH].sort()),
		],
		["2 chay tay duoc", Object.hasOwn(on, "workflow_dispatch")],
		[
			"3 chi xin quyen noi dung va PR",
			JSON.stringify(y.permissions) === JSON.stringify(QUYEN),
		],
		[
			"4 mot luot mot luc, khong huy luot dang chay",
			Boolean(y.concurrency?.group) &&
				y.concurrency?.["cancel-in-progress"] === false,
		],
		[
			"5 goi lenh lich voi hai bi mat",
			chay.includes(LENH) &&
				env.CRM_KHOA_KEO_TIN_HIEU === "${{ secrets.CRM_KHOA_KEO_TIN_HIEU }}" &&
				env.CRM_API_URL === "${{ secrets.CRM_API_URL }}",
		],
		["6 khong buoc gop", !CAM.some((c) => chu.includes(c))],
	];
}

function inRa(dong) {
	for (const [ten, dung] of dong)
		console.log(`${dung ? "DUNG" : "SAI"} ${ten}`);
	return dong.every(([, d]) => d);
}

if (process.argv.includes("--pha-thu")) {
	const tam = mkdtempSync(join(tmpdir(), "tvk-tep-lich-"));
	try {
		const ban = join(tam, "lich.yml");
		writeFileSync(
			ban,
			`${readFileSync(TEP, "utf8")}      - run: gh pr merge --merge\n`,
		);
		const dong = kiem(readFileSync(ban, "utf8"));
		const sai6 = dong.find(([t]) => t.startsWith("6"))?.[1] === false;
		console.log(
			sai6
				? 'PHA-THU DUNG: tep lich co buoc gop -> dong 6 SAI ("tep lich co buoc gop")'
				: "PHA-THU SAI",
		);
		process.exit(sai6 ? 0 : 1);
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}
const dung = inRa(kiem(readFileSync(TEP, "utf8")));
console.log(
	dung
		? "KET LUAN: tep lich dung 6 dong"
		: "KET LUAN: tep lich co buoc gop hoac sai khai",
);
process.exit(dung ? 0 : 1);
