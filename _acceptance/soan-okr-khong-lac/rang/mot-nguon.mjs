import path from "node:path";
import { GOC_QUET, NOP, ROOT, SOAN, VALIDATION, doiCo, docTep, ketLuan, tepQuet } from "./chung.mjs";

const co = doiCo(process.argv.slice(2));
let sai = 0;
const bao = (dong) => {
	sai++;
	console.log(dong);
};

const nguon = new Map();
const dem = [];
for (const [ten, goc] of Object.entries(GOC_QUET)) {
	const tep = tepQuet(path.join(ROOT, goc));
	dem.push(`${ten} ${tep.length}`);
	if (tep.length === 0) bao(`goc quet rong: ${ten}`);
	for (const t of tep) {
		const tuongDoi = path.relative(ROOT, t);
		nguon.set(tuongDoi, docTep(tuongDoi));
	}
}
console.log(`   quet: ${dem.join(" · ")}`);
if (sai) ketLuan(sai);

const agent = await import(path.join(ROOT, NOP));
const v = await import(path.join(ROOT, VALIDATION));
const options = agent.ketQuaNop.shape.ketQua.options;
const cungTap =
	options.length === v.KET_QUA_NOP.length && options.every((x, i) => x === v.KET_QUA_NOP[i]);
if (!cungTap) bao(`tap lech: agent ${JSON.stringify(options)} · validation ${JSON.stringify(v.KET_QUA_NOP)}`);

const KHAI_TAP = /(z\.enum\(\s*\[[^\]]*"da-ghi"[^\]]*\]|\[[^\]]*"da-ghi"[^\]]*\]\s*as\s+const)/g;
if (co["ban-sao"] === "them-tap") {
	nguon.set(NOP, nguon.get(NOP).replace("z.enum(KET_QUA_NOP)", 'z.enum(["da-ghi", "tu-choi"])'));
	console.log("   ban sao them-tap: nop-ban-nhap.ts khai lai tap trong bo nho");
}
const khai = [...nguon].flatMap(([tep, s]) => [...s.matchAll(KHAI_TAP)].map(() => tep));
if (khai.length !== 1 || khai[0] !== VALIDATION)
	bao(`tap ket qua khai ${khai.length} cho: ${khai.join(", ")}`);

const moc = docTep(`${SOAN}/moc-nop.ts`);
if (!/docKetQuaNop[\s\S]*from "@crm\/validation\/okr-cuoc-soan"/.test(moc))
	bao("moc-nop.ts khong nhap docKetQuaNop tu @crm/validation/okr-cuoc-soan");

const ra = agent.ketQuaNop.parse({ ketQua: "tu-choi", lyDo: v.LY_DO_TU_CHOI_NOP.chuKyKhongLapKeHoach, soDong: 0, biLoai: [], giuNguyen: [] });
const doc = v.docKetQuaNop(ra);
if (doc?.ketQua !== "tu-choi" || doc?.lyDo !== "chuKyKhongLapKeHoach")
	bao(`round-trip sai: ${JSON.stringify(doc)}`);

if (!sai) console.log("mot-nguon: KET_QUA_NOP 1 cho, agent + app dung chung");
ketLuan(sai);
