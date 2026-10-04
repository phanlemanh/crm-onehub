import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const HERE = dirname(TEP_NAY);
const GOC = join(HERE, "..", "..", "..");
const HO_SO = join(GOC, "_acceptance", "tro-ly-doc-kho");
const AGENT = join(GOC, "apps", "agent");
const BO_MAC_DINH = join(HO_SO, "bo-do", "mam-tam.json");
const TRANG_MAU = join(HO_SO, "bo-do", "trang-mau");
const THU_MUC_BANG_CHUNG =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "tro-ly-doc-kho", "evidence");
const NHAN_BO_TAM = "tam";
const NGUONG = {
	dungTrang: 0.8,
	tuChoiDung: 0.8,
	chuyenQuyDinh: 0.9,
	chuyenNhamToiDa: 0.1,
	traLoiKhongQuaKiem: 0,
} as const;
const KHO_DO = /\/crm_[a-z0-9_]+_do(\?|$)/;
const THU_MUC_CHAY = join(
	GOC,
	".acceptance-runs",
	"tro-ly-doc-kho",
	"cham-bo-do",
);
const EVE = join(AGENT, "node_modules", ".bin", "eve");
const BAI_EVAL = "tro-ly-kho/cham-bo-do";
const TRAN_EVE_MS = 100 * 60_000;
const TEN_ZALO = "Người đo";
const SONG_SONG = "2";

const doiSo = process.argv.slice(2);
const viTriBo = doiSo.indexOf("--bo");
const tepBo =
	viTriBo >= 0 && doiSo[viTriBo + 1]
		? resolve(process.cwd(), doiSo[viTriBo + 1] ?? "")
		: BO_MAC_DINH;

