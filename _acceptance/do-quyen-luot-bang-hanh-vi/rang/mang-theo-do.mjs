import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	assertDanhTinh,
	chay,
	chayRang,
	coCo,
	hong,
	voiCaySao,
} from "./chung.mjs";

const GHIM = "cau tra loi ke thua quyen cua luot da hoi";
const DUONG_CAU_HOI = "packages/validation/src/builder-question.ts";

const VECTO = {
	"mang-theo-luon-mo": (sao) => {
		const duong = join(sao, DUONG_CAU_HOI);
		const nguon = readFileSync(duong, "utf8");
		const moc = `	const parsed = authorizationEnvelope.safeParse(value);
	if (!parsed.success) return "CHAT";
	return parsed.data[BUILDER_AUTHORIZATION_KEY] ? "CREATE_AGENT" : "CHAT";`;
		if (!nguon.includes(moc)) hong(`khong tim thay moc de dot bien trong ${duong}`);
		writeFileSync(duong, nguon.replace(moc, '	return "CREATE_AGENT";'));
	},
};

const chayBaiDo = (sao) =>
	chay(join(sao, "apps", "agent"), ["bun", "test", "test/quyen-luot.spec.ts"]);

chayRang(() => {
	const ten = coCo("--vecto");
	if (!ten) hong(`can --vecto <ten> — co: ${Object.keys(VECTO).join(", ")}`);
	const dotBien = VECTO[ten];
	if (!dotBien) hong(`khong co vecto ten "${ten}" — co: ${Object.keys(VECTO).join(", ")}`);

	const ma = voiCaySao(({ sao }) => {
		assertDanhTinh(sao);
		const truoc = chayBaiDo(sao);
		if (truoc.ma !== 0) {
			hong(
				`doi chung duong hong: cay sao chua dot bien da do (ma ${truoc.ma})\n  cay sao: ${sao}\n${truoc.chu}`,
			);
		}
		dotBien(sao);
		const sau = chayBaiDo(sao);
		process.stdout.write(`cay sao: ${sao}\nvecto: ${ten}\n`);
		if (sau.ma === 0) {
			hong(
				`${GHIM}\n  vecto "${ten}" ra XANH — thuoc dang khong do duong mang theo\n  cay sao: ${sao}`,
			);
		}
		process.stdout.write(`${GHIM}\n  vecto "${ten}" lam bai do do, ma ${sau.ma}\n`);
		return sau.ma;
	});
	process.exitCode = ma;
});
