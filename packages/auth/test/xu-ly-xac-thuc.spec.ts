import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { connect } from "node:net";
import { resolve } from "node:path";
import { auth, xuLyXacThuc } from "../src/auth";
import { env } from "../src/env";

const CHO_SAU_NGAT_MS = 500;
const DO_DAI_KHAI = 1000;
const PHAN_DA_GUI = '{"email":';

let tienTrinh: ReturnType<typeof Bun.spawn>;
let cong = 0;
const CHO_KHOI_DONG_MS = 20_000;
const MAY_CHU = resolve(import.meta.dir, "fixtures/may-chu-xac-thuc.ts");

async function docCong(luong: ReadableStream<Uint8Array>): Promise<number> {
	const doc = luong.getReader();
	const giaiMa = new TextDecoder();
	let da = "";
	const han = Date.now() + CHO_KHOI_DONG_MS;
	while (Date.now() < han) {
		const { value, done } = await doc.read();
		if (done) break;
		da += giaiMa.decode(value);
		const khop = da.match(/CONG (\d+)/);
		if (khop?.[1]) {
			doc.releaseLock();
			return Number(khop[1]);
		}
	}
	throw new Error(`may chu thu khong len: ${da}`);
}

beforeAll(async () => {
	tienTrinh = Bun.spawn(["bun", MAY_CHU], {
		stdout: "pipe",
		stderr: "pipe",
		env: process.env,
	});
	cong = await docCong(tienTrinh.stdout as ReadableStream<Uint8Array>);
});

afterAll(() => {
	tienTrinh.kill();
});

function duongApi(duong: string): string {
	return `/api/auth${duong}`;
}

async function guiDoRoiNgat(): Promise<void> {
	await new Promise<void>((xong) => {
		const socket = connect(cong, "127.0.0.1", () => {
			socket.write(
				[
					`POST ${duongApi("/sign-in/email")} HTTP/1.1`,
					`Host: 127.0.0.1:${cong}`,
					"Content-Type: application/json",
					`Content-Length: ${DO_DAI_KHAI}`,
					"",
					PHAN_DA_GUI,
				].join("\r\n"),
			);
			setTimeout(() => {
				socket.destroy();
				xong();
			}, 50);
		});
	});
	await Bun.sleep(CHO_SAU_NGAT_MS);
}

describe("xu-ly-xac-thuc", () => {
	it("nguoi goi ngat giua chung khong lam sap tien trinh, yeu cau ke van duoc tra loi", async () => {
		await guiDoRoiNgat();
		if (tienTrinh.exitCode !== null) {
			throw new Error(
				`api sap khi nguoi goi ngat giua chung: tien trinh thoat ma ${tienTrinh.exitCode}`,
			);
		}
		const tra = await fetch(`http://127.0.0.1:${cong}${duongApi("/ok")}`);
		expect(tra.status).toBe(200);
	});

	it("lop boc tra loi y nhu better-auth goc cho POST json than rong", async () => {
		const taoYeuCau = () =>
			new Request(`${env.apiUrl}${duongApi("/sign-out")}`, {
				method: "POST",
				headers: { "content-type": "application/json" },
			});
		const goc = await auth.handler(taoYeuCau());
		const boc = await xuLyXacThuc(taoYeuCau());
		expect(boc.status).toBe(goc.status);
	});
});
