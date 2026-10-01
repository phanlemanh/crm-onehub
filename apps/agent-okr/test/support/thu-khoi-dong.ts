import { type ChildProcess, spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { MINUTE_MS } from "@crm/db/okr-tro-ly-danh-muc";
import {
	APP,
	congTuDo,
	KHOI_DONG,
	khoiDongEve,
	type MayEve,
} from "./khoi-dong";

const SECOND_MS = MINUTE_MS / 60;

const THU = {
	vaiCon: "--con",
	giuMs: 10 * SECOND_MS,
	dauSong: "song ",
	dauDung: "dung ",
	eveBin: join(APP, "node_modules", ".bin", "eve"),
	ma: { dat: 0, khongDat: 1 },
	cho: {
		eveNgoai: "khong phai cua bai thu",
		chinhMinh: "chinh tien trinh nay",
		congBan: "EADDRINUSE",
	},
} as const;

async function con(): Promise<void> {
	const may = await khoiDongEve();
	const r = await fetch(`${may.url}/eve/v1/health`);
	console.log(
		`${THU.dauSong}${r.status} goc=${may.goc === APP ? "APP" : may.goc} luc=${Date.now()}`,
	);
	await Bun.sleep(THU.giuMs);
	await may.dung();
	console.log(`${THU.dauDung}luc=${Date.now()}`);
}

type KetCon = { ma: number | null; ra: string };

function chayCon(): Promise<KetCon> {
	return new Promise((ok) => {
		const ra: string[] = [];
		const tien = spawn(process.execPath, [import.meta.path, THU.vaiCon], {
			stdio: ["ignore", "pipe", "pipe"],
			env: process.env,
		});
		tien.stdout?.on("data", (d) => ra.push(String(d)));
		tien.stderr?.on("data", (d) => ra.push(String(d)));
		tien.on("exit", (ma) => ok({ ma, ra: ra.join("") }));
	});
}

const lucCua = (ra: string, dau: string) =>
	Number(
		ra
			.split("\n")
			.find((d) => d.startsWith(dau))
			?.match(/luc=(\d+)/)?.[1] ?? Number.NaN,
	);

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
			`${dung ? "DO DUNG" : "SAI"} ${ten}: ${ms} ms — ${cau
				.split("\n")
				.filter((d) => d.trim())
				.slice(0, 2)
				.join(" | ")}`,
		);
		return dung;
	}
	console.log(`SAI ${ten}: khoi dong lot, khong do`);
	return false;
}

async function eveNgoai(): Promise<ChildProcess> {
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
	throw new Error("eve ngoai khong len");
}

async function chinh(): Promise<number> {
	const [a, b] = await Promise.all([chayCon(), chayCon()]);
	const [truoc, sau] =
		lucCua(a.ra, THU.dauSong) < lucCua(b.ra, THU.dauSong) ? [a, b] : [b, a];
	const noiTiep = lucCua(sau.ra, THU.dauSong) >= lucCua(truoc.ra, THU.dauDung);
	const songCa = [a, b].every(
		(k) => k.ma === 0 && k.ra.includes(`${THU.dauSong}200 goc=APP`),
	);
	console.log("hai tien trinh khoi dong cung luc cung goc APP:");
	for (const [ten, k] of [
		["truoc", truoc],
		["sau", sau],
	] as const)
		console.log(
			`  ${ten} ma ${k.ma}: ${k.ra
				.split("\n")
				.filter((d) => d.startsWith(THU.dauSong) || d.startsWith(THU.dauDung))
				.join(" · ")}`,
		);
	const dat1 = songCa && noiTiep;
	console.log(
		dat1
			? "DAT ca hai chay o goc APP, ben sau cho ben truoc dung roi moi len"
			: "SAI",
	);

	const ngoai = await eveNgoai();
	const dat2 = await phaiDo(
		`eve dev ngoai bai thu giu APP (pid ${ngoai.pid})`,
		THU.cho.eveNgoai,
		() => khoiDongEve(),
	);
	ngoai.kill("SIGTERM");
	await new Promise((ok) => ngoai.once("exit", ok));

	const cong = await congTuDo();
	const giuCong = createServer();
	await new Promise<void>((ok) => giuCong.listen(cong, "127.0.0.1", ok));
	const dat3 = await phaiDo(
		`cong ${cong} bi tien trinh ngoai giu`,
		THU.cho.congBan,
		() => khoiDongEve({ cong }),
	);
	giuCong.close();

	const chinhMay = await khoiDongEve();
	const dat4 = await phaiDo(
		"khoi dong lai APP khi may chinh chua dung",
		THU.cho.chinhMinh,
		() => khoiDongEve(),
	);
	await chinhMay.dung();

	return dat1 && dat2 && dat3 && dat4 ? THU.ma.dat : THU.ma.khongDat;
}

if (process.argv.includes(THU.vaiCon)) await con();
else process.exit(await chinh());
