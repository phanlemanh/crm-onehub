import { spawnSync } from "node:child_process";
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
const THU_MUC_BANG_CHUNG = join(HO_SO, "evidence");
const NHAN_BO_TAM = "tam";
const NGUONG = {
	dungTrang: 0.8,
	tuChoiDung: 0.8,
	chuyenQuyDinh: 0.9,
	chuyenNhamToiDa: 0.1,
	traLoiKhongQuaKiem: 0,
} as const;
const SO_BUOC_TOI_DA = 12;
const LOI_CHUA_NOP = "phien ket thuc ma chua goi nop_tra_loi";

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
const ai = yeuCau("ai") as typeof import("ai");
const { createGateway } = yeuCau(
	"@ai-sdk/gateway",
) as typeof import("@ai-sdk/gateway");

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
const { ghiKetQuaHoi, demHoiKho } = await import(
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
const { ctxConCua, gieoNguoi, ma, moHoiCrm, trangDaDuyet } = await import(
	join(AGENT, "test/support/tro-ly-kho-gia.ts")
);
const { LOI_DAN } = await import(
	join(AGENT, "agent/subagents/tro_ly_kho/instructions.ts")
);
const { modelTaiLieu, nhanKhoaTaiLieu } = await import(
	join(AGENT, "agent/lib/tai-lieu-model.ts")
);
const { ZALO } = await import(join(AGENT, "agent/lib/zalo-config.ts"));
const { modelTheoVai } = await import(join(AGENT, "agent/lib/model.ts"));
const { DEFAULT_AGENT_MODEL } = await import(
	join(GOC, "packages/db/src/settings.ts")
);

type KhuonChuan = {
	"~standard": { jsonSchema: { input: (o: { target: string }) => object } };
};
type GiaTri =
	| string
	| number
	| boolean
	| null
	| GiaTri[]
	| { [k: string]: GiaTri };
type VaoCongCu = { [k: string]: GiaTri };
type NguCanh = { session: { id: string } };
type CongCuEve = {
	description: string;
	inputSchema: KhuonChuan;
	execute: (vao: VaoCongCu, ctx: NguCanh) => Promise<GiaTri>;
};

const khuonJson = (k: KhuonChuan) =>
	ai.jsonSchema(k["~standard"].jsonSchema.input({ target: "draft-07" }));

async function congCu(duong: string): Promise<CongCuEve> {
	return (await import(join(AGENT, duong))).default as CongCuEve;
}

const congCuKho = {
	search_pages: await congCu(
		"agent/subagents/tro_ly_kho/tools/search_pages.ts",
	),
	read_page: await congCu("agent/subagents/tro_ly_kho/tools/read_page.ts"),
	nop_tra_loi: await congCu("agent/subagents/tro_ly_kho/tools/nop_tra_loi.ts"),
};

type Luot1 = {
	cau: Cau;
	nhan: "dung-trang" | "tu-choi-dung" | "sai";
	trangThai: string;
	chiTiet: string;
};
type Luot2 = { cau: Cau; nhan: "chuyen" | "khong-chuyen" };

async function hoiTroLy(
	c: Cau,
	nguoi: { id: string },
): Promise<{ hoiId: string; loi: string | null }> {
	const { hoiId, ctx } = await moHoiCrm(nguoi, c.cau);
	const tools = Object.fromEntries(
		Object.entries(congCuKho).map(([ten, t]) => [
			ten,
			ai.tool({
				description: t.description,
				inputSchema: khuonJson(t.inputSchema),
				execute: async (vao: VaoCongCu) => {
					try {
						return await t.execute(vao, ctx);
					} catch (e) {
						return { loi: e instanceof Error ? e.message : String(e) };
					}
				},
			}),
		]),
	);
	const conDangHoi = async () =>
		(
			await db.taiLieuHoi.findUniqueOrThrow({
				where: { id: hoiId },
				select: { trangThai: true },
			})
		).trangThai === "DANG_HOI";
	const dongChuaNop = async (loi: string) => {
		if (await conDangHoi())
			await ghiKetQuaHoi(
				db,
				hoiId,
				{ trangThai: "LOI", lyDo: "loi-model" },
				new Date(),
			);
		return { hoiId, loi };
	};
	try {
		await ai.generateText({
			model: modelTaiLieu("hoi").model,
			system: `${LOI_DAN}\n\nQuestion id: ${hoiId}`,
			prompt: c.cau,
			tools,
			stopWhen: [
				ai.stepCountIs(SO_BUOC_TOI_DA),
				async () => !(await conDangHoi()),
			],
		});
		return (await conDangHoi())
			? dongChuaNop(LOI_CHUA_NOP)
			: { hoiId, loi: null };
	} catch (e) {
		return dongChuaNop(e instanceof Error ? e.message : String(e));
	}
}

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

async function luotMot(
	c: Cau,
	nguoi: { id: string },
	slugCua: Map<string, string>,
): Promise<Luot1 & { khongQuaKiem: boolean; traLoi: string }> {
	const { hoiId, loi } = await hoiTroLy(c, nguoi);
	const hang = await db.taiLieuHoi.findUniqueOrThrow({
		where: { id: hoiId },
		select: { trangThai: true, lyDo: true, traLoi: true, soLanBac: true },
	});
	if (hang.trangThai === "TRA_LOI") {
		const traLoi = parseTraLoi(hang.traLoi);
		const daTrich = trichCua(traLoi);
		const du = (c.mong ?? []).every((nhom) =>
			nhom.some((k) => daTrich.has(slugCua.get(k) ?? `?${k}`)),
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
		chiTiet: `${loi ? `loi: ${loi.slice(0, 160)}; ` : ""}bac ${hang.soLanBac}`,
		khongQuaKiem: false,
		traLoi: "",
	};
}

async function congCuGoc() {
	const tools = new Map<string, ReturnType<typeof ai.tool>>();
	for (const ten of ZALO.hoi.congCu.doc) {
		const t = await congCu(`agent/tools/${ten}.ts`);
		const moTa = z.string().safeParse(t.description);
		if (!moTa.success) continue;
		tools.set(
			ten,
			ai.tool({
				description: moTa.data,
				inputSchema: khuonJson(t.inputSchema),
			}),
		);
	}
	const vaoTuChoi = ai.jsonSchema({
		type: "object",
		additionalProperties: true,
	});
	for (const ten of [...ZALO.hoi.congCu.ghi, ...ZALO.hoi.congCu.coSanChan])
		tools.set(
			ten,
			ai.tool({
				description: ZALO.hoi.tuChoiGhi,
				inputSchema: vaoTuChoi,
			}),
		);
	const vaoCon = ai.jsonSchema({
		type: "object",
		properties: { message: { type: "string" } },
		required: ["message"],
		additionalProperties: false,
	});
	const thuMucCon = join(AGENT, "agent", "subagents");
	for (const ten of readdirSync(thuMucCon)) {
		const nguon = readFileSync(join(thuMucCon, ten, "agent.ts"), "utf8");
		const moTa = nguon.match(/description:\s*"((?:[^"\\]|\\.)*)"/)?.[1];
		if (!moTa) khongDo(`khong doc duoc description cua subagent ${ten}`);
		tools.set(ten, ai.tool({ description: moTa, inputSchema: vaoCon }));
	}
	return Object.fromEntries(tools);
}

