import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";

export const GOC = join(import.meta.dirname, "..", "..", "..");
const GOI = join(GOC, "apps", "agent-okr");
export const SPEC = join(GOI, "test", "nop-ban-nhap.integration.spec.ts");
const SLUG = "nop-ban-nhap-chon-theo-khoa";
const TEN_CA = "Mục tiêu đã nhận";
const TIEU_DE =
	'test("Mục tiêu đã nhận: đổi tên qua chat không tạo dòng thứ hai cùng khoá';
const MOC_NOP = "\t\tawait nop(tron(), ctx);\n";
const DAU_AN = "RANG-DAO-THU-TU-DA-AN";
const TRAN_LUOT_MS = 300_000;

export const BO_CHON_KHOA = `\t\tconst m1 = (
\t\t\tawait db.okrDeXuat.findMany({
\t\t\t\twhere: { cuocSoanId: cuoc.id, loai: "muc-tieu-moi", trangThai: "cho" },
\t\t\t})
\t\t).find((h) => dongSoanTuHang(h).khoa === "m1");
\t\tif (!m1) throw new Error("thieu muc tieu m1");
`;

export const BO_CHON_CREATED_AT = `\t\tconst m1 = await db.okrDeXuat.findFirstOrThrow({
\t\t\twhere: { cuocSoanId: cuoc.id, loai: "muc-tieu-moi", trangThai: "cho" },
\t\t\torderBy: { createdAt: "asc" },
\t\t});
`;

const DAO = `\t\tconst rangHang = await db.okrDeXuat.findMany({
\t\t\twhere: { cuocSoanId: cuoc.id },
\t\t\tselect: { id: true, loai: true, noiDung: true, createdAt: true },
\t\t});
\t\tconst rangMoc = new Set(rangHang.map((h) => h.createdAt.getTime()));
\t\tif (rangMoc.size !== 1)
\t\t\tthrow new Error(\`RANG-KHONG-DO-DUOC: \${rangHang.length} dong co \${rangMoc.size} moc createdAt\`);
\t\tconst rangM1 = rangHang.find(
\t\t\t(h) => h.loai === "muc-tieu-moi" && (h.noiDung as { khoa?: string }).khoa === "m1",
\t\t);
\t\tif (!rangM1) throw new Error("RANG-KHONG-DO-DUOC: thieu dong m1");
\t\tawait db.$executeRaw\`UPDATE "okrDeXuat" SET "cuocSoanId" = NULL WHERE id = \${rangM1.id}\`;
\t\tawait db.$executeRaw\`UPDATE "okrDeXuat" SET "cuocSoanId" = \${cuoc.id} WHERE id = \${rangM1.id}\`;
\t\tconst rangDau = await db.okrDeXuat.findFirstOrThrow({
\t\t\twhere: { cuocSoanId: cuoc.id, loai: "muc-tieu-moi", trangThai: "cho" },
\t\t\torderBy: { createdAt: "asc" },
\t\t});
\t\tif ((rangDau.noiDung as { khoa?: string }).khoa === "m1")
\t\t\tthrow new Error("RANG-KHONG-DO-DUOC: dao thu tu khong an");
\t\tconsole.log("${DAU_AN}", rangHang.length);
`;

class MocVang extends Error {}

function thayMotLan(src, cu, moi, tu = 0) {
	const i = src.indexOf(cu, tu);
	if (i < 0) throw new MocVang(`moc vang: ${JSON.stringify(cu.slice(0, 60))}`);
	if (src.indexOf(cu, i + cu.length) >= 0 && tu === 0)
		throw new MocVang(`moc trung: ${JSON.stringify(cu.slice(0, 60))}`);
	return src.slice(0, i) + moi + src.slice(i + cu.length);
}

