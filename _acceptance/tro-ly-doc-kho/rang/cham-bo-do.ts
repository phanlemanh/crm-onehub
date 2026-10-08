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
import {
	bamDauVao,
	CHAM_BO_DO,
	type ChiSo,
	cauHoiLai,
	cauLuotMot,
	chamTungCau,
	type Dem,
	docBanGhi,
	docBanGhiHead,
	doModel,
	dongKetLuot,
	donLuotCu,
	type DongTungCau,
	docTungCau,
	dongTungCau,
	ghiBanGhi,
	gop,
	type KetCucHai,
	type KetCucMot,
	keHoachHoiLai,
	ketCucHai,
	khuonBo,
	type Cau,
	type ModelIds,
	moThuMucLuot,
	nhanHaiCau,
	nhanMotCau,
	quyetDungLai,
	tepBam,
} from "./quyet-do";

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
const CHAY_GOC = join(GOC, ".acceptance-runs", "tro-ly-doc-kho", "cham-bo-do");
const TEP_TUNG_CAU = "cham-tung-cau.jsonl";
const BIEN_QUYET = "E15_QUYET";
const EVE = join(AGENT, "node_modules", ".bin", "eve");
const BAI_EVAL = "tro-ly-kho/cham-bo-do";
const TRAN_EVE_MS = 100 * 60_000;
const TEN_ZALO = "Người đo";
const SONG_SONG = "2";

const doiSo = process.argv.slice(2);
const coCo = (ten: string) => doiSo.includes(ten);
const giaTri = (ten: string) => {
	const i = doiSo.indexOf(ten);
	const v = i >= 0 ? doiSo[i + 1] : undefined;
	return v ? resolve(process.cwd(), v) : null;
};
const tepBo = giaTri("--bo") ?? BO_MAC_DINH;