type NguCanhGocZalo = {
	session: {
		id: string;
		auth: {
			current: { attributes: Record<string, string> };
			initiator: { attributes: Record<string, string> };
		};
	};
};
type BatDauPhien = (
	e: { type: "session.started" },
	c: NguCanhGocZalo | ReturnType<typeof ctxConCua>,
) => Promise<{ markdown?: string } | null>;

const chiDanTinh = readFileSync(join(AGENT, "agent/instructions.md"), "utf8");
const chiDanDong = (
	(await import(join(AGENT, "agent/instructions/task.ts"))).default as {
		events: { "session.started": BatDauPhien };
	}
).events["session.started"];
const moTroLy = (
	(await import(join(AGENT, "agent/subagents/tro_ly_kho/instructions.ts")))
		.default as { events: { "session.started": BatDauPhien } }
).events["session.started"];

async function luotHai(
	c: Cau,
	model: ReturnType<ReturnType<typeof createGateway>>,
	tools: Record<string, ReturnType<typeof ai.tool>>,
	nguoi: { id: string },
): Promise<Luot2> {
	const goc = ma("ses-zalo");
	const hoi = await db.zaloHoi.create({
		data: {
			messageId: ma("msg"),
			crmUserId: nguoi.id,
			zaloChatId: ma("chat"),
			sessionId: goc,
			ketQua: "dang-hoi",
		},
	});
	const thuocTinh = {
		purpose: ZALO.hoi.purpose,
		hoiId: hoi.id,
		zaloChatId: hoi.zaloChatId,
		userId: nguoi.id,
	};
	const ctxGoc: NguCanhGocZalo = {
		session: {
			id: goc,
			auth: {
				current: { attributes: thuocTinh },
				initiator: { attributes: thuocTinh },
			},
		},
	};
	const dong = await chiDanDong({ type: "session.started" }, ctxGoc);
	const conTroLy = ai.tool({
		description: tools.tro_ly_kho?.description ?? "",
		inputSchema: ai.jsonSchema({
			type: "object",
			properties: { message: { type: "string" } },
			required: ["message"],
			additionalProperties: false,
		}),
		execute: async () => {
			await moTroLy({ type: "session.started" }, ctxConCua(goc));
			return { daNhan: true };
		},
	});
	await ai.generateText({
		model,
		system: `${chiDanTinh}\n\n${dong?.markdown ?? ""}`,
		prompt: c.cau,
		tools: { ...tools, tro_ly_kho: conTroLy },
		stopWhen: ai.stepCountIs(1),
	});
	const coHang =
		(await db.taiLieuHoi.count({ where: { zaloHoiId: hoi.id } })) > 0;
	return { cau: c, nhan: coHang ? "chuyen" : "khong-chuyen" };
}

