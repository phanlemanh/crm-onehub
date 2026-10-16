import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createWriteStream, mkdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { MODEL_DANH_MUC } from "../../../apps/agent/agent/lib/model-config.ts";
import { TRO_LY_OKR } from "../../../apps/agent/agent/lib/okr/config.ts";
import { measureDatabaseName } from "../../../packages/db/src/measure-database.ts";
import {
	cauThieuKhoa,
	chanSoDu,
	coKhoaMoHinh,
	GOC,
	PHIEN_TRO_LY,
	pg,
	taoKho,
	tenKhoTheoCay,
	xoaKho,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import {
	docE22,
	docE24,
	docKetQuaEval,
	ketLuan,
	SO_LUOT_BO_DUNG,
} from "./doc-so.mjs";

const SO_MO_HINH = {
	moHinh: TRO_LY_OKR.moHinhThu.danhSach,
	bien: TRO_LY_OKR.moHinhThu.bien,
	ten: {
		"google/gemini-3.8-flash": "gemini",
		"anthropic/claude-haiku-5.5": "haiku",
	},
	e24: {
		lenh: ["_acceptance/tro-ly-okr-de-xuat/rang/do-tre.mjs", "--lan", "20"],
	},
	e22: {
		lenh: ["_acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs"],
		kho: "tdx-e22",
	},
	tacNhan: { kho: "thk-tac-nhan", eval: "agent-builder" },
	suKien: MODEL_DANH_MUC.suKienChon,
	canhMs: 5_000,
	ra: join(GOC, ".acceptance-runs", "thu-haiku-tro-ly-okr", "so-mo-hinh"),
};

const lanChay = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15);
const RA = join(SO_MO_HINH.ra, lanChay);

function khongDo(lyDo) {
	console.log(`KHONG DO DUOC: ${lyDo}`);
	return 2;
}

function tenNhanh(muc, vai) {
	return `${vai}-${SO_MO_HINH.ten[muc.ma] ?? muc.ma}`;
}

function urlKho(tenCay) {
	const u = new URL(process.env.DATABASE_URL ?? "");
	u.pathname = `/${measureDatabaseName(tenCay)}`;
	u.search = "";
	return u.toString();
}

async function modelDaChay(url) {
	const khach = new pg.Client({ connectionString: url });
	await khach.connect();
	try {
		const { rows } = await khach.query(
			`SELECT DISTINCT data->>'modelId' AS ma FROM "agentEvent" WHERE type = $1`,
			[SO_MO_HINH.suKien],
		);
		return rows.map((r) => r.ma);
	} finally {
		await khach.end();
	}
}

function canhModel(url) {
	const thay = { ma: [], loi: null, soLan: 0 };
	let dung = false;
	const vong = (async () => {
		while (!dung) {
			try {
				const ma = await modelDaChay(url);
				thay.ma = [...new Set([...thay.ma, ...ma])];
				thay.soLan++;
			} catch (loi) {
				thay.loi = loi?.message ?? String(loi);
			}
			if (!dung)
				await new Promise((xong) => setTimeout(xong, SO_MO_HINH.canhMs));
		}
	})();
	return {
		thay,
		dung: async () => {
			dung = true;
			await vong;
		},
	};
}

function chay(lenh, { env, tep, cwd = GOC }) {
	const ghi = createWriteStream(tep);
	return new Promise((xong) => {
		const con = spawn(lenh[0], lenh.slice(1), { cwd, env });
		con.stdout.pipe(ghi, { end: false });
		con.stderr.pipe(ghi, { end: false });
		con.on("error", (loi) => {
			ghi.end(`\n${loi.message}\n`);
			xong(2);
		});
		con.on("close", (ma) => {
			ghi.end();
			ghi.on("finish", () => xong(ma ?? 2));
		});
	});
}

function kiemModel(nhanh, muc, thay, tep) {
	if (thay.ma.length === 0)
		return `nhanh ${nhanh} khong thay su kien ${SO_MO_HINH.suKien}${thay.loi ? ` (${thay.loi})` : ""} — ${tep}`;
	const khac = thay.ma.filter((m) => m !== muc.ma);
	if (khac.length > 0) return `nhanh ${nhanh} chay ${khac.join(", ")} — ${tep}`;
	return null;
}