function khongDo(cau: string): never {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

if (coCo("--ghi-ban-ghi")) {
	const tep = giaTri("--ghi-ban-ghi");
	if (!tep || !existsSync(tep))
		khongDo("--ghi-ban-ghi can tep bang chung cua luot");
	const md = readFileSync(tep, "utf8");
	const banGhi = docBanGhi(md);
	if (!banGhi?.dat) khongDo(`${tep} khong co ban ghi dat`);
	const dich = join(GOC, CHAM_BO_DO.banGhi);
	mkdirSync(dirname(dich), { recursive: true });
	writeFileSync(dich, md);
	console.log(
		`da ghi ban ghi ${banGhi.bam} vao ${CHAM_BO_DO.banGhi}; commit de luot sau dung lai`,
	);
	process.exit(0);
}

if (coCo("--cham-lai")) {
	const thuMuc = giaTri("--cham-lai");
	const tep = thuMuc ? join(thuMuc, TEP_TUNG_CAU) : "";
	if (!existsSync(tep)) khongDo(`khong co ${TEP_TUNG_CAU} trong ${thuMuc}`);
	const { mot, hai, kl } = chamTungCau(
		docTungCau(readFileSync(tep, "utf8")),
		NGUONG,
	);
	for (const d of kl.dong) console.log(d);
	const hoiLai = keHoachHoiLai(kl, mot, hai);
	for (const h of hoiLai)
		console.log(`CAN HOI LAI: ${h.chiSo} (${h.ids.length} cau)`);
	if (hoiLai.length > 0) {
		const chon = cauHoiLai(hoiLai, mot, hai);
		console.log(
			`HOI LAI: luot kho ${chon.mot.length} cau, luot zalo ${chon.hai.length} cau`,
		);
	}
	process.exit(kl.ma);
}

if (
	!process.env.KHO_TAI_LIEU_AI_GATEWAY_API_KEY?.trim() &&
	!process.env.AI_GATEWAY_API_KEY?.trim()
)
	khongDo(
		"thieu khoa AI Gateway (KHO_TAI_LIEU_AI_GATEWAY_API_KEY hoac AI_GATEWAY_API_KEY)",
	);
if (!existsSync(tepBo)) khongDo(`khong co bo cau ${tepBo}`);

type Quyet = { bam: string; modelIds: ModelIds; dong: string };

async function quyetTruoc(): Promise<Quyet> {
	const yeuCauAi = createRequire(join(AGENT, "package.json"));
	const { generateText } = yeuCauAi("ai") as typeof import("ai");
	const { createGateway } = yeuCauAi(
		"@ai-sdk/gateway",
	) as typeof import("@ai-sdk/gateway");
	const { modelTaiLieu } = await import(
		join(AGENT, "agent/lib/tai-lieu-model.ts")
	);
	const { DEFAULT_AGENT_MODEL } = await import(
		join(GOC, "packages/db/src/settings.ts")
	);
	const doRa = await doModel(async (vai) => {
		const model =
			vai === "kho"
				? modelTaiLieu("hoi").model
				: createGateway()(DEFAULT_AGENT_MODEL.id);
		const kq = await generateText({ model, prompt: "ok", maxOutputTokens: 1 });
		return { modelId: kq.response.modelId };
	});
	if (doRa.ma === 2) khongDo(doRa.dong.replace(/^KHONG DO DUOC: /, ""));
	const bam = bamDauVao(tepBam(GOC, relative(GOC, tepBo)), doRa.ids);
	const nguonThu = giaTri("--nguon-thu");
	const md = nguonThu
		? readFileSync(nguonThu, "utf8")
		: docBanGhiHead(GOC, CHAM_BO_DO.banGhi);
	const q = quyetDungLai(md ? docBanGhi(md) : null, bam, new Date(), {
		doLai: coCo("--do-lai"),
	});
	console.log(`bam dau vao ${bam}; model ${doRa.ids.kho} · ${doRa.ids.goc}`);
	if (nguonThu) console.log(`nguon thu: ${nguonThu}`);
	console.log(q.dong);
	if (coCo("--chi-quyet")) process.exit(0);
	if (q.dungLai && md) {
		const bangChung = join(THU_MUC_BANG_CHUNG, "cham-bo-do.md");
		mkdirSync(THU_MUC_BANG_CHUNG, { recursive: true });
		writeFileSync(
			bangChung,
			`${q.dong}${nguonThu ? ` (nguon thu: ${nguonThu})` : ""}\n\n${md}`,
		);
		console.log("SO LOI GOI MODEL: 2");
		console.log(`ghi ${relative(GOC, bangChung)}`);
		process.exit(0);
	}
	return { bam, modelIds: doRa.ids, dong: q.dong };
}

if (!process.env[BIEN_QUYET]) {
	const q = await quyetTruoc();
	if (!process.env.PHIEN_DO) {
		const lenh = `bun ${relative(GOC, TEP_NAY)}${giaTri("--bo") ? ` --bo ${JSON.stringify(tepBo)}` : ""}`;
		const ra = spawnSync(
			"bash",
			[join(GOC, "_acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh"), lenh],
			{
				cwd: GOC,
				stdio: "inherit",
				env: { ...process.env, [BIEN_QUYET]: JSON.stringify(q) },
			},
		);
		process.exit(ra.status ?? 2);
	}
	process.env[BIEN_QUYET] = JSON.stringify(q);
}
const quyet = JSON.parse(process.env[BIEN_QUYET] ?? "{}") as Quyet;

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
const { nhanKhoaTaiLieu } = await import(
	join(AGENT, "agent/lib/tai-lieu-model.ts")
);

type KetQua = Awaited<ReturnType<typeof docKetQua>>[number];
type KetMot = Extract<KetQua, { luot: 1 }>;
type KetHai = Extract<KetQua, { luot: 2 }>;
type Luot1 = {
	cau: Cau;
	ketCuc: KetCucMot;
	nhan: string;
	trangThai: string;
	chiTiet: string;
};
type Luot2 = {
	cau: Cau;
	ketCuc: KetCucHai;
	nhan: string;
	conGoi: string;
	ketQua: string;
	traLoi: string;
	zalo?: { ketQua: string | null; loi: string | null; coHang: boolean };
};

function dongCua(
	r: { cau: Cau; ketCuc: KetCucMot | KetCucHai },
	luot: 1 | 2,
	khongQuaKiem = false,
	zalo?: Luot2["zalo"],
): DongTungCau {
	return dongTungCau(
		{ id: r.cau.id, nhom: r.cau.nhom, ketCuc: r.ketCuc },
		luot,
		khongQuaKiem,
		zalo,
	);
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

async function nhanMot(
	c: Cau,
	k: KetMot | undefined,
	slugCua: Map<string, string>,
): Promise<Luot1 & { khongQuaKiem: boolean; traLoi: string; conGoi: string }> {
	if (!k)
		return {
			cau: c,
			ketCuc: "khong-co-ket-qua",
			nhan: nhanMotCau(c.nhom, "khong-co-ket-qua"),
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
		const ketCuc: KetCucMot = du ? "TRA_LOI-du" : "TRA_LOI-sai";
		return {
			cau: c,
			ketCuc,
			nhan: nhanMotCau(c.nhom, ketCuc),
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
	const ketCuc: KetCucMot = hang.trangThai === "TU_CHOI" ? "TU_CHOI" : "LOI";
	return {
		cau: c,
		ketCuc,
		nhan: nhanMotCau(c.nhom, ketCuc),
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
	if (!k || k.loi) {
		return {
			cau: c,
			ketCuc: "loi",
			nhan: nhanHaiCau("loi"),
			conGoi: "—",
			ketQua: k?.loi ?? "khong co ket qua eval",
			traLoi: "",
		};
	}
	const coHang = k.zaloHoiId
		? (await db.taiLieuHoi.count({
				where: { zaloHoiId: k.zaloHoiId, kenh: "ZALO" },
			})) > 0
		: false;
	const ketCuc = ketCucHai(k, coHang);
	return {
		cau: c,
		ketCuc,
		nhan: nhanHaiCau(ketCuc),
		conGoi: k.conGoi.join(", ") || "—",
		ketQua: k.ketQua ?? "?",
		traLoi: traLoiCua(k.messageId),
		zalo: { ketQua: k.ketQua, loi: k.loi, coHang },
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
	const dongMot = (c: Cau) => ({ id: c.id, cau: c.cau, nguoiId: cuaCau(c).id });
	const dongHai = (c: Cau) => {
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
	};
	const cauMot = cauLuotMot(bo.cau);
	console.log(
		`-- bo ${relative(GOC, tepBo)} (${bo.nhan}): ${bo.cau.length} cau; gieo ${slugCua.size} trang`,
	);

	mkdirSync(CHAY_GOC, { recursive: true });
	donLuotCu(CHAY_GOC, CHAM_BO_DO.giuLuot - 1);
	const thuMucLuot = moThuMucLuot(CHAY_GOC, new Date(), process.pid);
	console.log(`thu muc luot: ${relative(GOC, thuMucLuot)}`);
	let soLoiGoi = 2;

	async function chayLuot(
		ten: string,
		chonMot: readonly Cau[],
		chonHai: readonly Cau[],
	) {
		const thuMuc = join(thuMucLuot, ten);
		mkdirSync(thuMuc, { recursive: true });
		const keHoach = {
			lo: TAI_LIEU_AGENT.hoi.loGui,
			mot: chonMot.map(dongMot),
			hai: chonHai.map(dongHai),
		};
		const tepKetQua = join(thuMuc, "ket-qua.jsonl");
		const nhatKy = join(thuMuc, "eve.log");
		writeFileSync(join(thuMuc, "ke-hoach.json"), JSON.stringify(keHoach));
		writeFileSync(tepKetQua, "");
		soLoiGoi += keHoach.mot.length + keHoach.hai.length;
		mayChu.goi.length = 0;
		const eve = await chayEve(
			{
				AGENT_BRIDGE_SECRET: randomBytes(24).toString("hex"),
				ZALO_BOT_TOKEN: randomBytes(16).toString("hex"),
				ZALO_WEBHOOK_SECRET: randomBytes(24).toString("hex"),
				ZALO_API_URL: mayChu.url,
				CRM_TELEMETRY_DISABLED: "1",
				[CHAM_BO_DO_ENV.keHoach]: join(thuMuc, "ke-hoach.json"),
				[CHAM_BO_DO_ENV.ketQua]: tepKetQua,
			},
			nhatKy,
		);
		const ket = docKetQua(readFileSync(tepKetQua, "utf8"));
		const ketMot = new Map(
			ket.flatMap((k) => (k.luot === 1 ? [[k.id, k] as const] : [])),
		);
		const ketHai = new Map(
			ket.flatMap((k) => (k.luot === 2 ? [[k.id, k] as const] : [])),
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
		for (const c of chonMot) {
			const r = await nhanMot(c, ketMot.get(c.id), slugCua);
			mot.push(r);
			console.log(`${ten} ${c.id} ${r.nhan}`);
		}
		const hai: Luot2[] = [];
		for (const c of chonHai) {
			const r = await nhanHai(c, ketHai.get(c.id), traLoiCua);
			hai.push(r);
			console.log(`${ten} ${c.id} ${r.nhan}`);
		}
		const tungCau = [
			...mot.map((r) => dongCua(r, 1, r.khongQuaKiem)),
			...hai.map((r) => dongCua(r, 2, false, r.zalo)),
		];
		writeFileSync(
			join(thuMuc, TEP_TUNG_CAU),
			`${tungCau.map((d) => JSON.stringify(d)).join("\n")}\n`,
		);
		console.log(`eve eval ${BAI_EVAL}: ma thoat ${eve.ma} (${ten})`);
		return { mot, hai, tungCau, eve };
	}

	const tu = new Date();
	const l1 = await chayLuot("luot-1", cauMot, bo.cau);
	const c1 = chamTungCau(l1.tungCau, NGUONG);
	const tong = [...c1.kl.dong];
	let maThoat = c1.kl.ma;
	const hoiLai = keHoachHoiLai(c1.kl, c1.mot, c1.hai);
	const gopCua = new Map<ChiSo, ReturnType<typeof gop>>();
	if (hoiLai.length > 0) {
		const chon = cauHoiLai(hoiLai, cauMot, bo.cau);
		const l2 = await chayLuot("hoi-lai", chon.mot, chon.hai);
		const c2 = chamTungCau(l2.tungCau, NGUONG);
		if (c2.kl.ma === 2) {
			maThoat = 2;
			tong.push(`hoi lai: ${c2.kl.dong[0]}`);
		} else {
			const nguongCua = (c: ChiSo) =>
				c === "chuyenNham" ? NGUONG.chuyenNhamToiDa : NGUONG[c];
			for (const h of hoiLai) {
				const g = gop(
					c1.kl.so[h.chiSo],
					c2.kl.so[h.chiSo] satisfies Dem,
					nguongCua(h.chiSo),
					h.chiSo === "chuyenNham" ? "<=" : ">=",
				);
				gopCua.set(h.chiSo, g);
				tong.push(`hoi lai ${h.chiSo}: ${g.dong}`);
			}
			const conKhongDat = c1.kl.dong.some((d) => d.endsWith(" khong-dat"));
			maThoat =
				!conKhongDat && [...gopCua.values()].every((g) => g.dat) ? 0 : 1;
		}
	}
	const den = new Date();
	const dem = await demHoiKho(db, tu, den);
	tong.push(
		`demHoiKho cua cua so chay: traLoi ${dem.traLoi}, tuChoi ${dem.tuChoi}, loi ${dem.loi}, tiLe ${dem.tiLe === null ? "—" : `${(dem.tiLe * 100).toFixed(1)}%`}`,
	);
	for (const d of tong) console.log(d);
	console.log(`SO LOI GOI MODEL: ${soLoiGoi}`);

	const mot = l1.mot;
	const hai = l1.hai;
	const banHoi = [
		`# Chấm bộ câu đo — ${new Date().toISOString()}`,
		"",
		quyet.dong,
		"",
		`Bộ: \`${isAbsolute(tepBo) ? relative(GOC, tepBo) : tepBo}\` (nhãn \`${bo.nhan}\`). ${bo.nguon}`,
		"",
		`Cả hai lượt chạy bằng \`eve eval ${BAI_EVAL}\`: máy chủ eve thật của \`apps/agent\`, chỉ dẫn và tool đúng như eve gửi, phiên con thật. Lượt một: mỗi câu là một hàng TaiLieuHoi kênh CRM, \`/internal/crm/dispatch\` mở phiên purpose kho; model \`${quyet.modelIds.kho}\` (Gateway trả), khoá ${nhanKhoaTaiLieu("hoi")}. Lượt hai: mỗi câu là một tin Zalo qua \`/zalo/webhook\` (Zalo giả nhận câu trả lời) của một người đã nối Zalo; model agent gốc \`${quyet.modelIds.goc}\` (Gateway trả); «chuyển» = có hàng TaiLieuHoi kênh ZALO gắn với hàng ZaloHoi của tin đó. Câu không có kết quả, hàng không kết thúc ở TRA_LOI/TU_CHOI, hay câu Zalo có lỗi eval mang nhãn \`loi\` và không vào tử số hay mẫu số. Thư mục lượt: \`${relative(GOC, thuMucLuot)}\`.`,
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
	const banGhi =
		bo.nhan === NHAN_BO_TAM && maThoat !== 2
			? ghiBanGhi({
					bam: quyet.bam,
					doLuc: den,
					dat: maThoat === 0,
					modelIds: quyet.modelIds,
					than: banHoi,
				})
			: banHoi;
	const bangChung = join(
		THU_MUC_BANG_CHUNG,
		bo.nhan === NHAN_BO_TAM ? "cham-bo-do.md" : `cham-bo-do-${bo.nhan}.md`,
	);
	mkdirSync(THU_MUC_BANG_CHUNG, { recursive: true });
	writeFileSync(bangChung, banGhi);
	writeFileSync(join(thuMucLuot, "cham-bo-do.md"), banGhi);
	console.log(`ghi ${relative(GOC, bangChung)}`);
	if (bo.nhan === NHAN_BO_TAM)
		for (const d of dongKetLuot(maThoat, join(thuMucLuot, "cham-bo-do.md")))
			console.log(d);
	mayChu.dung();
	await db.$disconnect();
	process.exit(maThoat);
} catch (e) {
	mayChu.dung();
	await db.$disconnect().catch(() => null);
	khongDo(
		String(e instanceof Error ? (e.stack ?? e.message) : e).slice(0, 800),
	);
}
