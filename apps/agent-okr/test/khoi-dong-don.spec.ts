import { afterEach, describe, expect, test } from "bun:test";
import { type ChildProcess, spawn } from "node:child_process";
import { join } from "node:path";
import {
	dungGocGia,
	type GocGia,
	sinhEveGia,
	songCon,
} from "./support/eve-gia";
import {
	choRoute,
	congTuDo,
	giuKhoaEve,
	KHOI_DONG,
	traKhoaEve,
} from "./support/khoi-dong";

const SUPPORT = join(import.meta.dir, "support");
const TRAN_CA_MS = 30_000;
const TRAN_NHO = { choMs: 1_500, nhipMs: 100 } as const;

const MA_CON = `
import { giuKhoaEve, ghiConVaoKhoa } from ${JSON.stringify(join(SUPPORT, "khoi-dong.ts"))};
import { sinhEveGia } from ${JSON.stringify(join(SUPPORT, "eve-gia.ts"))};
const goc = process.env.GOC_GIA;
await giuKhoaEve([goc]);
const pid = process.env.PID_GHI ? Number(process.env.PID_GHI) : sinhEveGia(goc).pid;
ghiConVaoKhoa(goc, pid);
console.log("SAN SANG " + pid);
setInterval(() => {}, 1e6);
`;

type Canh = { goc: GocGia; pidGhi: number };

const donDep: (() => void)[] = [];

afterEach(() => {
	for (const f of donDep.splice(0)) f();
});

function giet(pid: number): void {
	try {
		process.kill(pid, "SIGKILL");
	} catch {}
}

async function conGhiKhoa(goc: GocGia, pidGhi?: number): Promise<Canh> {
	const env = pidGhi
		? { ...process.env, GOC_GIA: goc.goc, PID_GHI: String(pidGhi) }
		: { ...process.env, GOC_GIA: goc.goc };
	const con = spawn("bun", ["-e", MA_CON], {
		cwd: join(import.meta.dir, ".."),
		stdio: ["ignore", "pipe", "pipe"],
		env,
	});
	const pid = await new Promise<number>((ok, loi) => {
		let ra = "";
		con.stdout?.on("data", (d) => {
			ra += String(d);
			const m = ra.match(/SAN SANG (\d+)/);
			if (m?.[1]) ok(Number(m[1]));
		});
		con.stderr?.on("data", (d) => {
			ra += String(d);
		});
		con.once("exit", (ma) => loi(new Error(`con thoat ${ma}: ${ra}`)));
	});
	await gietCho(con);
	return { goc, pidGhi: pid };
}

function gietCho(con: ChildProcess): Promise<void> {
	return new Promise((ok) => {
		con.once("exit", () => ok());
		con.kill("SIGKILL");
	});
}

function gocMoi(): GocGia {
	const goc = dungGocGia();
	donDep.push(() => {
		traKhoaEve([goc.goc]);
		goc.don();
	});
	return goc;
}

function theoDoi(pid: number): number {
	donDep.push(() => giet(pid));
	return pid;
}

async function choChet(pid: number): Promise<boolean> {
	const het = Date.now() + KHOI_DONG.dungMs * 2;
	while (Date.now() < het) {
		if (!songCon(pid)) return true;
		await Bun.sleep(50);
	}
	return !songCon(pid);
}

describe("mo-coi", () => {
	test(
		"lượt test bị giết để lại eve con: lượt sau dừng đúng eve đó rồi giữ khoá",
		async () => {
			const goc = gocMoi();
			const { pidGhi } = await conGhiKhoa(goc);
			theoDoi(pidGhi);
			if (!songCon(pidGhi)) throw new Error("khong dung duoc canh mo coi");
			await giuKhoaEve([goc.goc]);
			if (!(await choChet(pidGhi)))
				throw new Error(`mo coi con song: ${pidGhi}`);
		},
		TRAN_CA_MS,
	);

	test(
		"eve mồ côi đã tự chết trước lượt sau: dọn bỏ qua, không ném",
		async () => {
			const goc = gocMoi();
			const { pidGhi } = await conGhiKhoa(goc);
			giet(pidGhi);
			await choChet(pidGhi);
			await giuKhoaEve([goc.goc]);
			expect(songCon(pidGhi)).toBe(false);
		},
		TRAN_CA_MS,
	);
});

