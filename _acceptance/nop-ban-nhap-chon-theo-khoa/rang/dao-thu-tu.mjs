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
const DAU_AN = "RANG-DAO-THU-TU-DA-AN";
const TRAN_LUOT_MS = 300_000;
const CA_NHAN = "Mục tiêu đã nhận";
const CA_TRON = "bản nháp trộn";
const CA_BAC = "nộp lại dòng có khoá đã bác";

const xepLai = (bieuThuc) =>
	[
		`CREATE INDEX "rang_dao_thu_tu" ON "okrDeXuat" (${bieuThuc})`,
		'CLUSTER "okrDeXuat" USING "rang_dao_thu_tu"',
		'DROP INDEX "rang_dao_thu_tu"',
	]
		.map((lenh) => `\t\tawait db.$executeRawUnsafe(${JSON.stringify(lenh)});\n`)
		.join("");

const daoMucTieu = (cuoc, hoiCu) => `\t\tconst rangCuoc = ${cuoc};
\t\tconst rangHang = await db.okrDeXuat.findMany({
\t\t\twhere: { cuocSoanId: rangCuoc, loai: "muc-tieu-moi", trangThai: "cho" },
\t\t});
\t\tconst rangMoc = new Set(rangHang.map((h) => h.createdAt.getTime()));
\t\tif (rangHang.length < 2 || rangMoc.size !== 1)
\t\t\tthrow new Error(\`RANG-KHONG-DO-DUOC: \${rangHang.length} muc tieu cho co \${rangMoc.size} moc createdAt\`);
${xepLai(`("noiDung"->>'khoa') DESC`)}\t\tconst rangDau = await db.okrDeXuat.findFirstOrThrow(${hoiCu});
\t\tif (dongSoanTuHang(rangDau).khoa === "m1")
\t\t\tthrow new Error("RANG-KHONG-DO-DUOC: dao thu tu khong an");
\t\tconsole.log("${DAU_AN}", rangHang.length);
`;

const HOI_NHAN = `{
\t\t\twhere: { cuocSoanId: rangCuoc, loai: "muc-tieu-moi", trangThai: "cho" },
\t\t\torderBy: { createdAt: "asc" },
\t\t}`;

const HOI_BAC = `{
\t\t\twhere: { cuocSoanId: rangCuoc, loai: "muc-tieu-moi", trangThai: "cho" },
\t\t}`;

const DAO_DICH = `\t\tconst rangCuoc = canh.cuocSoanId;
\t\tconst rangCc = (
\t\t\tawait db.okrDeXuat.findMany({
\t\t\t\twhere: { cuocSoanId: rangCuoc, loai: "can-chinh-moi" },
\t\t\t})
\t\t).filter((h) => dongSoanTuHang(h).khoa === "m3:cc");
\t\tconst rangMocCc = new Set(rangCc.map((h) => h.createdAt.getTime()));
\t\tif (rangCc.length < 2 || rangMocCc.size !== rangCc.length)
\t\t\tthrow new Error(\`RANG-KHONG-DO-DUOC: \${rangCc.length} dong m3:cc co \${rangMocCc.size} moc createdAt\`);
\t\tconst rangCu = [...rangCc].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
${xepLai(`"createdAt" DESC`)}\t\tconst rangCuoi = (
\t\t\tawait db.okrDeXuat.findMany({
\t\t\t\twhere: { cuocSoanId: rangCuoc, loai: "can-chinh-moi" },
\t\t\t})
\t\t)
\t\t\t.filter((h) => dongSoanTuHang(h).khoa === "m3:cc")
\t\t\t.at(-1);
\t\tif (rangCuoi?.id !== rangCu.id)
\t\t\tthrow new Error("RANG-KHONG-DO-DUOC: dao thu tu khong an");
\t\tconsole.log("${DAU_AN}", rangCc.length);
`;

export const CA = {
	nhan: {
		tieuDe: `test("${CA_NHAN}: đổi tên qua chat không tạo dòng thứ hai cùng khoá`,
		chenSau: "\t\tawait nop(tron(), ctx);\n",
		dao: daoMucTieu("cuoc.id", HOI_NHAN),
		moi: '\t\tconst m1 = await mucTieuChoTheoKhoa(cuoc.id, "m1");\n',
		cu: `\t\tconst m1 = await db.okrDeXuat.findFirstOrThrow({
\t\t\twhere: { cuocSoanId: cuoc.id, loai: "muc-tieu-moi", trangThai: "cho" },
\t\t\torderBy: { createdAt: "asc" },
\t\t});
`,
		loc: CA_NHAN,
		soCa: 1,
		caDo: CA_NHAN,
		chuKy: [
			/^\+\s+"giu": \[\],$/m,
			/^\+\s+"Đối tác miền Bắc gắn bó thêm hai năm",?$/m,
		],
		tenChuKy: '"giu": [], m1 them ten moi — chu ky CI 37169842118',
	},
	bac: {
		tieuDe: `test("${CA_BAC} → bi-loai da-bac`,
		chenSau:
			"\t\tconst ctx = nguCanh(PHIEN_1, canh.nguoiMo.id, canh.cuocSoanId);\n",
		dao: daoMucTieu("canh.cuocSoanId", HOI_BAC),
		moi: '\t\tconst m1 = await mucTieuChoTheoKhoa(canh.cuocSoanId, "m1");\n',
		cu: `\t\tconst m1 = await db.okrDeXuat.findFirstOrThrow({
\t\t\twhere: {
\t\t\t\tcuocSoanId: canh.cuocSoanId,
\t\t\t\tloai: "muc-tieu-moi",
\t\t\t\ttrangThai: "cho",
\t\t\t},
\t\t});
`,
		loc: `${CA_TRON}|${CA_BAC}`,
		soCa: 2,
		caDo: CA_BAC,
		chuKy: [/^Expected: "so-moi"$/m, /^Received: undefined$/m],
		tenChuKy: 'm3 bi danh dau bac thay m1: Expected "so-moi", Received undefined',
	},
	dich: {
		tieuDe: `test("${CA_BAC} → bi-loai da-bac`,
		chenSau: "\t\tconst ra = await nop(lai, ctx);\n",
		dao: DAO_DICH,
		moi: `\t\t\torderBy: [{ createdAt: "asc" }, { id: "asc" }],
\t\t\tselect: { noiDung: true },
`,
		cu: "\t\t\tselect: { noiDung: true },\n",
		loc: `${CA_TRON}|${CA_BAC}`,
		soCa: 2,
		caDo: CA_BAC,
		chuKy: [/^\+\s+"id-la",$/m],
		tenChuKy: 'dich("m3:cc") doc dong can chinh cu: Received co "id-la"',
	},
};