async function nhanhTroLy(muc, vai, lenh, tenCay, doc) {
	const nhanh = tenNhanh(muc, vai);
	const tep = join(RA, `${nhanh}.log`);
	const canh = canhModel(urlKho(tenCay));
	const ma = await chay(["bun", ...lenh], {
		env: { ...process.env, [SO_MO_HINH.bien]: muc.ma },
		tep,
	});
	await canh.dung();
	const so = doc(readFileSync(tep, "utf8"));
	if ("khongDo" in so)
		return { nhanh, loi: `nhanh ${nhanh}: ${so.khongDo} — ${tep}` };
	const lech = kiemModel(nhanh, muc, canh.thay, tep);
	if (lech) return { nhanh, loi: lech };
	return { nhanh, ma, so };
}

function datModelKho(url, muc) {
	const r = spawnSync(
		"bun",
		[
			"-e",
			`import { db } from ${JSON.stringify(join(GOC, "packages/db/src/client.ts"))};
import { readAgentModel, writeAgentModel } from ${JSON.stringify(join(GOC, "packages/db/src/settings.ts"))};
try {
	await writeAgentModel(db, ${JSON.stringify({ id: muc.ma, contextWindowTokens: muc.cuaSoNguCanh })});
	console.log(JSON.stringify(await readAgentModel(db)));
} finally {
	await db.$disconnect();
}`,
		],
		{ cwd: GOC, encoding: "utf8", env: { ...process.env, DATABASE_URL: url } },
	);
	if (r.status !== 0)
		return { loi: (r.stderr || r.stdout).trim().split("\n").at(-1) };
	return { model: JSON.parse(r.stdout.trim().split("\n").at(-1)) };
}

async function nhanhTacNhan(muc, url) {
	const nhanh = tenNhanh(muc, "tac-nhan");
	const dat = datModelKho(url, muc);
	if (dat.loi)
		return {
			nhanh,
			loi: `nhanh ${nhanh}: khong ghi duoc o model (${dat.loi})`,
		};
	if (dat.model.id !== muc.ma || dat.model.isDefault)
		return { nhanh, loi: `nhanh ${nhanh} chay ${dat.model.id}` };
	let qua = 0;
	for (let i = 1; i <= SO_LUOT_BO_DUNG; i++) {
		const tep = join(RA, `${nhanh}-${i}.log`);
		await chay(
			[
				join(GOC, "apps/agent/node_modules/.bin/eve"),
				"eval",
				SO_MO_HINH.tacNhan.eval,
				"--verbose",
			],
			{
				cwd: join(GOC, "apps/agent"),
				env: {
					...process.env,
					DATABASE_URL: url,
					AGENT_BRIDGE_SECRET: randomBytes(24).toString("hex"),
					ZALO_BOT_TOKEN: "",
					CRM_TELEMETRY_DISABLED: "1",
				},
				tep,
			},
		);
		const kq = docKetQuaEval(
			readFileSync(tep, "utf8"),
			SO_MO_HINH.tacNhan.eval,
		);
		if ("khongDo" in kq)
			return { nhanh, loi: `nhanh ${nhanh} luot ${i}: ${kq.khongDo} — ${tep}` };
		if (kq.qua) qua++;
	}
	return { nhanh, qua };
}

