import { expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { GOC_THAT, dungBanSao } from "./ban-sao.mjs";

const KHO_CHUOI = "apps/app/lib/messages/auth.ts";

function demWorktree() {
	return execFileSync("git", ["worktree", "list"], {
		cwd: GOC_THAT,
		encoding: "utf8",
	})
		.trim()
		.split("\n").length;
}

test("ban sao mang dot bien, cay dang lam viec thi khong", async () => {
	const truoc = demWorktree();
	const moc = `DOT-BIEN-${Date.now()}`;

	const { goc, don } = await dungBanSao({
		khongDungMayChu: true,
		sua: (root) => {
			const f = `${root}/${KHO_CHUOI}`;
			writeFileSync(f, readFileSync(f, "utf8").replace("One more step", moc));
		},
	});

	try {
		expect(readFileSync(`${goc}/${KHO_CHUOI}`, "utf8")).toContain(moc);
		expect(readFileSync(`${GOC_THAT}/${KHO_CHUOI}`, "utf8")).not.toContain(moc);
	} finally {
		await don();
	}

	expect(demWorktree()).toBe(truoc);
});

test("sua nem loi thi ban sao van duoc don", async () => {
	const truoc = demWorktree();

	await expect(
		dungBanSao({
			khongDungMayChu: true,
			sua: () => {
				throw new Error("co tinh hong");
			},
		}),
	).rejects.toThrow("co tinh hong");

	expect(demWorktree()).toBe(truoc);
});