describe("ngoai-khoa", () => {
	test(
		"(i) eve người khác chạy ở gốc, không có trong khoá: còn sống",
		async () => {
			const goc = gocMoi();
			const ngoai = theoDoi(sinhEveGia(goc.goc).pid ?? 0);
			const { pidGhi } = await conGhiKhoa(goc);
			theoDoi(pidGhi);
			await giuKhoaEve([goc.goc]);
			if (!(await choChet(pidGhi)))
				throw new Error(`mo coi con song: ${pidGhi}`);
			if (!songCon(ngoai)) throw new Error("dung nham eve ngoai khoa");
		},
		TRAN_CA_MS,
	);

	test(
		"(ii) pid trong khoá là tiến trình không phải eve: còn sống",
		async () => {
			const goc = gocMoi();
			const ngu = spawn("sleep", ["300"], { stdio: "ignore" });
			const pid = theoDoi(ngu.pid ?? 0);
			await conGhiKhoa(goc, pid);
			await giuKhoaEve([goc.goc]);
			await Bun.sleep(KHOI_DONG.dungMs / 5);
			if (!songCon(pid)) throw new Error("dung nham tien trinh khong phai eve");
		},
		TRAN_CA_MS,
	);
});

function mayGia(traLoi: () => number) {
	let hoi = 0;
	const may = Bun.serve({
		port: 0,
		hostname: "127.0.0.1",
		fetch: () => {
			hoi++;
			return new Response("", { status: traLoi() });
		},
	});
	donDep.push(() => may.stop(true));
	return { url: `http://127.0.0.1:${may.port}/health`, soHoi: () => hoi };
}

describe("cho-route", () => {
	test("200 ngay lần đầu: trả máy ngay", async () => {
		const m = mayGia(() => 200);
		expect(await choRoute(m.url, TRAN_NHO)).toBe(200);
		expect(m.soHoi()).toBe(1);
	});

	test("503 ba lần rồi 404: chờ tới 404", async () => {
		let n = 0;
		const m = mayGia(() => (++n <= 3 ? 503 : 404));
		const ma = await choRoute(m.url, TRAN_NHO);
		if (ma !== 404) throw new Error(`tra may khi route con 503: ${ma}`);
		expect(m.soHoi()).toBeGreaterThanOrEqual(4);
	});

	test(
		"bị từ chối kết nối rồi máy mới mở: chờ tới 404",
		async () => {
			const cong = await congTuDo();
			let hoi = 0;
			setTimeout(() => {
				const may = Bun.serve({
					port: cong,
					hostname: "127.0.0.1",
					fetch: () => {
						hoi++;
						return new Response("", { status: 404 });
					},
				});
				donDep.push(() => may.stop(true));
			}, 400);
			const ma = await choRoute(`http://127.0.0.1:${cong}/health`, {
				choMs: 3_000,
				nhipMs: 100,
			}).catch((loi: Error) => {
				throw new Error(`bo cuoc khi bi tu choi: ${loi.message}`);
			});
			expect(ma).toBe(404);
			expect(hoi).toBeGreaterThanOrEqual(1);
		},
		TRAN_CA_MS,
	);

	test("503 mãi: ném lỗi gọi tên route và mã", async () => {
		const m = mayGia(() => 503);
		const loi = await choRoute(m.url, TRAN_NHO).then(
			() => null,
			(e: Error) => e.message,
		);
		expect(loi).toContain("/health");
		expect(loi).toContain("503");
	});

	test("không ai nghe: ném lỗi gọi tên route và khong ket noi", async () => {
		const cong = await congTuDo();
		const loi = await choRoute(
			`http://127.0.0.1:${cong}/health`,
			TRAN_NHO,
		).then(
			() => null,
			(e: Error) => e.message,
		);
		expect(loi).toContain("/health");
		expect(loi).toContain("khong ket noi");
	});

	test("trần chờ route nhỏ hơn trần mỗi gốc của hook app-rieng", () => {
		expect(KHOI_DONG.sanSang.choMs).toBeLessThan(KHOI_DONG.choMs);
	});
});
