import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { parse, schemas } from "@crm/validation";
import { docDuocPhamVi, toWorkspaceRole } from "@crm/validation/vai-workspace";
import { z } from "zod";
import { SLACK } from "./slack-config";

export const TU_CHOI_NGUOI_NHAN =
	"at this Slack destination may not read partner data";

export const KHONG_KIEM_DUOC_NGUOI_NHAN =
	"Refused: could not check who is at this Slack destination";

export type DichSlack = { kind: "channel" | "user"; id: string };

const conTro = z.object({ next_cursor: z.string().nullish() }).nullish();

const trangThanhVienKenh = schemas.slack.reply.extend({
	members: z.array(z.string().trim().min(1)).default([]),
	response_metadata: conTro,
});

const nguoiSlack = z.object({
	id: z.string().trim().min(1),
	profile: z.object({ email: z.string().trim().min(1).nullish() }).nullish(),
	deleted: z.boolean().optional(),
	is_bot: z.boolean().optional(),
});

const trangDanhBa = schemas.slack.reply.extend({
	members: z.array(nguoiSlack).default([]),
	response_metadata: conTro,
});

type NguoiSlack = z.infer<typeof nguoiSlack>;

type ChiOkr = { emails: Set<string>; slackIds: Set<string> };

function chuanEmail(value: string): string {
	return value.trim().toLowerCase();
}

type Trang<T> = { members: T[]; next: string };

function ketTrang<T>(
	page: {
		ok: boolean;
		error?: string | null;
		members: T[];
		response_metadata?: { next_cursor?: string | null } | null;
	},
	method: string,
): Trang<T> {
	if (!page.ok) {
		throw new Error(
			`Slack ${method} was rejected (${page.error ?? "rejected"}).`,
		);
	}
	return {
		members: page.members,
		next: page.response_metadata?.next_cursor ?? "",
	};
}

function trangKenh(value: unknown): Trang<string> {
	const method = "conversations.members";
	return ketTrang(parse(trangThanhVienKenh, value, `Slack ${method}`), method);
}

function trangNguoi(value: unknown): Trang<NguoiSlack> {
	const method = "users.list";
	return ketTrang(parse(trangDanhBa, value, `Slack ${method}`), method);
}

async function docMoiTrang<T>(
	token: string,
	method: string,
	params: Record<string, string>,
	docTrang: (value: unknown) => Trang<T>,
): Promise<T[]> {
	const members: T[] = [];
	let cursor = "";
	do {
		const url = new URL(`https://slack.com/api/${method}`);
		url.searchParams.set("limit", String(SLACK.inventory.pageSize));
		for (const [key, value] of Object.entries(params)) {
			url.searchParams.set(key, value);
		}
		if (cursor) url.searchParams.set("cursor", cursor);
		const response = await fetch(url, {
			headers: { authorization: `Bearer ${token}` },
			signal: AbortSignal.timeout(SLACK.request.timeoutMs),
		});
		if (!response.ok) throw new Error(`Slack ${method} failed.`);
		const page = docTrang(await response.json());
		members.push(...page.members);
		cursor = page.next;
	} while (cursor);
	return members;
}

async function nguoiODich(
	token: string,
	destination: DichSlack,
): Promise<string[]> {
	if (destination.kind === "user") return [destination.id];
	return docMoiTrang(
		token,
		"conversations.members",
		{ channel: destination.id },
		trangKenh,
	);
}

async function thanhVienChiOkr(): Promise<ChiOkr> {
	const members = await db.member.findMany({
		where: { organizationId: WORKSPACE_ID },
		select: {
			role: true,
			user: {
				select: {
					email: true,
					slackMemberMatch: { select: { slackUserId: true } },
				},
			},
		},
	});
	const chan = members.filter(
		(member) => !docDuocPhamVi(toWorkspaceRole(member.role), "doi-tac"),
	);
	return {
		emails: new Set(chan.map((member) => chuanEmail(member.user.email))),
		slackIds: new Set(
			chan.flatMap((member) => member.user.slackMemberMatch?.slackUserId ?? []),
		),
	};
}

function demNguoiChan(
	nguoiO: string[],
	danhBa: Map<string, NguoiSlack>,
	chiOkr: ChiOkr,
): number {
	let so = 0;
	for (const id of new Set(nguoiO)) {
		const nguoi = danhBa.get(id);
		if (nguoi?.is_bot || nguoi?.deleted) continue;
		const email = nguoi?.profile?.email;
		if (
			chiOkr.slackIds.has(id) ||
			(email && chiOkr.emails.has(chuanEmail(email)))
		) {
			so += 1;
		}
	}
	return so;
}

export async function kiemNguoiNhanSlack(
	accessToken: string,
	destination: DichSlack,
): Promise<void> {
	let so: number;
	try {
		const [nguoiO, danhBa, chiOkr] = await Promise.all([
			nguoiODich(accessToken, destination),
			docMoiTrang(accessToken, "users.list", {}, trangNguoi),
			thanhVienChiOkr(),
		]);
		so = demNguoiChan(
			nguoiO,
			new Map(danhBa.map((nguoi) => [nguoi.id, nguoi])),
			chiOkr,
		);
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		throw new Error(`${KHONG_KIEM_DUOC_NGUOI_NHAN} (${reason}).`);
	}
	if (so > 0) {
		throw new Error(
			`Refused: ${so} ${so === 1 ? "person" : "people"} ${TU_CHOI_NGUOI_NHAN}.`,
		);
	}
}

export function laTuChoiNguoiNhan(message: string): boolean {
	return (
		message.includes(TU_CHOI_NGUOI_NHAN) ||
		message.startsWith(KHONG_KIEM_DUOC_NGUOI_NHAN)
	);
}
