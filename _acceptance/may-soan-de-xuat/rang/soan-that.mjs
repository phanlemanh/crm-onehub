import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const MAU = join(GOC, "_acceptance", "may-soan-de-xuat", "mau");
const QUY_TAC = join(MAU, "quy-tac-viet.md");
const THU_MUC_THAT = join(MAU, "that");
const TEP_THAT = ["quyet-dinh-hoa-hong.docx", "quy-trinh.pdf", "bieu-mau.docx"];
const RA = join(GOC, ".acceptance-runs", "may-soan-de-xuat", "evidence");
const AGENT = join(GOC, "apps", "agent", "agent");
const BIEN_KHOA = [
	"KHO_TAI_LIEU_AI_GATEWAY_API_KEY",
	"AI_GATEWAY_API_KEY",
	"VERCEL_OIDC_TOKEN",
];

const tuAgent = (ten) => Bun.resolveSync(ten, join(GOC, "apps", "agent"));

function dung(ma, cau) {
	console.log(cau);
	process.exit(ma);
}

if (!existsSync(QUY_TAC)) {
	dung(2, `thieu trang Quy tac viet cua chu kho: ${QUY_TAC}`);
}
const thieuTep = TEP_THAT.filter((t) => !existsSync(join(THU_MUC_THAT, t)));
if (thieuTep.length > 0) {
	dung(
		2,
		`thieu tep mau that: ${thieuTep.join(", ")} (dat vao ${THU_MUC_THAT})`,
	);
}
if (!BIEN_KHOA.some((b) => process.env[b]?.trim())) {
	dung(2, `thieu khoa AI Gateway: dat mot trong ${BIEN_KHOA.join(", ")}`);
}
if (!/_do(\?|$)/.test(process.env.DATABASE_URL ?? "")) {
	dung(
		2,
		"khong phai kho do dung-mot-lan: chay qua scripts/lan-do/tien-de.mjs",
	);
}

const { db } = await import(tuAgent("@crm/db"));
const { taoDeXuatTaiLieu } = await import(tuAgent("@crm/db/tai-lieu-de-xuat"));
const { khoNguonGia } = await import(
	join(GOC, "packages/db/test/blob-nguon-gia.ts")
);
const { generateText, stepCountIs, tool } = await import(tuAgent("ai"));
const { TAI_LIEU_AGENT } = await import(join(AGENT, "lib/tai-lieu-config.ts"));
const { chaySoanTuNguon } = await import(join(AGENT, "lib/tai-lieu-soan.ts"));
const { dungLoiDan } = await import(join(AGENT, "lib/tai-lieu-loi-dan.ts"));
const { modelMaySoan, nhanKhoaMaySoan } = await import(
	join(AGENT, "lib/tai-lieu-model.ts")
);
const { ghiSoMaySoan, nopBanDeXuat } = await import(
	join(AGENT, "lib/tai-lieu-nop.ts")
);
const { dongKhiPhienXong, guiMaySoan, tinMaySoan, tokenMaySoan } = await import(
	join(AGENT, "lib/tai-lieu-phien.ts")
);
const { default: congCuNop } = await import(
	join(AGENT, "subagents/may_soan/tools/nop_ban_de_xuat.ts")
);

const SOAN = TAI_LIEU_AGENT.soan;
const moc = Date.now().toString(36);
const bam = (b) => createHash("sha256").update(b).digest("hex");

async function datBanDangDung(trangId, nguoiId, ten, noiDung) {
	await db.$transaction(async (tx) => {
		const { deXuatId } = await taoDeXuatTaiLieu(tx, {
			trangId,
			banGocId: null,
			ten,
			noiDung,
			taoBoiId: nguoiId,
			suKien: "DE_XUAT",
		});
		const ban = await tx.taiLieuPhienBan.create({
			data: {
				trangId,
				so: 1,
				ten,
				noiDung,
				noiDungHash: bam(noiDung),
				deXuatId,
				duyetBoiId: nguoiId,
				duyetLuc: new Date(),
			},
		});
		await tx.taiLieuDeXuat.update({
			where: { id: deXuatId },
			data: { trangThai: "DA_DUYET", xuLyLuc: new Date() },
		});
		await tx.taiLieuTrang.update({
			where: { id: trangId },
			data: { banDangDungId: ban.id },
		});
	});
}

async function gieo() {
	const nguoiId = `soan-that-${moc}`;
	await db.user.create({
		data: {
			id: nguoiId,
			name: "Chủ kho (lượt đo)",
			email: `${nguoiId}@lan-do.test`,
		},
	});
	const cu = await db.taiLieuTrang.findUnique({
		where: { slug: SOAN.slugQuyTacViet },
		select: { id: true },
	});
	if (cu) dung(2, "kho do da co trang Quy tac viet — khong ghi de");
	const quyTac = await db.taiLieuTrang.create({
		data: {
			slug: SOAN.slugQuyTacViet,
			ten: "Quy tắc viết",
			loai: "quy-dinh",
			chuTrangId: nguoiId,
			taoBoiId: nguoiId,
		},
	});
	const noiDung = readFileSync(QUY_TAC, "utf8").normalize("NFC");
	await datBanDangDung(quyTac.id, nguoiId, "Quy tắc viết", noiDung);
	return nguoiId;
}

function congCuThat(nguonId, phien, bac) {
	return tool({
		description: congCuNop.description,
		inputSchema: congCuNop.inputSchema,
		async execute(input) {
			const kq = await nopBanDeXuat(nguonId, phien, input);
			if (!kq.ok) {
				bac.push(kq.loi);
				throw new Error(kq.loi);
			}
			return { daNop: true, deXuatId: kq.deXuatId };
		},
	});
}

