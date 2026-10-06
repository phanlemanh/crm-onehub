import { afterAll, describe, expect, test } from "bun:test";
import {
	ghiBiGoLui,
	ghiModelKhongTimThay,
} from "../../../apps/agent/agent/lib/model-danh-muc.ts";
import {
	ghiDoiTruong,
	type VaiDoiTruong,
} from "../../../apps/agent/agent/lib/quyen-truong.ts";
import { db } from "../../../packages/db/src/index.ts";
import { demDoiTruong } from "./dem-doi-truong.ts";

const TIEN_TO = `r1e-dem-${Date.now().toString(36)}`;
let so = 0;
const phien = () => `${TIEN_TO}-${++so}`;

async function lam(vai: VaiDoiTruong, ketQua: "lam" | "tu-choi") {
	await ghiDoiTruong(phien(), {
		hanhDong: "create",
		vai,
		ketQua,
		entity: "COMPANY",
	});
}

afterAll(async () => {
	await db.agentEvent.deleteMany({
		where: {
			OR: [
				{ sessionId: { startsWith: TIEN_TO } },
				{ data: { path: ["modelId"], string_starts_with: TIEN_TO } },
			],
		},
	});
});

describe("dem-truong", () => {
	test("dem-truong: ma tran gieo qua ham ghi that, dem dung va khong ghi hang", async () => {
		const tu = new Date(Date.now() - 1_000);
		await lam("owner", "lam");
		await lam("owner", "lam");
		await lam("admin", "lam");
		for (let i = 0; i < 3; i += 1) await lam("member", "tu-choi");
		const CHET: readonly VaiDoiTruong[] = [
			"member",
			"okr",
			"khong-thanh-vien",
			"tu-dong",
		];
		expect(CHET.length).toBe(4);
		for (const vai of CHET) await lam(vai, "lam");
		await ghiBiGoLui(`${TIEN_TO}/model-go`, "tro-ly");
		await ghiModelKhongTimThay(phien(), `${TIEN_TO}/model-go`);

		const truoc = await db.agentEvent.count();
		const ket = await demDoiTruong(db, tu);
		expect(await db.agentEvent.count()).toBe(truoc);

		if (ket.chet !== 4)
			throw new Error(`dem-truong: bo sot vai okr (chet ${ket.chet})`);
		expect(ket).toEqual({
			lam: {
				owner: 2,
				admin: 1,
				member: 1,
				okr: 1,
				"khong-thanh-vien": 1,
				"tu-dong": 1,
			},
			tuChoi: 3,
			chet: 4,
			biGoLui: 1,
			khongTimThay: 1,
		});
	});
});
