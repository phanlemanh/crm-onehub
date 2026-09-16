import { beforeEach, describe, expect, it } from "bun:test";
import { decideSignIn } from "@crm/auth";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	APP_SETTING_ID,
	staffEmailDomains,
} from "../src/workspace/staff-domains";

const suffix = process.env.TEST_RUN_ID ?? "domain-nha";

async function datDomainNha(value: string | null) {
	await db.appSetting.upsert({
		where: { id: APP_SETTING_ID },
		create: { id: APP_SETTING_ID, staffEmailDomains: value },
		update: { staffEmailDomains: value },
	});
}

async function don() {
	await db.invitation.deleteMany({
		where: { id: { startsWith: `${suffix}-` } },
	});
	await db.user.deleteMany({ where: { id: { startsWith: `${suffix}-` } } });
}

function aiVaoDuoc(
	allowances: Parameters<typeof decideSignIn>[0]["allowances"],
) {
	return decideSignIn({
		email: "khach@gmail.com",
		allowances,
		seedList: "",
		anyUserExists: true,
	}).allowed;
}

describe("domain nha tach khoi danh sach nguoi", () => {
	beforeEach(async () => {
		await don();
		await db.organization.upsert({
			where: { id: WORKSPACE_ID },
			create: {
				id: WORKSPACE_ID,
				name: "CRM",
				slug: "crm",
				createdAt: new Date(),
			},
			update: {},
		});
	});

	it("doi o domain nha thi hai duong doc doi, ai-vao-duoc KHONG doi", async () => {
		const loiChoPhep = [
			{ email: "khach@gmail.com", role: "member", status: "pending" as const },
		];

		await datDomainNha("onemount.com");
		const domainTruoc = [...(await staffEmailDomains(db))];
		const vaoTruoc = aiVaoDuoc(loiChoPhep);

		await datDomainNha("doitac.vn,onemount.com");
		const domainSau = [...(await staffEmailDomains(db))];
		const vaoSau = aiVaoDuoc(loiChoPhep);

		expect([domainTruoc, domainSau, "o domain nha doi theo"]).toEqual([
			["onemount.com"],
			["doitac.vn", "onemount.com"],
			"o domain nha doi theo",
		]);

		expect([vaoTruoc, vaoSau, "ai-vao-duoc KHONG doi"]).toEqual([
			true,
			true,
			"ai-vao-duoc KHONG doi",
		]);
	});

	it("them roi rut mot loi cho phep thi o domain nha KHONG doi", async () => {
		await datDomainNha("onemount.com");
		const truoc = [...(await staffEmailDomains(db))];

		const vaoKhiCoPhep = aiVaoDuoc([
			{ email: "khach@gmail.com", role: "member", status: "pending" as const },
		]);
		const giuaChung = [...(await staffEmailDomains(db))];

		const vaoKhiRut = aiVaoDuoc([
			{
				email: "khach@gmail.com",
				role: "member",
				status: "cancelled" as const,
			},
		]);
		const sau = [...(await staffEmailDomains(db))];

		expect([
			truoc,
			giuaChung,
			sau,
			"o domain nha dung yen qua ca hai luot",
		]).toEqual([
			["onemount.com"],
			["onemount.com"],
			["onemount.com"],
			"o domain nha dung yen qua ca hai luot",
		]);

		expect([vaoKhiCoPhep, vaoKhiRut, "ai-vao-duoc thi CO doi"]).toEqual([
			true,
			false,
			"ai-vao-duoc thi CO doi",
		]);
	});

	it("o domain nha trong thi khong domain nao la nha", async () => {
		await datDomainNha(null);
		expect([[...(await staffEmailDomains(db))], "o trong"]).toEqual([
			[],
			"o trong",
		]);
	});
});
