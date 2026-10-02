import { type ChildProcess, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { MINUTE_MS } from "@crm/db/okr-tro-ly-danh-muc";
import {
	APP,
	congTuDo,
	giuKhoaEve,
	KHOI_DONG,
	khoiDongEve,
	type MayEve,
	traKhoaEve,
} from "./khoi-dong";

const SECOND_MS = MINUTE_MS / 60;
const TMP_GOC = process.env.TMPDIR ?? "";

const THU = {
	vaiGiu: "--giu",
	giuMs: 20 * SECOND_MS,
	dauSong: "giu-song",
	tmpKhac: "/tmp",
	pidChet: 999_999,
	eveBin: join(APP, "node_modules", ".bin", "eve"),
	nhanhMs: 30 * SECOND_MS,
	ma: { dat: 0, khongDat: 1 },
	cho: {
		eveNgoai: "khong phai cua bai thu",
		chinhMinh: "chinh tien trinh nay",
		congBan: "EADDRINUSE",
	},
} as const;

async function eveTho(): Promise<ChildProcess> {
	const cong = await congTuDo();
	const tien = spawn(THU.eveBin, ["dev", "--no-ui", "--port", String(cong)], {
		cwd: APP,
		stdio: "ignore",
		env: { ...process.env, PORT: String(cong) },
	});
	const het = Date.now() + KHOI_DONG.choMs;
	while (Date.now() < het) {
		try {
			const tep = readFileSync(join(APP, ...KHOI_DONG.trung.trangThai), "utf8");
			const r = await fetch(`http://127.0.0.1:${cong}/eve/v1/health`, {
				signal: AbortSignal.timeout(KHOI_DONG.hoiMs),
			});
			if (r.ok && tep.includes(`:${cong}`)) return tien;
		} catch {}
		await Bun.sleep(KHOI_DONG.nhipMs);
	}
	tien.kill("SIGKILL");
	throw new Error("eve tho khong len");
}

async function tat(tien: ChildProcess): Promise<void> {
	if (tien.exitCode !== null) return;
	const xong = new Promise((ok) => tien.once("exit", ok));
	tien.kill("SIGTERM");
	await xong;
}

async function giuNhuPhienDo(): Promise<void> {
	await giuKhoaEve([APP]);
	const eve = await eveTho();
	console.log(`${THU.dauSong} pid=${process.pid} luc=${Date.now()}`);
	await Bun.sleep(THU.giuMs);
	await tat(eve);
	traKhoaEve([APP]);
}

function chayGiu() {
	const tien = spawn(process.execPath, [import.meta.path, THU.vaiGiu], {
		stdio: ["ignore", "pipe", "inherit"],
		env: { ...process.env, TMPDIR: TMP_GOC },
	});
	const song = new Promise<number>((ok, loi) => {
		tien.stdout?.on("data", (d) => {
			const m = String(d).match(/luc=(\d+)/);
			if (m) ok(Number(m[1]));
		});
		tien.once("exit", (ma) =>
			loi(new Error(`tien trinh giu khoa thoat ${ma}`)),
		);
	});
	return { tien, song };
}

async function phaiDo(
	ten: string,
	can: string,
	chay: () => Promise<MayEve>,
): Promise<boolean> {
	const batDau = Date.now();
	try {
		const may = await chay();
		await may.dung();
	} catch (loi) {
		const cau = loi instanceof Error ? loi.message : String(loi);
		const ms = Date.now() - batDau;
		const dung = ms < KHOI_DONG.khoa.choMs && cau.includes(can);
		console.log(
			`${dung ? "DO DUNG" : "SAI"} ${ten}: ${ms} ms — ${cau.split("\n")[0]}`,
		);
		return dung;
	}
	console.log(`SAI ${ten}: khoi dong lot, khong do`);
	return false;
}

async function chinh(): Promise<number> {
	const giu = chayGiu();
	const lucGiu = await giu.song;
	const batDau = Date.now();
	const may = await khoiDongEve();
	const choMs = Date.now() - batDau;
	const goc = may.goc === APP;
	await may.dung();
	await tat(giu.tien);
	const dat1 = goc && batDau - lucGiu + choMs >= THU.giuMs;
	console.log(
		`${dat1 ? "DAT" : "SAI"} phien do (pid ${giu.tien.pid}, TMPDIR khac) giu APP: bai thu cho ${Math.round(choMs / 1000)} s roi chay o APP`,
	);

	const tho = await eveTho();
	const dat2 = await phaiDo(
		`eve dev khong ai giu khoa (pid ${tho.pid})`,
		THU.cho.eveNgoai,
		() => khoiDongEve(),
	);
	await tat(tho);

	const that = realpathSync(APP);
	const khoa = join(
		...KHOI_DONG.khoa.thuMuc,
		createHash("sha256").update(that).digest("hex").slice(0, 16),
	);
	mkdirSync(khoa, { recursive: true });
	writeFileSync(
		join(khoa, KHOI_DONG.khoa.tep),
		JSON.stringify({ pid: THU.pidChet, tep: "da-chet" }),
	);
	const batDauCu = Date.now();
	const mayCu = await khoiDongEve();
	const msCu = Date.now() - batDauCu;
	await mayCu.dung();
	const dat3 = msCu < THU.nhanhMs;
	console.log(
		`${dat3 ? "DAT" : "SAI"} khoa cu (pid ${THU.pidChet} da chet) bi go lai: khoi dong ${msCu} ms`,
	);

	const cong = await congTuDo();
	const giuCong = createServer();
	await new Promise<void>((ok) => giuCong.listen(cong, "127.0.0.1", ok));
	const dat4 = await phaiDo(
		`cong ${cong} bi tien trinh ngoai giu`,
		THU.cho.congBan,
		() => khoiDongEve({ cong }),
	);
	giuCong.close();

	const chinhMay = await khoiDongEve();
	const dat5 = await phaiDo(
		"khoi dong lai APP khi may chinh chua dung",
		THU.cho.chinhMinh,
		() => khoiDongEve(),
	);
	await chinhMay.dung();

	return dat1 && dat2 && dat3 && dat4 && dat5 ? THU.ma.dat : THU.ma.khongDat;
}

if (process.argv.includes(THU.vaiGiu)) await giuNhuPhienDo();
else {
	process.env.TMPDIR = THU.tmpKhac;
	process.exit(await chinh());
}