function khongDo(cau: string): never {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

if (!process.env.PHIEN_DO) {
	const lenh = `bun ${relative(GOC, TEP_NAY)}${viTriBo >= 0 ? ` --bo ${JSON.stringify(tepBo)}` : ""}`;
	const ra = spawnSync(
		"bash",
		[join(GOC, "_acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh"), lenh],
		{ cwd: GOC, stdio: "inherit" },
	);
	process.exit(ra.status ?? 2);
}

if (
	!process.env.KHO_TAI_LIEU_AI_GATEWAY_API_KEY?.trim() &&
	!process.env.AI_GATEWAY_API_KEY?.trim()
)
	khongDo(
		"thieu khoa AI Gateway (KHO_TAI_LIEU_AI_GATEWAY_API_KEY hoac AI_GATEWAY_API_KEY)",
	);
if (!existsSync(tepBo)) khongDo(`khong co bo cau ${tepBo}`);

const yeuCau = createRequire(join(AGENT, "package.json"));
const { z } = yeuCau("zod") as typeof import("zod");

const khuonCau = z.object({
	id: z.string().min(1),
	nhom: z.enum(["co-trang", "khong-co", "khong-dau", "khong-phai-quy-dinh"]),
	cau: z.string().min(2).max(500),
	mong: z.array(z.array(z.string().min(1)).min(1)).optional(),
	kho: z.enum(["nguong-ngoai-le", "hai-trang"]).optional(),
	bienTheCua: z.string().optional(),
	tam: z.boolean().optional(),
});
const khuonBo = z.object({
	nhan: z.string().min(1),
	nguon: z.string().min(1),
	cau: z.array(khuonCau).min(1),
});
type Cau = z.infer<typeof khuonCau>;

const docBo = khuonBo.safeParse(JSON.parse(readFileSync(tepBo, "utf8")));
if (!docBo.success)
	khongDo(`bo cau sai khuon: ${docBo.error.message.slice(0, 400)}`);
const bo = docBo.data;
for (const c of bo.cau) {
	if ((c.nhom === "co-trang" || c.nhom === "khong-dau") && !c.mong?.length)
		khongDo(`cau ${c.id} co trang ma khong khai trang mong doi`);
}

const { db } = await import(join(GOC, "packages/db/src/index.ts"));
const { demHoiKho } = await import(
	join(GOC, "packages/db/src/tai-lieu-hoi.ts")
);
const { docNhieuBanDangDung } = await import(
	join(GOC, "packages/db/src/tai-lieu-tim.ts")
);
const { kiemTraLoi, parseTraLoi } = await import(
	join(GOC, "packages/validation/src/tai-lieu-hoi.ts")
);
const { chuThuong } = await import(
	join(GOC, "packages/validation/src/tai-lieu-markdown.ts")
);
const { dauNgayVN } = await import(
	join(GOC, "packages/db/src/onboarding-nhac.ts")
);
const { gieoNguoi, ma, trangDaDuyet } = await import(
	join(AGENT, "test/support/tro-ly-kho-gia.ts")
);
const { thanWebhook } = await import(join(AGENT, "test/support/zalo-tin.ts"));
const { zaloMayChu } = await import(
	join(AGENT, "test/support/zalo-may-chu.ts")
);
const { CHAM_BO_DO_ENV, docKetQua } = await import(
	join(AGENT, "evals/tro-ly-kho/ke-hoach.ts")
);
const { TAI_LIEU_AGENT } = await import(
	join(AGENT, "agent/lib/tai-lieu-config.ts")
);
const { modelTaiLieu, nhanKhoaTaiLieu } = await import(
	join(AGENT, "agent/lib/tai-lieu-model.ts")
);
const { modelTheoVai } = await import(join(AGENT, "agent/lib/model.ts"));
const { DEFAULT_AGENT_MODEL } = await import(
	join(GOC, "packages/db/src/settings.ts")
);

type KetQua = Awaited<ReturnType<typeof docKetQua>>[number];
type KetMot = Extract<KetQua, { luot: 1 }>;
type KetHai = Extract<KetQua, { luot: 2 }>;
type Luot1 = {
	cau: Cau;
	nhan: "dung-trang" | "tu-choi-dung" | "sai";
	trangThai: string;
	chiTiet: string;
};
type Luot2 = {
	cau: Cau;
	nhan: "chuyen" | "khong-chuyen";
	conGoi: string;
	ketQua: string;
	traLoi: string;
};

function trichCua(traLoi: ReturnType<typeof parseTraLoi>): Set<string> {
	return new Set(traLoi.cau.flatMap((c) => c.trich.map((t) => t.slug)));
}

async function kiemLai(
	traLoi: ReturnType<typeof parseTraLoi>,
): Promise<boolean> {
	const ban = await docNhieuBanDangDung(db, [...trichCua(traLoi)]);
	const bangBan = new Map(
		ban.map(
			(b: {
				slug: string;
				ten: string;
				so: number;
				duyetLuc: Date;
				noiDung: string;
				xacMinhDen: Date | null;
				chuTen: string;
			}) => [
				b.slug,
				{
					slug: b.slug,
					ten: b.ten,
					phienBan: b.so,
					duyetLuc: b.duyetLuc.toISOString(),
					noiDung: b.noiDung,
					xacMinhDen: b.xacMinhDen?.toISOString() ?? null,
					chuTrang: b.chuTen,
				},
			],
		),
	);
	const kq = kiemTraLoi(
		{
			cau: traLoi.cau.map((c) => ({
				chu: c.chu,
				trich: c.trich.map((t) => ({
					slug: t.slug,
					phienBan: t.phienBan,
					doan: t.doan,
				})),
			})),
		},
		bangBan,
		dauNgayVN(new Date()),
		chuThuong,
	);
	return kq.ok;
}

async function nhanMot(
	c: Cau,
	k: KetMot | undefined,
	slugCua: Map<string, string>,
): Promise<Luot1 & { khongQuaKiem: boolean; traLoi: string; conGoi: string }> {
	if (!k)
		return {
			cau: c,
			nhan: "sai",
			trangThai: "khong co ket qua eval",
			chiTiet: "",
			khongQuaKiem: false,
			traLoi: "",
			conGoi: "",
		};
	const hang = await db.taiLieuHoi.findUniqueOrThrow({
		where: { id: k.hoiId },
		select: { trangThai: true, lyDo: true, traLoi: true, soLanBac: true },
	});
	const conGoi = k.conGoi.join(", ") || "—";
	if (hang.trangThai === "TRA_LOI") {
		const traLoi = parseTraLoi(hang.traLoi);
		const daTrich = trichCua(traLoi);
		const du = (c.mong ?? []).every((nhom) =>
			nhom.some((x) => daTrich.has(slugCua.get(x) ?? `?${x}`)),
		);
		const qua = await kiemLai(traLoi);
		const chuTraLoi = traLoi.cau
			.map(
				(x) =>
					`${x.chu} [${x.trich.map((t) => `${t.slug}#${t.phienBan}: «${t.doan}»`).join("; ")}]`,
			)
			.join(" ");
		return {
			cau: c,
			nhan: c.nhom === "khong-co" ? "sai" : du ? "dung-trang" : "sai",
			trangThai: "TRA_LOI",
			chiTiet: `trich ${[...daTrich].join(", ")}; bac ${hang.soLanBac}`,
			khongQuaKiem: !qua,
			traLoi: chuTraLoi,
			conGoi,
		};
	}
	const trangThai = hang.lyDo
		? `${hang.trangThai} ${hang.lyDo}`
		: hang.trangThai;
	return {
		cau: c,
		nhan:
			c.nhom === "khong-co" && hang.trangThai === "TU_CHOI"
				? "tu-choi-dung"
				: "sai",
		trangThai,
		chiTiet: `${k.loi ? `eval: ${k.loi}; ` : ""}bac ${hang.soLanBac}`,
		khongQuaKiem: false,
		traLoi: "",
		conGoi,
	};
}

async function nhanHai(
	c: Cau,
	k: KetHai | undefined,
	traLoiCua: (messageId: string) => string,
): Promise<Luot2> {
	if (!k?.zaloHoiId)
		return {
			cau: c,
			nhan: "khong-chuyen",
			conGoi: "—",
			ketQua: k?.loi ?? "khong co ket qua eval",
			traLoi: "",
		};
	const coHang =
		(await db.taiLieuHoi.count({
			where: { zaloHoiId: k.zaloHoiId, kenh: "ZALO" },
		})) > 0;
	return {
		cau: c,
		nhan: coHang ? "chuyen" : "khong-chuyen",
		conGoi: k.conGoi.join(", ") || "—",
		ketQua: `${k.ketQua ?? "?"}${k.loi ? ` (${k.loi})` : ""}`,
		traLoi: traLoiCua(k.messageId),
	};
}

async function chayEve(env: Record<string, string>, nhatKy: string) {
	const tienTrinh = Bun.spawn(
		[EVE, "eval", BAI_EVAL, "--verbose", "--max-concurrency", SONG_SONG],
		{
			cwd: AGENT,
			env: { ...process.env, ...env },
			stdout: "pipe",
			stderr: "pipe",
		},
	);
	const hen = setTimeout(() => tienTrinh.kill(), TRAN_EVE_MS);
	const [ra, loi, ma] = await Promise.all([
		new Response(tienTrinh.stdout).text(),
		new Response(tienTrinh.stderr).text(),
		tienTrinh.exited,
	]);
	clearTimeout(hen);
	writeFileSync(nhatKy, `${ra}\n${loi}`);
	return { ma, ra };
}

const tiLe = (tu: number, mau: number) => (mau === 0 ? 0 : tu / mau);
const phanTram = (x: number) => `${(x * 100).toFixed(1)}%`;
const o = (x: string) => x.replaceAll("|", "/").replaceAll("\n", " ");

const mayChu = zaloMayChu();
try {
	if (!KHO_DO.test(process.env.DATABASE_URL ?? ""))
		khongDo("DATABASE_URL khong phai kho do dung-mot-lan crm_<cay>_do");
	const quanTri = await gieoNguoi("owner");
	const slugCua = new Map<string, string>();
	for (const f of readdirSync(TRANG_MAU)
		.filter((x) => x.endsWith(".md"))
		.sort()) {
		const chu = readFileSync(join(TRANG_MAU, f), "utf8");
		const [dau, ...than] = chu.split("\n");
		const ten = (dau ?? "").replace(/^#\s*/, "").trim();
		const { slug } = await trangDaDuyet(quanTri, ten, than.join("\n").trim());
		slugCua.set(f.replace(/\.md$/, ""), slug);
	}
	for (const c of bo.cau)
		for (const nhom of c.mong ?? [])
			for (const k of nhom)
				if (!slugCua.has(k))
					khongDo(`cau ${c.id} mong trang ${k} khong co trong trang-mau`);
	await db.appSetting.updateMany({
		data: { zaloBotToken: null, zaloWebhookSecret: null },
	});

	const nguoiCua = new Map<string, { id: string; zaloUserId: string }>();
	for (const c of bo.cau) {
		const nguoi = await gieoNguoi("member");
		const zaloUserId = ma("zalo");
		await db.zaloLink.create({
			data: { crmUserId: nguoi.id, zaloUserId, zaloDisplayName: TEN_ZALO },
		});
		nguoiCua.set(c.id, { id: nguoi.id, zaloUserId });
	}
	const cuaCau = (c: Cau) => {
		const n = nguoiCua.get(c.id);
		if (!n) khongDo(`cau ${c.id} khong co nguoi hoi`);
		return n;
	};
	const keHoach = {
		lo: TAI_LIEU_AGENT.hoi.loGui,
		mot: bo.cau
			.filter((c) => c.nhom !== "khong-phai-quy-dinh")
			.map((c) => ({ id: c.id, cau: c.cau, nguoiId: cuaCau(c).id })),
		hai: bo.cau.map((c) => {
			const n = cuaCau(c);
			const messageId = ma("msg");
			return {
				id: c.id,
				cau: c.cau,
				nguoiId: n.id,
				messageId,
				than: JSON.stringify(
					thanWebhook({
						messageId,
						fromId: n.zaloUserId,
						ten: TEN_ZALO,
						text: c.cau,
					}),
				),
			};
		}),
	};
	console.log(
		`-- bo ${relative(GOC, tepBo)} (${bo.nhan}): ${bo.cau.length} cau; gieo ${slugCua.size} trang`,
	);

	mkdirSync(THU_MUC_CHAY, { recursive: true });
	const tepKeHoach = join(THU_MUC_CHAY, "ke-hoach.json");
	const tepKetQua = join(THU_MUC_CHAY, "ket-qua.jsonl");
	const nhatKy = join(THU_MUC_CHAY, "eve.log");
	writeFileSync(tepKeHoach, JSON.stringify(keHoach));
	writeFileSync(tepKetQua, "");
	const zaloToken = randomBytes(16).toString("hex");
	const tu = new Date();
	const eve = await chayEve(
		{
			AGENT_BRIDGE_SECRET: randomBytes(24).toString("hex"),
			ZALO_BOT_TOKEN: zaloToken,
			ZALO_WEBHOOK_SECRET: randomBytes(24).toString("hex"),
			ZALO_API_URL: mayChu.url,
			CRM_TELEMETRY_DISABLED: "1",
			[CHAM_BO_DO_ENV.keHoach]: tepKeHoach,
			[CHAM_BO_DO_ENV.ketQua]: tepKetQua,
		},
		nhatKy,
	);
	const den = new Date();
	const ket = docKetQua(readFileSync(tepKetQua, "utf8"));
	const ketMot = new Map(
		ket.flatMap((k) => (k.luot === 1 ? [[k.id, k] as const] : [])),
	);
	const ketHai = new Map(
		ket.flatMap((k) => (k.luot === 2 ? [[k.id, k] as const] : [])),
	);
	if (ketMot.size !== keHoach.mot.length || ketHai.size !== keHoach.hai.length)
		khongDo(
			`eve eval ma ${eve.ma}: ${ketMot.size}/${keHoach.mot.length} cau luot mot, ${ketHai.size}/${keHoach.hai.length} cau luot hai co ket qua — xem ${relative(GOC, nhatKy)}`,
		);

	const chatCua = new Map(keHoach.hai.map((h) => [h.messageId, h.id]));
	const traLoiCua = (messageId: string) => {
		const id = chatCua.get(messageId);
		const zaloUserId = id ? nguoiCua.get(id)?.zaloUserId : undefined;
		return mayChu.goi
			.filter(
				(g) => g.method === "sendMessage" && g.body.chat_id === zaloUserId,
			)
			.map((g) => g.body.text ?? "")
			.join(" / ");
	};

	const mot: Awaited<ReturnType<typeof nhanMot>>[] = [];
	for (const c of bo.cau.filter((x) => x.nhom !== "khong-phai-quy-dinh")) {
		const r = await nhanMot(c, ketMot.get(c.id), slugCua);
		mot.push(r);
		console.log(`${c.id} ${r.nhan}`);
	}
	const hai: Luot2[] = [];
	for (const c of bo.cau) {
		const r = await nhanHai(c, ketHai.get(c.id), traLoiCua);
		hai.push(r);
		console.log(`${c.id} ${r.nhan}`);
	}

	const coTrang = mot.filter((r) => r.cau.nhom !== "khong-co");
	const khongCo = mot.filter((r) => r.cau.nhom === "khong-co");
	const quyDinh = hai.filter((r) => r.cau.nhom !== "khong-phai-quy-dinh");
	const khongPhai = hai.filter((r) => r.cau.nhom === "khong-phai-quy-dinh");
	const so = {
		dungTrang: tiLe(
			coTrang.filter((r) => r.nhan === "dung-trang").length,
			coTrang.length,
		),
		tuChoiDung: tiLe(
			khongCo.filter((r) => r.nhan === "tu-choi-dung").length,
			khongCo.length,
		),
		chuyenQuyDinh: tiLe(
			quyDinh.filter((r) => r.nhan === "chuyen").length,
			quyDinh.length,
		),
		chuyenNham: tiLe(
			khongPhai.filter((r) => r.nhan === "chuyen").length,
			khongPhai.length,
		),
		traLoiKhongQuaKiem: mot.filter((r) => r.khongQuaKiem).length,
	};
	const dat = {
		dungTrang: so.dungTrang >= NGUONG.dungTrang,
		tuChoiDung: so.tuChoiDung >= NGUONG.tuChoiDung,
		chuyenQuyDinh: so.chuyenQuyDinh >= NGUONG.chuyenQuyDinh,
		chuyenNham: so.chuyenNham <= NGUONG.chuyenNhamToiDa,
		traLoiKhongQuaKiem: so.traLoiKhongQuaKiem === NGUONG.traLoiKhongQuaKiem,
	};
	const dem = await demHoiKho(db, tu, den);
	const tong = [
		`dung trang: ${phanTram(so.dungTrang)} (nguong >= ${phanTram(NGUONG.dungTrang)}) ${dat.dungTrang ? "dat" : "KHONG DAT"}`,
		`tu choi dung: ${phanTram(so.tuChoiDung)} (nguong >= ${phanTram(NGUONG.tuChoiDung)}) ${dat.tuChoiDung ? "dat" : "KHONG DAT"}`,
		`Zalo chuyen cau quy dinh: ${phanTram(so.chuyenQuyDinh)} (nguong >= ${phanTram(NGUONG.chuyenQuyDinh)}) ${dat.chuyenQuyDinh ? "dat" : "KHONG DAT"}`,
		`Zalo chuyen nham cau khong phai quy dinh: ${phanTram(so.chuyenNham)} (nguong <= ${phanTram(NGUONG.chuyenNhamToiDa)}) ${dat.chuyenNham ? "dat" : "KHONG DAT"}`,
		`tra loi co trich khong qua kiem (dem lai): ${so.traLoiKhongQuaKiem} ${dat.traLoiKhongQuaKiem ? "dat" : "KHONG DAT"}`,
		`demHoiKho cua cua so chay: traLoi ${dem.traLoi}, tuChoi ${dem.tuChoi}, loi ${dem.loi}, tiLe ${dem.tiLe === null ? "—" : phanTram(dem.tiLe)}`,
		`eve eval ${BAI_EVAL}: ma thoat ${eve.ma}`,
	];
	for (const d of tong) console.log(d);

	const modelGoc =
		(await modelTheoVai("tro-ly"))?.model ?? DEFAULT_AGENT_MODEL.id;
	const banHoi = [
		`# Chấm bộ câu đo — ${new Date().toISOString()}`,
		"",
		`Bộ: \`${isAbsolute(tepBo) ? relative(GOC, tepBo) : tepBo}\` (nhãn \`${bo.nhan}\`). ${bo.nguon}`,
		"",
		`Cả hai lượt chạy bằng \`eve eval ${BAI_EVAL}\`: máy chủ eve thật của \`apps/agent\`, chỉ dẫn và tool đúng như eve gửi, phiên con thật. Lượt một: mỗi câu là một hàng TaiLieuHoi kênh CRM, \`/internal/crm/dispatch\` mở phiên purpose kho; model \`${modelTaiLieu("hoi").model.modelId}\`, khoá ${nhanKhoaTaiLieu("hoi")}. Lượt hai: mỗi câu là một tin Zalo qua \`/zalo/webhook\` (Zalo giả nhận câu trả lời) của một người đã nối Zalo; model agent gốc \`${modelGoc}\`; «chuyển» = có hàng TaiLieuHoi kênh ZALO gắn với hàng ZaloHoi của tin đó.`,
		"",
		"## Tổng",
		"",
		...tong.map((d) => `- ${d}`),
		"",
		"## Lượt một — hỏi qua tro_ly_kho",
		"",
		"| id | nhóm | câu | nhãn | trạng thái | chi tiết | phiên con | câu trả lời |",
		"| --- | --- | --- | --- | --- | --- | --- | --- |",
		...mot.map(
			(r) =>
				`| ${r.cau.id} | ${r.cau.nhom}${r.cau.kho ? ` (${r.cau.kho})` : ""} | ${r.cau.cau} | ${r.nhan} | ${r.trangThai} | ${o(r.chiTiet)} | ${r.conGoi} | ${o(r.traLoi)} |`,
		),
		"",
		"## Lượt hai — hỏi qua agent gốc purpose zalo",
		"",
		"| id | nhóm | câu | nhãn | phiên con | ZaloHoi | trả lời trên Zalo |",
		"| --- | --- | --- | --- | --- | --- | --- |",
		...hai.map(
			(r) =>
				`| ${r.cau.id} | ${r.cau.nhom} | ${r.cau.cau} | ${r.nhan} | ${r.conGoi} | ${o(r.ketQua)} | ${o(r.traLoi)} |`,
		),
		"",
	].join("\n");
	const bangChung = join(
		THU_MUC_BANG_CHUNG,
		bo.nhan === NHAN_BO_TAM ? "cham-bo-do.md" : `cham-bo-do-${bo.nhan}.md`,
	);
	mkdirSync(THU_MUC_BANG_CHUNG, { recursive: true });
	writeFileSync(bangChung, banHoi);
	console.log(`ghi ${relative(GOC, bangChung)}`);
	mayChu.dung();
	await db.$disconnect();
	process.exit(Object.values(dat).every(Boolean) ? 0 : 1);
} catch (e) {
	mayChu.dung();
	await db.$disconnect().catch(() => null);
	khongDo(
		String(e instanceof Error ? (e.stack ?? e.message) : e).slice(0, 800),
	);
}
