import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { persistBuilderInputRequest } from "../../../apps/agent/agent/lib/builder-input";
import { builderToken } from "../../../apps/agent/agent/lib/custom-agent-dispatch";
import { PHIEN_DO } from "../../../scripts/lan-do/cau-hinh.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { db } = (await import(
	Bun.resolveSync("@crm/db", join(GOC, "apps/agent")),
)) as typeof import("../../../packages/db/src/index");
const mau = JSON.parse(
	readFileSync(
		join(GOC, "apps/agent/test/fixtures/session-limit-that.json"),
		"utf8",
	),
);

const tenKho = new URL(process.env.DATABASE_URL ?? "").pathname.slice(1);
if (!/_do$|_gieo$/.test(tenKho)) {
	console.error(
		`khong gieo vao kho ${tenKho}: chi gieo vao kho do (_do) hay kho gieo (_gieo)`,
	);
	process.exit(2);
}

const email = process.env.NGUOI ?? PHIEN_DO.nguoi;
const nguoi = await db.user.findUnique({
	where: { email },
	select: { id: true },
});
const toChuc = await db.organization.findFirst({ select: { slug: true } });
if (!nguoi || !toChuc) {
	console.error(
		`khong thay nguoi ${email} hoac to chuc — chay dev:session truoc`,
	);
	process.exit(2);
}

const hoi = await db.agentConversation.create({
	data: {
		kind: "BUILDER",
		userId: nguoi.id,
		title: "Tổng hợp contact mới hàng ngày",
		sessionId: `gieo-het-han-muc-${crypto.randomUUID()}`,
		lastMessageAt: new Date(),
		submissions: {
			create: {
				submittedById: nguoi.id,
				clientRequestId: crypto.randomUUID(),
				commandType: "CREATE_AGENT",
				status: "ACCEPTED",
				acceptedAt: new Date(),
				message: {
					text: "/create-agent Tổng hợp contact mới hàng ngày",
					resources: [],
					attachments: [],
				},
			},
		},
	},
	select: { id: true },
});

const daLuu = await persistBuilderInputRequest(
	mau.data,
	builderToken(hoi.id),
	hoi.id,
	true,
);
if (!daLuu) {
	console.error("persistBuilderInputRequest khong luu cau hoi session-limit");
	process.exit(1);
}

const appUrl = process.env.APP_URL ?? "http://localhost:3000";
console.log(`${appUrl}/${toChuc.slug}/chat/${hoi.id}`);
await db.$disconnect();