export class MocVang extends Error {}

export function demMoc(src, moc) {
	return src.split(moc).length - 1;
}

function thayMotLan(src, cu, moi) {
	const n = demMoc(src, cu);
	if (n !== 1)
		throw new MocVang(`moc xuat hien ${n} lan, can 1: ${JSON.stringify(cu.slice(0, 70))}`);
	return src.replace(cu, moi);
}

export function banSao(src, ca, chieu) {
	const dau = src.indexOf(ca.tieuDe);
	if (dau < 0) throw new MocVang(`khong thay ca: ${ca.tieuDe.slice(0, 60)}`);
	const iChen = src.indexOf(ca.chenSau, dau);
	if (iChen < 0) throw new MocVang(`khong thay cho chen trong ca: ${ca.chenSau.trim()}`);
	const cuoi = iChen + ca.chenSau.length;
	let ra = src.slice(0, cuoi) + ca.dao + src.slice(cuoi);
	ra = thayMotLan(ra, ca.moi, chieu === "do" ? ca.cu : ca.moi);
	return ra
		.replaceAll('from "../agent/', `from "${join(GOI, "agent")}/`)
		.replaceAll('from "./support/', `from "${join(GOI, "test", "support")}/`);
}

function chay(src, ten, ca) {
	const thuMuc = join(GOC, ".acceptance-runs", SLUG, `sao-${ten}-${process.pid}`);
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
				`cd ${thuMuc} && CRM_TELEMETRY_DISABLED=1 bun test ./${tep} -t '${ca.loc}'`,
			],
			{ cwd: GOC, encoding: "utf8", timeout: TRAN_LUOT_MS },
		);
		return { ma: kq.status, ra: `${kq.stdout}\n${kq.stderr}` };
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
}

function doCa(goc, ten, chieu) {
	const ca = CA[ten];
	let src;
	try {
		src = banSao(goc, ca, chieu);
	} catch (e) {
		if (e instanceof MocVang) return { ma: 2, dong: [`${ten}: KHONG DO DUOC: ${e.message}`] };
		throw e;
	}
	const { ma, ra } = chay(src, `${ten}-${chieu}`, ca);
	const khongDo = /^error: (RANG-KHONG-DO-DUOC: [^\n]*)$/m.exec(ra);
	if (khongDo) return { ma: 2, dong: [`${ten}: KHONG DO DUOC: ${khongDo[1]}`] };
	const daAn = new RegExp(`${DAU_AN} (\\d+)`).exec(ra);
	if (!daAn)
		return {
			ma: 2,
			dong: [`${ten}: KHONG DO DUOC: ca khong chay toi buoc dao thu tu (ma ${ma})`, ra.slice(-1200)],
		};
	const dau = `${ten}: ${daAn[1]} dong da xep lai thu tu vat ly`;
	const coDo = ra.includes(`(fail) nop-ban-nhap > ${ca.caDo}`);
	if (chieu === "xanh") {
		const du = new RegExp(`\\b${ca.soCa} pass\\b`).test(ra) && /\b0 fail\b/.test(ra);
		if (ma === 0 && du && !coDo)
			return { ma: 0, dong: [`${dau}; bo chon moi: ${ca.soCa} pass, 0 fail`] };
		return { ma: 1, dong: [`${dau}; bo chon moi KHONG xanh (ma ${ma})`, ra.slice(-1200)] };
	}
	const khop = ca.chuKy.every((r) => r.test(ra));
	if (ma !== 0 && coDo && khop)
		return { ma: 0, dong: [`${dau}; bo chon cu do dung chu ky: ${ca.tenChuKy}`] };
	return {
		ma: 1,
		dong: [`${dau}; bo chon cu KHONG do dung chu ky (ma ${ma}, ca do ${coDo}, chu ky ${khop})`, ra.slice(-1200)],
	};
}

function chinh() {
	const chieu = process.argv[2];
	if (chieu !== "xanh" && chieu !== "do") {
		console.log("KHONG DO DUOC: doi so phai la xanh hoac do");
		process.exit(2);
	}
	if (!existsSync(SPEC)) {
		console.log(`KHONG DO DUOC: vang ${SPEC}`);
		process.exit(2);
	}
	const goc = readFileSync(SPEC, "utf8");
	const ket = Object.keys(CA).map((ten) => doCa(goc, ten, chieu));
	for (const k of ket) for (const d of k.dong) console.log(d);
	process.exit(Math.max(...ket.map((k) => k.ma)));
}

if (import.meta.main) chinh();
