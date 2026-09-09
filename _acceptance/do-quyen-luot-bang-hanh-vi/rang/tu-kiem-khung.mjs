import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	assertDanhTinh,
	chay,
	chayRang,
	DUONG_DISPATCH,
	GOC,
	hong,
	voiCaySao,
} from "./chung.mjs";

const NEO = `\nexport const NEO_TU_KIEM_KHUNG = ${Date.now()};\n`;
const duong = join(GOC, DUONG_DISPATCH);
const goc = readFileSync(duong, "utf8");

chayRang(() => {
	writeFileSync(duong, goc + NEO);
	try {
		voiCaySao(({ sao }) => {
			const trongSao = readFileSync(join(sao, DUONG_DISPATCH), "utf8");
			if (!trongSao.includes("NEO_TU_KIEM_KHUNG")) {
				hong(
					`cay sao khong chua ma dang xet: neo vua ghi khong sang duoc ban sao\n  cay sao: ${sao}`,
				);
			}
			assertDanhTinh(sao);
			const r = chay(join(sao, "apps", "agent"), [
				"bun",
				"test",
				"test/quyen-luot.spec.ts",
			]);
			if (r.ma !== 0) {
				hong(`doi chung duong hong trong cay sao: ma ${r.ma}\n${r.chu}`);
			}
			process.stdout.write(`cay sao: ${sao}\n`);
		});
	} finally {
		writeFileSync(duong, goc);
	}
	process.stdout.write("khung: cay sao mang ma dang xet, doi chung duong xanh\n");
});
