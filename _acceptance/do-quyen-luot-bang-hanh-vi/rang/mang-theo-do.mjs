import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	assertDanhTinh,
	chay,
	chayRang,
	coCo,
	GOC,
	hong,
	hongGian,
	voiCaySao,
} from "./chung.mjs";

const BAI_PHAI_DO = "ke-thua: doc duoc ca hai chieu tren cung khuon";
const DUONG_CAU_HOI = "packages/validation/src/builder-question.ts";

const VECTO = {
	"mang-theo-luon-mo": (sao) => {
		const duong = join(sao, DUONG_CAU_HOI);
		const nguon = readFileSync(duong, "utf8");
		const moc = `	const parsed = authorizationEnvelope.safeParse(value);
	if (!parsed.success) return "CHAT";
	return parsed.data[BUILDER_AUTHORIZATION_KEY] ? "CREATE_AGENT" : "CHAT";`;
		if (!nguon.includes(moc)) {
			hongGian(`khong tim thay moc de dot bien trong ${duong}`);
		}
		writeFileSync(duong, nguon.replace(moc, '	return "CREATE_AGENT";'));
	},
};

const chayBaiDo = (sao) =>
	chay(join(sao, "apps", "agent"), ["bun", "test", "test/quyen-luot.spec.ts"]);

function chayMotVecto(ten) {
	const dotBien = VECTO[ten];
	if (!dotBien) {
		hongGian(
			`khong co vecto ten "${ten}" — co: ${Object.keys(VECTO).join(", ")}`,
		);
	}
	return voiCaySao(({ sao }) => {
		assertDanhTinh(sao);
		const truoc = chayBaiDo(sao);
		if (truoc.ma !== 0) {
			hongGian(
				`doi chung duong hong: cay sao chua dot bien da do (ma ${truoc.ma})\n  cay sao: ${sao}\n${truoc.chu}`,
			);
		}
		if (truoc.chu.includes(BAI_PHAI_DO) && /\(fail\)/.test(truoc.chu)) {
			hongGian(
				`doi chung duong hong: bai "${BAI_PHAI_DO}" da do truoc khi dot bien`,
			);
		}
		dotBien(sao);
		const sau = chayBaiDo(sao);
		const coBai = sau.chu.includes(BAI_PHAI_DO);
		const soDo = (sau.chu.match(/^\s*(\d+) fail/m) ?? [])[1] ?? "?";
		process.stdout.write(
			[
				`cay sao: ${sao}`,
				`vecto: ${ten}`,
				`  luot dot bien: ma thoat ${sau.ma}, so bai do ${soDo}`,
				`  bai mang loi hua "${BAI_PHAI_DO}": ${coBai ? "CO DO" : "KHONG DO"}`,
				"",
			].join("\n"),
		);
		if (sau.ma === 0) {
			hongGian(`vecto "${ten}" ra XANH — thuoc dang khong do duong mang theo`);
		}
		if (!sau.chu.includes(BAI_PHAI_DO)) {
			hongGian(
				`vecto "${ten}" lam suite do NHUNG khong phai o bai mang loi hua: khong thay "${BAI_PHAI_DO}" trong output`,
			);
		}
		return sau.ma;
	});
}

chayRang(() => {
	const ten = coCo("--vecto");
	if (ten) {
		process.exitCode = chayMotVecto(ten);
		return;
	}
	const lech = [];
	for (const v of Object.keys(VECTO)) {
		const ma = chayMotVecto(v);
		process.stdout.write(`vecto "${v}": bai do do, ma ${ma}\n`);
		if (ma === 0) lech.push(v);
	}
	if (lech.length > 0) {
		hong(
			`cau tra loi ke thua quyen cua luot da hoi\n  vecto ra XANH: ${lech.join(", ")}`,
		);
	}
	process.stdout.write(
		`mang-theo-do: ${Object.keys(VECTO).length} vecto deu lam bai "${BAI_PHAI_DO}" do\n`,
	);
});