async function soanMot(tep, nguoiId, kho) {
	const byte = new Uint8Array(readFileSync(join(THU_MUC_THAT, tep)));
	const ten = basename(tep, extname(tep));
	const trang = await db.taiLieuTrang.create({
		data: {
			slug: `soan-that-${ten}-${moc}`,
			ten: `Trang từ ${tep}`,
			loai: "quy-dinh",
			chuTrangId: nguoiId,
			taoBoiId: nguoiId,
		},
	});
	const pathname = `nguon/soan-that-${ten}-${moc}`;
	kho.daPut.set(pathname, byte);
	const nguon = await db.taiLieuNguon.create({
		data: {
			sha256: bam(byte),
			tenTep: tep,
			kieu: tep.endsWith(".pdf") ? "pdf" : "docx",
			kichThuoc: byte.length,
			blobPathname: pathname,
			taiBoiId: nguoiId,
			trangId: trang.id,
		},
	});
	const viec = await db.agentTask.create({
		data: {
			kind: "soan-tu-nguon",
			reason: "soan-that",
			priority: 300,
			budget: 0,
			dueAt: new Date(),
			payload: { nguonId: nguon.id },
		},
	});
	await chaySoanTuNguon(
		{ ...viec, payload: { nguonId: nguon.id }, attempts: 1 },
		kho,
	);
	const bac = [];
	const phien = `soan-that-${ten}-${moc}`;
	const hang = await db.taiLieuNguon.findUniqueOrThrow({
		where: { id: nguon.id },
		select: { trangThai: true, lyDo: true },
	});
	if (hang.trangThai === "CHO_SOAN") {
		await guiMaySoan(nguon.id, async () => {
			const { loiDan, khoiDuLieu } = await dungLoiDan(nguon.id);
			await generateText({
				model: modelMaySoan().model,
				system: `${loiDan}\n\n${khoiDuLieu}`,
				prompt: tinMaySoan(nguon.id),
				tools: { nop_ban_de_xuat: congCuThat(nguon.id, phien, bac) },
				stopWhen: stepCountIs(SOAN.tranBuoc + 2),
				maxOutputTokens: SOAN.gioiHan.maxOutputTokensPerSession,
				async onStepFinish(buoc) {
					await ghiSoMaySoan(nguon.id, phien, {
						tokenVao: buoc.usage?.inputTokens ?? 0,
						tokenRa: buoc.usage?.outputTokens ?? 0,
					});
				},
			});
			return { id: phien };
		});
		await dongKhiPhienXong(tokenMaySoan(nguon.id));
	}
	return ghiRa(tep, nguon.id, trang.id, bac);
}

async function ghiRa(tep, nguonId, trangId, bac) {
	const nguon = await db.taiLieuNguon.findUniqueOrThrow({
		where: { id: nguonId },
		select: { trangThai: true, lyDo: true, soTrang: true },
	});
	const dx = await db.taiLieuDeXuat.findFirst({
		where: { nguonId },
		select: { ten: true, noiDung: true, trichDoan: true },
	});
	const so = await db.taiLieuSuKien.findFirst({
		where: { trangId, loai: "MAY_SOAN" },
		select: { chiTiet: true },
	});
	const ten = basename(tep, extname(tep));
	const dong = [
		`# Máy soạn — ${tep}`,
		"",
		`- Trạng thái nguồn: ${nguon.trangThai}${nguon.lyDo ? ` — ${nguon.lyDo}` : ""}`,
		`- Số trang đọc được: ${nguon.soTrang ?? "—"}`,
		`- Mã model: ${SOAN.maModel} · khoá: ${nhanKhoaMaySoan()}`,
		`- Sổ chi phí: ${JSON.stringify(so?.chiTiet ?? null)}`,
		`- Số lần bị bác: ${bac.length}`,
		...bac.map((b, i) => `  ${i + 1}. ${b}`),
		"",
		"## Bản đề xuất",
		"",
		dx
			? `### ${dx.ten}\n\n${dx.noiDung}`
			: "(không có bản nào qua được kiểm số)",
		"",
		"## Trích đoạn",
		"",
		...(Array.isArray(dx?.trichDoan) ? dx.trichDoan : []).map(
			(t) => `- **${t.menhDe}** — «${t.trich}»`,
		),
		"",
	];
	mkdirSync(RA, { recursive: true });
	const duong = join(RA, `soan-that-${ten}.md`);
	writeFileSync(duong, dong.join("\n"));
	const chiPhi = so?.chiTiet?.chiPhiUsd ?? null;
	console.log(
		`${tep}: ${nguon.trangThai}${dx ? " · co de xuat" : ""} · bac ${bac.length} · chi phi ${chiPhi ?? "chua co gia"} · ${duong}`,
	);
	return { dat: nguon.trangThai === "DA_SOAN" && dx !== null, chiPhi };
}

const nguoiId = await gieo();
const kho = khoNguonGia();
const ket = [];
for (const tep of TEP_THAT) ket.push(await soanMot(tep, nguoiId, kho));
const tong = ket.reduce((s, k) => s + (k.chiPhi ?? 0), 0);
console.log(`chi phi tong: ${tong.toFixed(6)} USD (${SOAN.maModel})`);
console.log(
	"duong model: generateText truc tiep voi loi dan, tool va kiem so that — khong qua runtime eve",
);
await db.$disconnect();
process.exit(ket.every((k) => k.dat) ? 0 : 1);
