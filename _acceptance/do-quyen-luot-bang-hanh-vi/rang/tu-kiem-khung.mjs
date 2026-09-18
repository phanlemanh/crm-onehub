import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	assertDanhTinh,
	chay,
	chayRang,
	hong,
	khiBiNgat,
	RANG,
	voiCaySao,
} from "./chung.mjs";

const DUONG_NEO = "_acceptance/do-quyen-luot-bang-hanh-vi/rang/neo.txt";
const NEO = `NEO_TU_KIEM_KHUNG ${Date.now()}\n`;
const duong = join(RANG, "neo.txt");
const goc = readFileSync(duong, "utf8");
const traLai = () => writeFileSync(duong, goc);

chayRang(() => {
	const thoiCanh = khiBiNgat(traLai);
	writeFileSync(duong, goc + NEO);
	try {
		thoiCanh();
		voiCaySao(({ sao }) => {
			const trongSao = readFileSync(join(sao, DUONG_NEO), "utf8");
			if (!trongSao.includes("NEO_TU_KIEM_KHUNG")) {
				hong(
					`cay sao khong mang thay doi chua commit: neo vua ghi khong sang duoc ban sao\n  cay sao: ${sao}`,
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
		}, traLai);
	} finally {
		traLai();
	}
	process.stdout.write(
		`khung: cay sao mang ma dang xet va thay doi chua commit, doi chung duong xanh\n  tep neo: ${DUONG_NEO}\n`,
	);
});
