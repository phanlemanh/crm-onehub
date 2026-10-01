import { type ChildProcess, spawn } from "node:child_process";
import { createServer } from "node:net";
import {
	APP,
	congTuDo,
	KHOI_DONG,
	khoiDongEve,
	type MayEve,
} from "./khoi-dong";

const SECOND_MS = 1_000;

const THU = {
	vaiCon: "--con",
	giuMs: 20 * SECOND_MS,
	dauSong: "song ",
	congSai: 70_000,
	ma: { dat: 0, khongDat: 1 },
} as const;

async function con(): Promise<void> {
	const may = await khoiDongEve();
	const r = await fetch(`${may.url}/eve/v1/health`);
	console.log(
		`${THU.dauSong}${r.status} ${may.url} goc=${may.goc === APP ? "APP" : may.goc.slice(APP.length + 1)}`,
	);
	await Bun.sleep(THU.giuMs);
	await may.dung();
}

type Con = {
	tien: ChildProcess;
	xong: Promise<{ ma: number | null; ra: string }>;
};

function chayCon(): Con {
	const ra: string[] = [];
	const tien = spawn(process.execPath, [import.meta.path, THU.vaiCon], {
		stdio: ["ignore", "pipe", "pipe"],
		env: process.env,
	});
	tien.stdout?.on("data", (d) => ra.push(String(d)));
	tien.stderr?.on("data", (d) => ra.push(String(d)));
	const xong = new Promise<{ ma: number | null; ra: string }>((ok) =>
		tien.on("exit", (ma) => ok({ ma, ra: ra.join("") })),
	);
	return { tien, xong };
}

function choSong(c: Con): Promise<void> {
	return new Promise((ok) => {
		const nghe = (d: Buffer) => {
			if (String(d).includes(THU.dauSong)) {
				c.tien.stdout?.off("data", nghe);
				ok();
			}
		};
		c.tien.stdout?.on("data", nghe);
		void c.xong.then(() => ok());
	});
}

async function phaiDo(ten: string, chay: () => Promise<MayEve>) {
	const batDau = Date.now();
	try {
		const may = await chay();
		await may.dung();
	} catch (loi) {
		const cau = loi instanceof Error ? loi.message : String(loi);
		const ms = Date.now() - batDau;
		const dung = ms < KHOI_DONG.choMs && !cau.includes(KHOI_DONG.trung.dau);
		console.log(
			`${dung ? "DO DUNG" : "SAI"} ${ten}: ${ms} ms — ${cau
				.split("\n")
				.filter((d) => d.trim())
				.slice(0, 3)
				.join(" | ")}`,
		);
		return dung;
	}
	console.log(`SAI ${ten}: khoi dong lot, khong do`);
	return false;
}

async function chinh(): Promise<number> {
	const a = chayCon();
	const b = chayCon();
	await choSong(a);
	const c = chayCon();
	const ket = await Promise.all([a.xong, b.xong, c.xong]);
	console.log("ba tien trinh cung goc APP (A, B cung luc; C khi A da song):");
	for (const [i, k] of ket.entries())
		console.log(
			`  ${"ABC"[i]} ma ${k.ma}: ${k.ra.split("\n").find((d) => d.startsWith(THU.dauSong)) ?? k.ra.slice(-600)}`,
		);
	const songCa = ket.every(
		(k) => k.ma === 0 && k.ra.includes(`${THU.dauSong}200`),
	);
	console.log(songCa ? "DAT ca ba cung chay" : "SAI co ben khong chay");

	const cong = await congTuDo();
	const ngoai = createServer();
	await new Promise<void>((ok) => ngoai.listen(cong, "127.0.0.1", ok));
	const congBan = await phaiDo(`cong ${cong} bi tien trinh ngoai giu`, () =>
		khoiDongEve({ cong }),
	);
	ngoai.close();

	const congSai = await phaiDo(`eve tu thoat (cong ${THU.congSai})`, () =>
		khoiDongEve({ cong: THU.congSai }),
	);

	return songCa && congBan && congSai ? THU.ma.dat : THU.ma.khongDat;
}

if (process.argv.includes(THU.vaiCon)) await con();
else process.exit(await chinh());
