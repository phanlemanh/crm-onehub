import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createWriteStream, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
	GOC,
	taoKho,
	xoaKho,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const TAC_NHAN = {
	kho: "rmh-tac-nhan",
	eval: "agent-builder",
	soLuot: 3,
	cuaSo: {
		"zai/glm-5.2-fast": 1_000_000,
		"google/gemini-3.8-flash": 1_000_000,
		"zai/glm-5.3-flash": 1_000_000,
	},
	trangThai: { "✓": "passed", "✗": "failed", "○": "scored", "–": "skipped" },
	ra: join(GOC, ".acceptance-runs", "re-mo-hinh-mac-dinh", "tac-nhan"),
};

function khongDo(lyDo) {
	console.log(`KHONG DO DUOC: ${lyDo}`);
	return 2;
}

function docKetQua(chu) {
	const kyHieu = Object.keys(TAC_NHAN.trangThai).join("");
	const m = chu.match(
		new RegExp(`^([${kyHieu}])\\s+${TAC_NHAN.eval}(?:\\s|$)`, "mu"),
	);
	if (!m) return { khongDo: `khong co dong ket qua cua ${TAC_NHAN.eval}` };
	const trangThai = TAC_NHAN.trangThai[m[1]];
	if (trangThai === "skipped")
		return { khongDo: `${TAC_NHAN.eval} bi bo qua (skipped)` };
	return { qua: trangThai === "passed", trangThai };
}

function chay(lenh, { env, tep, cwd }) {
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

function datModel(url, ma) {
	const r = spawnSync(
		"bun",
		[
			"-e",
			`import { db } from ${JSON.stringify(join(GOC, "packages/db/src/client.ts"))};
import { readAgentModel, writeAgentModel } from ${JSON.stringify(join(GOC, "packages/db/src/settings.ts"))};
try {
	await writeAgentModel(db, ${JSON.stringify({ id: ma, contextWindowTokens: TAC_NHAN.cuaSo[ma] })});
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

async function doMot(ma, url, ra) {
	const dat = datModel(url, ma);
	if (dat.loi) return { loi: `khong ghi duoc o model (${dat.loi})` };
	console.log(`readAgentModel: ${JSON.stringify(dat.model)}`);
	if (dat.model.id !== ma || dat.model.isDefault)
		return { loi: `o model doc lai ${dat.model.id}, khong phai ${ma}` };
	const luot = [];
	for (let i = 1; i <= TAC_NHAN.soLuot; i++) {
		const tep = join(ra, `luot-${i}.log`);
		await chay(
			[
				join(GOC, "apps/agent/node_modules/.bin/eve"),
				"eval",
				TAC_NHAN.eval,
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
		const kq = docKetQua(readFileSync(tep, "utf8"));
		if ("khongDo" in kq) return { loi: `luot ${i}: ${kq.khongDo} — ${tep}` };
		console.log(`luot ${i}: ${kq.trangThai} — ${tep}`);
		luot.push(kq.qua);
	}
	return { qua: luot.filter(Boolean).length };
}

async function main() {
	const i = process.argv.indexOf("--ma");
	const ma = i > 0 ? process.argv[i + 1] : undefined;
	if (!ma || !(ma in TAC_NHAN.cuaSo))
		return khongDo(
			`--ma phai la mot trong ${Object.keys(TAC_NHAN.cuaSo).join(", ")}`,
		);
	const ra = join(
		TAC_NHAN.ra,
		`${new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15)}-${ma.replace("/", "-")}`,
	);
	mkdirSync(ra, { recursive: true });
	let url;
	try {
		url = taoKho(TAC_NHAN.kho);
	} catch (e) {
		return khongDo(`khong tao duoc kho do (${e?.message ?? e})`);
	}
	let ket;
	try {
		ket = await doMot(ma, url, ra);
	} finally {
		if (!xoaKho(TAC_NHAN.kho))
			console.log(`don hong: khong xoa duoc kho ${TAC_NHAN.kho}`);
	}
	if (ket.loi) return khongDo(ket.loi);
	console.log(
		`tac nhan bo dung ${ma}: ${ket.qua}/${TAC_NHAN.soLuot} qua — ${ra}`,
	);
	return 0;
}

let ma;
try {
	ma = await main();
} catch (loi) {
	ma = khongDo(loi?.message ?? String(loi));
}
process.exit(ma);