const tiLe = (tu: number, mau: number) => (mau === 0 ? 0 : tu / mau);
const phanTram = (x: number) => `${(x * 100).toFixed(1)}%`;

try {
	const quanTri = await gieoNguoi("owner");
	const nguoi = await gieoNguoi("member");
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
	console.log(
		`-- bo ${relative(GOC, tepBo)} (${bo.nhan}): ${bo.cau.length} cau; gieo ${slugCua.size} trang`,
	);

	const tu = new Date();
	const mot: Awaited<ReturnType<typeof luotMot>>[] = [];
	for (const c of bo.cau.filter((x) => x.nhom !== "khong-phai-quy-dinh")) {
		const r = await luotMot(c, nguoi, slugCua);
		mot.push(r);
		console.log(`${c.id} ${r.nhan}`);
	}
	const den = new Date();

	const modelGoc =
		(await modelTheoVai("tro-ly"))?.model ?? DEFAULT_AGENT_MODEL.id;
	const gw = createGateway({
		apiKey: process.env.AI_GATEWAY_API_KEY?.trim() || undefined,
	});
	const tools = await congCuGoc();
	const hai: Luot2[] = [];
	for (const c of bo.cau) {
		const r = await luotHai(c, gw(modelGoc), tools, nguoi);
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
	];
	for (const d of tong) console.log(d);

	const banHoi = [
		`# Chấm bộ câu đo — ${new Date().toISOString()}`,
		"",
		`Bộ: \`${isAbsolute(tepBo) ? relative(GOC, tepBo) : tepBo}\` (nhãn \`${bo.nhan}\`). ${bo.nguon}`,
		"",
		`Lượt một: model \`${modelTaiLieu("hoi").model.modelId}\`, khoá ${nhanKhoaTaiLieu("hoi")}. Lượt hai: model agent gốc \`${modelGoc}\`, chỉ dẫn \`instructions.md\` + \`instructions/task.ts\` (purpose zalo); «chuyển» = có hàng TaiLieuHoi kênh ZALO do \`session.started\` thật của tro_ly_kho tạo.`,
		"",
		"## Tổng",
		"",
		...tong.map((d) => `- ${d}`),
		"",
		"## Lượt một — hỏi qua tro_ly_kho",
		"",
		"| id | nhóm | câu | nhãn | trạng thái | chi tiết | câu trả lời |",
		"| --- | --- | --- | --- | --- | --- | --- |",
		...mot.map(
			(r) =>
				`| ${r.cau.id} | ${r.cau.nhom}${r.cau.kho ? ` (${r.cau.kho})` : ""} | ${r.cau.cau} | ${r.nhan} | ${r.trangThai} | ${r.chiTiet.replaceAll("|", "/")} | ${r.traLoi.replaceAll("|", "/")} |`,
		),
		"",
		"## Lượt hai — hỏi qua agent gốc purpose zalo",
		"",
		"| id | nhóm | câu | nhãn |",
		"| --- | --- | --- | --- |",
		...hai.map(
			(r) => `| ${r.cau.id} | ${r.cau.nhom} | ${r.cau.cau} | ${r.nhan} |`,
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
	await db.$disconnect();
	process.exit(Object.values(dat).every(Boolean) ? 0 : 1);
} catch (e) {
	await db.$disconnect().catch(() => null);
	khongDo(
		String(e instanceof Error ? (e.stack ?? e.message) : e).slice(0, 800),
	);
}
