import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { ghiBangChung } from "./bang-chung";
import { type DongKetQua, docChuoi, docNguong, sha, ZCH } from "./khuon";

const TEP_NAY = fileURLToPath(import.meta.url);
const AGENT = join(ZCH.goc, "apps", "agent");

const DO = {
	khoDo: /\/crm_[a-z0-9_]+_do(\?|$)/,
	trangMau: join(
		ZCH.goc,
		"_acceptance",
		"tro-ly-doc-kho",
		"bo-do",
		"trang-mau",
	),
	eve: join(AGENT, "node_modules", ".bin", "eve"),
	baiEval: "tro-ly-kho/cau-thu-hai",
	tranEveMs: 45 * 60_000,
	chayGoc: join(ZCH.goc, ".acceptance-runs", "zalo-cau-thu-hai-lien-ket"),
	moLuot: join(
		ZCH.goc,
		"_acceptance",
		"tieu-de-cot-doc-tron",
		"rang",
		"mot-luot.sh",
	),
	chiPhi: join(ZCH.goc, "scripts", "lan-do", "chi-phi-gateway.mjs"),
	tenZalo: "Người đo câu hai",
	bienKhoa: ["AI_GATEWAY_API_KEY", "KHO_TAI_LIEU_AI_GATEWAY_API_KEY"],
} as const;

const coCo = (ten: string) => process.argv.slice(2).includes(ten);