function inBang(ket) {
	console.log("");
	console.log(
		"| model | E24 hong/20 | p50 ms | p90 ms | ket cuc E24 | E22 dung/30 | gop y thua | judge | USD E22 | bo dung qua/3 |",
	);
	console.log("|---|---|---|---|---|---|---|---|---|---|");
	for (const muc of SO_MO_HINH.moHinh) {
		const k = ket[muc.ma];
		const e24 = k.e24.so;
		const e22 = k.e22.so;
		const ketCuc = Object.entries(e24.theoKetCuc)
			.map(([ten, so]) => `${ten} ${so}`)
			.join(", ");
		console.log(
			`| ${muc.ma} | ${e24.soHong}/${e24.soLuot} | ${e24.p50} | ${e24.p90} | ${ketCuc} | ${e22.dung}/${e22.tong} | ${e22.gopYThua.length}${e22.gopYThua.length ? ` (${e22.gopYThua.join(", ")})` : ""} | ${e22.judge} | ${e22.chiUsd ?? "?"} | ${k.tacNhan.qua}/${SO_LUOT_BO_DUNG} |`,
		);
	}
	console.log("");
	for (const muc of SO_MO_HINH.moHinh) {
		const k = ket[muc.ma];
		const kl = ketLuan({
			e24Hong: k.e24.so.soHong,
			e22Dung: k.e22.so.dung,
			gopYThua: k.e22.so.gopYThua.length,
			judge: k.e22.so.judge,
			tacNhanQua: k.tacNhan.qua,
		});
		const truot = (v) =>
			v.truot.length ? ` (truot: ${v.truot.join(", ")})` : "";
		console.log(
			`${muc.ma}: tro ly OKR ${kl.troLyOkr.ket}${truot(kl.troLyOkr)} · tac nhan ${kl.tacNhan.ket}${truot(kl.tacNhan)}`,
		);
	}
}

async function main() {
	if (!coKhoaMoHinh()) return khongDo(cauThieuKhoa());
	if (!process.env.DATABASE_URL)
		return khongDo("thieu DATABASE_URL — chay tu goc kho co .env");
	const chan = await chanSoDu();
	if (chan) return khongDo(chan);
	mkdirSync(RA, { recursive: true });
	console.log(`so-mo-hinh: nhat ky ${RA}`);
	const cayTroLy = `${basename(GOC)}-${PHIEN_TRO_LY.hauToCay}`;
	const cayE22 = tenKhoTheoCay(SO_MO_HINH.e22.kho);
	const ket = {};
	const loi = [];
	for (const muc of SO_MO_HINH.moHinh) {
		const e24 = await nhanhTroLy(
			muc,
			"e24",
			SO_MO_HINH.e24.lenh,
			cayTroLy,
			docE24,
		);
		const e22 = await nhanhTroLy(
			muc,
			"e22",
			SO_MO_HINH.e22.lenh,
			cayE22,
			docE22,
		);
		for (const n of [e24, e22]) {
			console.log(
				`${n.nhanh}: ${n.loi ? `KHONG DO DUOC (${n.loi})` : `ma ${n.ma}`}`,
			);
			if (n.loi) loi.push(n.loi);
		}
		ket[muc.ma] = { e24, e22 };
	}
	let url;
	try {
		url = taoKho(SO_MO_HINH.tacNhan.kho);
	} catch (e) {
		loi.push(`nhanh tac-nhan: khong tao duoc kho (${e?.message ?? e})`);
	}
	if (url) {
		try {
			for (const muc of SO_MO_HINH.moHinh) {
				const tn = await nhanhTacNhan(muc, url);
				console.log(
					`${tn.nhanh}: ${tn.loi ? `KHONG DO DUOC (${tn.loi})` : `${tn.qua}/${SO_LUOT_BO_DUNG} qua`}`,
				);
				if (tn.loi) loi.push(tn.loi);
				ket[muc.ma].tacNhan = tn;
			}
		} finally {
			if (!xoaKho(SO_MO_HINH.tacNhan.kho))
				loi.push(`don hong: khong xoa duoc kho ${SO_MO_HINH.tacNhan.kho}`);
		}
	}
	if (loi.length > 0) {
		for (const l of loi) console.log(`SAI ${l}`);
		return khongDo(`${loi.length} nhanh khong do duoc — ${RA}`);
	}
	inBang(ket);
	return 0;
}

if (import.meta.main) {
	let ma;
	try {
		ma = await main();
	} catch (loi) {
		ma = khongDo(loi?.message ?? String(loi));
	}
	process.exit(ma);
}