export function banSao(src, chieu) {
	const dau = src.indexOf(TIEU_DE);
	if (dau < 0) throw new MocVang("khong thay ca Muc tieu da nhan");
	const iNop = src.indexOf(MOC_NOP, dau);
	if (iNop < 0) throw new MocVang("khong thay lan nop dau cua ca");
	let ra = thayMotLan(src, MOC_NOP, MOC_NOP + DAO, iNop);
	ra = thayMotLan(
		ra,
		BO_CHON_KHOA,
		chieu === "do" ? BO_CHON_CREATED_AT : BO_CHON_KHOA,
	);
	return ra
		.replaceAll('from "../agent/', `from "${join(GOI, "agent")}/`)
		.replaceAll('from "./support/', `from "${join(GOI, "test", "support")}/`);
}

function chay(src, chieu) {
	const thuMuc = join(GOC, ".acceptance-runs", SLUG, `sao-${chieu}-${process.pid}`);
	rmSync(thuMuc, { recursive: true, force: true });
	mkdirSync(thuMuc, { recursive: true });
	symlinkSync(join(GOI, "node_modules"), join(thuMuc, "node_modules"));
	const tep = "dao-thu-tu.spec.ts";
	writeFileSync(join(thuMuc, tep), src);
	try {
		const kq = spawnSync(
			"bun",
			[
				"run",
				"test",
				"--",
				`cd ${thuMuc} && CRM_TELEMETRY_DISABLED=1 bun test ./${tep} -t '${TEN_CA}'`,
			],
			{ cwd: GOC, encoding: "utf8", timeout: TRAN_LUOT_MS },
		);
		return { ma: kq.status, ra: `${kq.stdout}\n${kq.stderr}` };
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
}

function ket(ma, dong) {
	for (const d of dong) console.log(d);
	process.exit(ma);
}

function chinh() {
	const chieu = process.argv[2];
	if (chieu !== "xanh" && chieu !== "do")
		ket(2, ["KHONG DO DUOC: doi so phai la xanh hoac do"]);
	if (!existsSync(SPEC)) ket(2, [`KHONG DO DUOC: vang ${SPEC}`]);
	let src;
	try {
		src = banSao(readFileSync(SPEC, "utf8"), chieu);
	} catch (e) {
		if (e instanceof MocVang) ket(2, [`KHONG DO DUOC: ${e.message}`]);
		throw e;
	}
	const { ma, ra } = chay(src, chieu);
	const daAn = new RegExp(`${DAU_AN} (\\d+)`).exec(ra);
	const khongDo = /RANG-KHONG-DO-DUOC: [^\n]*/.exec(ra);
	if (khongDo) ket(2, [`KHONG DO DUOC: ${khongDo[0]}`]);
	if (!daAn)
		ket(2, [
			`KHONG DO DUOC: ca khong chay toi buoc dao thu tu (ma ${ma})`,
			ra.slice(-1500),
		]);
	const dong = [
		`chieu ${chieu}: ${daAn[1]} dong cua mot lan nop chung mot createdAt; dong m1 da doi ra sau m3`,
	];
	const caDo = ra.includes(`(fail) nop-ban-nhap > ${TEN_CA}`);
	const motXanh = /\b1 pass\b/.test(ra) && /\b0 fail\b/.test(ra);
	if (chieu === "xanh") {
		if (ma === 0 && motXanh && !caDo)
			ket(0, [...dong, "bo chon theo khoa: ca xanh du thu tu vat ly dao"]);
		ket(1, [...dong, `bo chon theo khoa: ca KHONG xanh (ma ${ma})`, ra.slice(-1500)]);
	}
	const chuKy =
		/^\+\s+"giu": \[\],$/m.test(ra) &&
		/^\+\s+"Đối tác miền Bắc gắn bó thêm hai năm",?$/m.test(ra);
	if (ma !== 0 && caDo && chuKy)
		ket(0, [
			...dong,
			'bo chon createdAt: ca do dung chu ky CI 37169842118 ("giu": [], m1 them ten moi)',
		]);
	ket(1, [
		...dong,
		`bo chon createdAt: KHONG do dung chu ky CI (ma ${ma}, ca do ${caDo}, chu ky ${chuKy})`,
		ra.slice(-1500),
	]);
}

if (import.meta.main) chinh();
