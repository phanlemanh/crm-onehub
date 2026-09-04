import { afterAll, expect, it } from "bun:test";
import { db, Prisma } from "@crm/db";

const suffix = process.env.TEST_RUN_ID ?? "campaign-schema";

afterAll(async () => {
	await db.campaign.deleteMany({ where: { name: { startsWith: suffix } } });
	await db.savedView.deleteMany({ where: { name: { startsWith: suffix } } });
	await db.user.deleteMany({ where: { id: `${suffix}-user` } });
});

async function daNem(promise: Promise<unknown>): Promise<Error> {
	try {
		await promise;
	} catch (error) {
		return error as Error;
	}

	throw new Error("Câu xoá đã đi lọt mà đáng lẽ nó phải bị chặn.");
}

it("từ chối xoá góc nhìn đang có chiến dịch dùng, gỡ chiến dịch ra thì xoá được", async () => {
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
	const campaign = await db.campaign.create({
		data: {
			name: `${suffix} chiến dịch`,
			savedViewId: view.id,
			createdById: user.id,
		},
		select: { id: true },
	});

	const error = await daNem(db.savedView.delete({ where: { id: view.id } }));

	expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
	expect((error as Prisma.PrismaClientKnownRequestError).code).toBe("P2003");
	expect(error.message).toContain("campaign_savedViewId_fkey");

	expect(
		await db.savedView.findUnique({
			where: { id: view.id },
			select: { id: true },
		}),
	).toEqual({ id: view.id });

	await db.campaign.delete({ where: { id: campaign.id } });
	await db.savedView.delete({ where: { id: view.id } });

	expect(
		await db.savedView.findUnique({
			where: { id: view.id },
			select: { id: true },
		}),
	).toBeNull();
});
