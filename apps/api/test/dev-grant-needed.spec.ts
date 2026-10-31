import { afterAll, expect, test } from "bun:test";
import { mailboxGrantsNeeded } from "@crm/auth";
import { db } from "@crm/db";
import { gieoGrantNeeded } from "../scripts/dev-grant-needed";

const suffix = process.env.TEST_RUN_ID ?? "grant-needed";
const EMAIL = `${suffix}-grant-needed@localhost`;

afterAll(async () => {
	const nguoi = await db.user.findUnique({
		where: { email: EMAIL },
		select: { id: true },
	});
	if (!nguoi) return;
	await db.session.deleteMany({ where: { userId: nguoi.id } });
	await db.account.deleteMany({ where: { userId: nguoi.id } });
	await db.member.deleteMany({ where: { userId: nguoi.id } });
	await db.user.delete({ where: { id: nguoi.id } });
});

async function doc() {
	const user = await db.user.findUniqueOrThrow({ where: { email: EMAIL } });
	return db.account.findMany({
		where: { userId: user.id },
		select: { providerId: true, scope: true },
	});
}

test("gieo google thi man xin quyen doi dung mot nha cung cap", async () => {
	await gieoGrantNeeded(EMAIL, "google");
	expect(mailboxGrantsNeeded(await doc())).toEqual(["google"]);
});

test("gieo both thi man xin quyen doi hai nha cung cap", async () => {
	await gieoGrantNeeded(EMAIL, "both");
	expect([...mailboxGrantsNeeded(await doc())].sort()).toEqual([
		"google",
		"microsoft",
	]);
});

test("go gieo thi man xin quyen khong con gi de doi", async () => {
	await gieoGrantNeeded(EMAIL, "both");
	await gieoGrantNeeded(EMAIL, "clear");
	expect(mailboxGrantsNeeded(await doc())).toEqual([]);
});
