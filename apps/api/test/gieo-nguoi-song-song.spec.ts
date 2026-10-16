import { afterAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { donGieo, gieoNguoi } from "./dieu-phoi-gieo";

const SO_LUOT = 4;

const chuaCoToChuc =
	(await db.organization.count({ where: { id: WORKSPACE_ID } })) === 0;

afterAll(donGieo);

describe("gieo-nguoi-song-song", () => {
	test.skipIf(!chuaCoToChuc)(
		"gnss-dong-thoi: bon luot gieoNguoi cung luc tren kho chua co to chuc deu xong",
		async () => {
			await Promise.all(
				Array.from({ length: SO_LUOT * 2 }, () => db.$queryRaw`SELECT 1`),
			);
			const nguoi = await Promise.all(
				Array.from({ length: SO_LUOT }, () => gieoNguoi()),
			);
			expect(await db.organization.count({ where: { id: WORKSPACE_ID } })).toBe(
				1,
			);
			expect(
				await db.member.count({
					where: {
						organizationId: WORKSPACE_ID,
						userId: { in: nguoi.map((n) => n.id) },
					},
				}),
			).toBe(SO_LUOT);
		},
	);
});
