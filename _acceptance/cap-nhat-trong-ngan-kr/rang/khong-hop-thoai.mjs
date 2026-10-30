import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const VUNG = "apps/app";
const BO_QUA = [/^apps\/app\/test\//, /^apps\/app\/app\/proto\//];
const DUOI = /\.(?:ts|tsx)$/;
const TEN_CU = ["HopThoaiCapNhatKr", "useCapNhatKr"];
const TEP_CU = "apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx";
const MAU = "apps/app/components/crm/record-sheet/kr-sheet.tsx";

function tepTrongVung(goc) {
	return execFileSync("git", ["-C", goc, "ls-files", "--", VUNG], {
		encoding: "utf8",
	})
		.split("\n")
		.filter((t) => DUOI.test(t) && !BO_QUA.some((m) => m.test(t)));
}

function quet(goc, tep) {
	const cho = [];
	for (const t of tep) {
		const duong = join(goc, t);
		if (!existsSync(duong)) continue;
		const chu = readFileSync(duong, "utf8");
		for (const ten of TEN_CU)
			if (new RegExp(`\\b${ten}\\b`).test(chu))
				cho.push(`${basename(t)} con dung ${ten}`);
	}
	if (existsSync(join(goc, TEP_CU)))
		cho.push(`${basename(TEP_CU)} con ton tai`);
	return cho;
}

function doiChungDuong() {
	const tam = mkdtempSync(join(tmpdir(), "khong-hop-thoai-"));
	try {
		const dich = join(tam, MAU);
		mkdirSync(dirname(dich), { recursive: true });
		writeFileSync(
			dich,
			`import { HopThoaiCapNhatKr } from "@/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr";\n${readFileSync(join(GOC, MAU), "utf8")}`,
		);
		return quet(tam, [MAU]);
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

const bat = doiChungDuong();
if (bat.length !== 1 || !bat[0].includes("HopThoaiCapNhatKr")) {
	console.error(
		`khong-hop-thoai: doi chung duong khong bat duoc import cai vao ban sao (${bat.join("; ")})`,
	);
	process.exit(2);
}

const cho = quet(GOC, tepTrongVung(GOC));
for (const c of cho) console.error(`khong-hop-thoai: ${c}`);
console.log(`khong-hop-thoai: ${cho.length} cho dung`);
process.exit(cho.length === 0 ? 0 : 1);