function khongDo(cau: string): never {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

const chuoi = docChuoi();
const nguong = docNguong();
const boMauTho = readFileSync(ZCH.boMau);
if (sha(boMauTho) !== chuoi.bamBoMau)
	khongDo("bo-mau.json da doi so voi rang/chuoi.json");
const boMau = JSON.parse(boMauTho.toString("utf8")) as {
	cau: { id: string; cau: string; mong?: string[][] }[];
};
const cauCua = new Map(boMau.cau.map((c) => [c.id, c]));

if (coCo("--kho")) {
	for (const ch of chuoi.chuoi)
		console.log(
			`${ch.nguoi}: ${ch.cau.map((m) => `${m} «${cauCua.get(m)?.cau ?? "?"}»`).join(" → ")}`,
		);
	if (!DO.khoDo.test(process.env.DATABASE_URL ?? ""))
		khongDo("DATABASE_URL khong phai kho do dung-mot-lan crm_<cay>_do");
	process.exit(0);
}

if (!process.env.PHIEN_DO) {
	const ra = spawnSync(
		"bash",
		[DO.moLuot, `bun ${relative(ZCH.goc, TEP_NAY)}`],
		{ cwd: ZCH.goc, stdio: "inherit" },
	);
	process.exit(ra.status ?? 2);
}

if (!DO.khoDo.test(process.env.DATABASE_URL ?? ""))
	khongDo("DATABASE_URL khong phai kho do dung-mot-lan crm_<cay>_do");

function chiPhiHienTai(): number {
	const khoa = [
		...new Set(
			DO.bienKhoa
				.map((b) => process.env[b]?.trim())
				.filter((k): k is string => !!k),
		),
	];
	const goi = (env: Record<string, string>) => {
		const ra = spawnSync("node", [DO.chiPhi], {
			cwd: ZCH.goc,
			env: { ...process.env, ...env },
			encoding: "utf8",
		});
		const so = Number(ra.stdout.trim());
		if (ra.status !== 0 || !Number.isFinite(so))
			khongDo(`khong doc duoc chi phi Gateway: ${ra.stderr.trim()}`);
		return so;
	};
	if (khoa.length === 0) return goi({});
	return khoa.reduce((t, k) => t + goi({ AI_GATEWAY_API_KEY: k }), 0);
}

const { db } = await import(join(ZCH.goc, "packages/db/src/index.ts"));
const { gieoNguoi, ma, trangDaDuyet } = await import(
	join(AGENT, "test/support/tro-ly-kho-gia.ts")
);
const { thanWebhook } = await import(join(AGENT, "test/support/zalo-tin.ts"));
const { zaloGia } = await import(join(AGENT, "test/support/zalo-gia.ts"));
const { cauKhoChoZalo } = await import(
	join(AGENT, "agent/lib/tai-lieu-hoi-zalo.ts")
);
const { locTraLoi } = await import(join(AGENT, "agent/lib/zalo-loc.ts"));
const { CAU_THU_HAI_ENV, docKetQuaCauThuHai } = await import(
	join(AGENT, "evals/tro-ly-kho/cau-thu-hai-ke-hoach.ts")
);

type GoiGia = { method: string; body: { chat_id?: string; text?: string } };
const gia = zaloGia() as {
	goi: GoiGia[];
	fetcher: (
		url: string,
		init: { method: string; body: string },
	) => Promise<Response>;
};
const lucGoi: number[] = [];
const mayChu = Bun.serve({
	port: 0,
	fetch: async (req) => {
		const r = await gia.fetcher(req.url, {
			method: "POST",
			body: await req.text(),
		});
		while (lucGoi.length < gia.goi.length) lucGoi.push(Date.now());
		return r;
	},
});
try {
	const quanTri = await gieoNguoi("owner");
	const slugCo = new Set<string>();
	for (const f of readdirSync(DO.trangMau)
		.filter((x) => x.endsWith(".md"))
		.sort()) {
		const [dau, ...than] = readFileSync(join(DO.trangMau, f), "utf8").split(
			"\n",
		);
		const ten = (dau ?? "").replace(/^#\s*/, "").trim();
		await trangDaDuyet(quanTri, ten, than.join("\n").trim());
		slugCo.add(f.replace(/\.md$/, ""));
	}
	for (const ch of chuoi.chuoi)
		for (const m of ch.cau) {
			const c = cauCua.get(m);
			if (!c) khongDo(`cau ${m} khong co trong bo-mau.json`);
			for (const nhom of c.mong ?? [])
				for (const k of nhom)
					if (!slugCo.has(k))
						khongDo(`cau ${m} mong trang ${k} khong co trong trang mau`);
		}
	await db.appSetting.updateMany({
		data: { zaloBotToken: null, zaloWebhookSecret: null },
	});
	const zaloCua = new Map<string, string>();
	const keHoach = {
		chuoi: await Promise.all(
			chuoi.chuoi.map(async (ch) => {
				const nguoi = await gieoNguoi("member");
				const zaloUserId = ma("zalo");
				await db.zaloLink.create({
					data: {
						crmUserId: nguoi.id,
						zaloUserId,
						zaloDisplayName: DO.tenZalo,
					},
				});
				zaloCua.set(ch.nguoi, zaloUserId);
				return {
					nguoi: ch.nguoi,
					cau: ch.cau.map((maCau) => {
						const messageId = ma("msg");
						return {
							maCau,
							messageId,
							than: JSON.stringify(
								thanWebhook({
									messageId,
									fromId: zaloUserId,
									ten: DO.tenZalo,
									text: cauCua.get(maCau)?.cau ?? "",
								}),
							),
						};
					}),
				};
			}),
		),
	};
	const thuMuc = join(
		DO.chayGoc,
		new Date().toISOString().replace(/[:.]/g, "-"),
	);
	mkdirSync(thuMuc, { recursive: true });
	const tepKeHoach = join(thuMuc, "ke-hoach.json");
	const tepKetQua = join(thuMuc, "ket-qua-eval.jsonl");
	writeFileSync(tepKeHoach, JSON.stringify(keHoach));
	writeFileSync(tepKetQua, "");
	console.log(`thu muc luot: ${relative(ZCH.goc, thuMuc)}`);

	const truoc = chiPhiHienTai();
	const tienTrinh = Bun.spawn([DO.eve, "eval", DO.baiEval, "--verbose"], {
		cwd: AGENT,
		env: {
			...process.env,
			AGENT_BRIDGE_SECRET: randomBytes(24).toString("hex"),
			ZALO_BOT_TOKEN: randomBytes(16).toString("hex"),
			ZALO_WEBHOOK_SECRET: randomBytes(24).toString("hex"),
			ZALO_API_URL: `http://127.0.0.1:${mayChu.port}`,
			CRM_TELEMETRY_DISABLED: "1",
			[CAU_THU_HAI_ENV.keHoach]: tepKeHoach,
			[CAU_THU_HAI_ENV.ketQua]: tepKetQua,
		},
		stdout: "pipe",
		stderr: "pipe",
	});
	const hen = setTimeout(() => tienTrinh.kill(), DO.tranEveMs);
	const [ra, loi, maThoat] = await Promise.all([
		new Response(tienTrinh.stdout).text(),
		new Response(tienTrinh.stderr).text(),
		tienTrinh.exited,
	]);
	clearTimeout(hen);
	const eveLog = `${ra}\n${loi}`;
	writeFileSync(join(thuMuc, "eve.log"), eveLog);
	const chiPhiUsd = chiPhiHienTai() - truoc;
	console.log(
		`eve eval ${DO.baiEval}: ma thoat ${maThoat}; chi phi ${chiPhiUsd.toFixed(4)} USD`,
	);

	const ket = docKetQuaCauThuHai(readFileSync(tepKetQua, "utf8"));
	const tinCua = (k: (typeof ket)[number]): string[] => {
		const sau =
			ket.find((x) => x.nguoi === k.nguoi && x.thuTu === k.thuTu + 1)?.guiLuc ??
			Number.POSITIVE_INFINITY;
		const chat = zaloCua.get(k.nguoi);
		return gia.goi.flatMap((g, i) => {
			const luc = lucGoi[i] ?? 0;
			return g.method === "sendMessage" &&
				g.body.chat_id === chat &&
				luc >= k.guiLuc &&
				luc < sau
				? [g.body.text ?? ""]
				: [];
		});
	};
	const traLoiMongCua = async (k: (typeof ket)[number]): Promise<string[]> => {
		if (!k.zaloHoiId || !ZCH.xong.some((x) => x === k.tlhTrangThai)) return [];
		const cau: string | null = await cauKhoChoZalo(k.zaloHoiId);
		return cau ? locTraLoi(cau) : [];
	};
	const ketQua: DongKetQua[] = (
		await Promise.all(
			ket.map(async (k) => ({
				nguoi: k.nguoi,
				thuTu: k.thuTu as 1 | 2 | 3,
				maCau: k.maCau,
				zaloHoiId: k.zaloHoiId,
				sessionId: k.sessionId,
				ketQua: k.ketQua,
				tlhId: k.tlhId,
				tlhZaloHoiId: k.tlhZaloHoiId,
				tlhTrangThai: k.tlhTrangThai,
				tlhLyDo: k.tlhLyDo,
				tin: tinCua(k),
				traLoiMong: await traLoiMongCua(k),
				loi: k.loi,
			})),
		)
	).sort((a, b) => a.nguoi.localeCompare(b.nguoi) || a.thuTu - b.thuTu);
	ghiBangChung(ZCH.evidence, {
		ketQua,
		eveLog,
		chiPhiUsd,
		ghiChu: [
			`Lượt chạy bằng \`eve eval ${DO.baiEval}\` trên kho đo dùng-một-lần, model mặc định của nhánh.`,
			`Tám người đã nối Zalo, mỗi người ba câu kho liên tiếp qua \`/zalo/webhook\` (Zalo giả nhận trả lời); câu sau gửi khi câu trước ra khỏi \`dang-hoi\` và đã lắng.`,
			`Mỗi câu ghi các tin Zalo giả nhận trong khoảng từ lúc gửi câu đó tới lúc gửi câu kế, cạnh câu trả lời dựng từ hàng TaiLieuHoi của chính câu (\`cauKhoChoZalo\` → \`locTraLoi\`).`,
			`Thư mục lượt: \`${relative(ZCH.goc, thuMuc)}\`; mã thoát eve eval: ${maThoat}.`,
			`Ngưỡng: câu lỗi model tối đa ${nguong.loiModelToiDa}, trần ${nguong.tranUsd} USD.`,
		],
	});
	console.log(`ghi ${relative(ZCH.goc, ZCH.evidence)}`);
	if (chiPhiUsd > nguong.tranUsd)
		console.log(
			`QUA TRAN CHI: ${chiPhiUsd.toFixed(4)} > ${nguong.tranUsd} USD — khong chay lai`,
		);
} finally {
	mayChu.stop(true);
	await db.$disconnect();
}
