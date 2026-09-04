import { afterAll, expect, it } from "bun:test";
import { db } from "@crm/db";

const suffix = process.env.TEST_RUN_ID ?? "campaign-schema";

afterAll(async () => {
	await db.campaign.deleteMany({ where: { name: { startsWith: suffix } } });
	await db.savedView.deleteMany({ where: { name: { startsWith: suffix } } });
	await db.user.deleteMany({ where: { id: `${suffix}-user` } });
});

it("từ chối xoá góc nhìn đang có chiến dịch dùng", async () => {
	const user = await db.user.create({
		data: {
			id: `${suffix}-user`,
			name: "Thu",
			email: `${suffix}@example.com`,
			emailVerified: true,
		},
	});
	const view = await db.savedView.create({
		data: {
			entity: "CONTACT",
			name: `${suffix} góc nhìn`,
			shared: true,
			filters: { q: "", sort: "", dir: "asc", archived: false, filters: {} },
			ownerId: user.id,
		},
	});
	await db.campaign.create({
		data: {
			name: `${suffix} chiến dịch`,
			savedViewId: view.id,
			createdById: user.id,
		},
	});

	await expect(
		(async () => db.savedView.delete({ where: { id: view.id } }))(),
	).rejects.toThrow();
});
