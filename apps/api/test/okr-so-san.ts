import { db } from "@crm/db";
import type { MaChiSo } from "@crm/validation/okr-chi-so";
import { ma } from "./okr-san";
import { gieoThanhVien } from "./phien-thu";

export const KY = {
	startsOn: new Date("2026-10-01T00:00:00Z"),
	endsOn: new Date("2026-12-31T00:00:00Z"),
} as const;

export const MOC = {
	truocKy: new Date("2026-09-01T03:00:00Z"),
	ngoai: new Date("2026-09-30T16:59:00Z"),
	trong: new Date("2026-09-30T17:00:00Z"),
	giuaKy: new Date("2026-11-15T03:00:00Z"),
	sauGiuaKy: new Date("2026-11-16T03:00:00Z"),
	truocGiuaKy: new Date("2026-11-14T03:00:00Z"),
} as const;

const NGUOI = ["a", "b", "c", "d", "e"] as const;
type Nguoi = (typeof NGUOI)[number];
type TheoNguoi<T> = { [k in Nguoi]: T };

export type SanChiSo = {
	id: {
		nguoi: TheoNguoi<string>;
		email: TheoNguoi<string>;
		boPhan: { B1: string; B2: string };
		phongBan: { P1: string; P2: string; P3: string };
		formKhongChu: string;
		thuVietHoa: string;
		cuaE: { "thoa-thuan-moi": string; "email-gui-ra": string };
		kr: string;
	};
	dieuKien: { [k in MaChiSo]: string[] };
	ghiDanhTheoBac: {
		"tai-khoan": string[];
		"khoa-hoc": string[];
		"hoat-dong": string[];
		"giao-dich-dau": string[];
	};
	don: () => Promise<void>;
};

export async function gieoSanChiSo(): Promise<SanChiSo> {
	const tao = {
		user: [] as string[],
		division: [] as string[],
		department: [] as string[],
		company: [] as string[],
		contact: [] as string[],
		deal: [] as string[],
		savedView: [] as string[],
		campaign: [] as string[],
		activity: [] as string[],
		touch: [] as string[],
		plan: [] as string[],
		step: [] as string[],
		enrollment: [] as string[],
		form: [] as string[],
		thread: [] as string[],
		message: [] as string[],
		cycle: [] as string[],
		objective: [] as string[],
		kr: [] as string[],
	};

	const nguoi = {} as TheoNguoi<string>;
	const email = {} as TheoNguoi<string>;
	for (const k of NGUOI) {
		const id = ma(`so-${k}`);
		await gieoThanhVien(id, "member");
		nguoi[k] = id;
		email[k] = `${id}@thu.test`;
		tao.user.push(id);
	}

	const boPhan = async (ten: string) => {
		const r = await db.division.create({
			data: { name: ma(ten), position: 0 },
		});
		tao.division.push(r.id);
		return r.id;
	};
	const B1 = await boPhan("B1");
	const B2 = await boPhan("B2");
	const phongBan = async (ten: string, divisionId: string) => {
		const r = await db.department.create({
			data: { name: ma(ten), position: 0, divisionId },
		});
		tao.department.push(r.id);
		return r.id;
	};
	const P1 = await phongBan("P1", B1);
	const P2 = await phongBan("P2", B1);
	const P3 = await phongBan("P3", B2);
	const phongCua = {
		a: P1,
		b: P1,
		c: P2,
		d: P3,
		e: null,
	} satisfies TheoNguoi<string | null>;
	for (const k of NGUOI) {
		const pb = phongCua[k];
		if (pb) {
			await db.orgPlacement.create({
				data: { userId: nguoi[k], primaryDepartmentId: pb },
			});
		}
	}

	const congTy = async (luuTru: boolean) => {
		const r = await db.company.create({
			data: {
				name: ma("cty"),
				archivedAt: luuTru ? MOC.giuaKy : null,
			},
		});
		tao.company.push(r.id);
		return r.id;
	};
	const cty = await congTy(false);
	const ctyLuu = await congTy(true);

	const caNhan = async (
		ten: string,
		ownerId: string | null,
		luuTru = false,
	) => {
		const r = await db.contact.create({
			data: {
				firstName: ma(ten),
				companyId: cty,
				ownerId,
				archivedAt: luuTru ? MOC.giuaKy : null,
			},
		});
		tao.contact.push(r.id);
		return r.id;
	};
	const ct = {} as TheoNguoi<string>;
	for (const k of NGUOI) ct[k] = await caNhan(`ct-${k}`, nguoi[k]);
	const ctKhongChu = await caNhan("ct-khong-chu", null);
	const ctLuu = await caNhan("ct-luu", nguoi.a, true);
	const ctPhu = await caNhan("ct-phu", nguoi.a);
	const ctPhu2 = await caNhan("ct-phu2", nguoi.a);

	const dieuKien = {} as { [k in MaChiSo]: string[] };

	const thoaThuan = async (v: {
		chu: Nguoi;
		stage: "CLOSED_WON" | "CLOSED_LOST" | "DEMO_BOOKED";
		closedAt: Date | null;
		createdAt: Date;
		luuTru?: boolean;
	}) => {
		const r = await db.deal.create({
			data: {
				name: ma("thoa-thuan"),
				companyId: cty,
				ownerId: nguoi[v.chu],
				stage: v.stage,
				closedAt: v.closedAt,
				createdAt: v.createdAt,
				archivedAt: v.luuTru ? MOC.giuaKy : null,
			},
		});
		tao.deal.push(r.id);
		return r.id;
	};
	const chot = (chu: Nguoi, closedAt: Date, them: { luuTru?: boolean } = {}) =>
		thoaThuan({
			chu,
			stage: "CLOSED_WON",
			closedAt,
			createdAt: MOC.truocKy,
			...them,
		});
	dieuKien["thoa-thuan-chot-duoc"] = [
		await chot("a", MOC.giuaKy),
		await chot("c", MOC.giuaKy),
		await chot("d", MOC.giuaKy),
		await chot("b", MOC.trong),
	];
	await chot("a", MOC.ngoai);
	await chot("a", MOC.giuaKy, { luuTru: true });
	await thoaThuan({
		chu: "a",
		stage: "CLOSED_LOST",
		closedAt: MOC.giuaKy,
		createdAt: MOC.truocKy,
	});

	const moi = (chu: Nguoi, createdAt: Date, them: { luuTru?: boolean } = {}) =>
		thoaThuan({
			chu,
			stage: "DEMO_BOOKED",
			closedAt: null,
			createdAt,
			...them,
		});
	const moiCuaE = await moi("e", MOC.giuaKy);
	dieuKien["thoa-thuan-moi"] = [
		await moi("a", MOC.giuaKy),
		await moi("c", MOC.giuaKy),
		await moi("d", MOC.giuaKy),
		await moi("b", MOC.trong),
		moiCuaE,
	];
	await moi("a", MOC.ngoai);
	await moi("a", MOC.giuaKy, { luuTru: true });

	const view = await db.savedView.create({
		data: {
			entity: "CONTACT",
			name: ma("view"),
			filters: {},
			ownerId: nguoi.a,
		},
	});
	tao.savedView.push(view.id);
	const chienDich = await db.campaign.create({
		data: {
			name: ma("chien-dich"),
			savedViewId: view.id,
			createdById: nguoi.a,
		},
	});
	tao.campaign.push(chienDich.id);
	const cuocGoi = async (
		ai: Nguoi,
		contactId: string,
		createdAt: Date,
		outcome: "MEETING" | "ANSWERED" = "MEETING",
	) => {
		const hd = await db.activity.create({
			data: { type: "CALL", contactId, createdById: nguoi[ai] },
		});
		tao.activity.push(hd.id);
		const r = await db.campaignTouch.create({
			data: {
				campaignId: chienDich.id,
				contactId,
				activityId: hd.id,
				outcome,
				createdById: nguoi[ai],
				createdAt,
			},
		});
		tao.touch.push(r.id);
		return r.id;
	};
	dieuKien["goi-hen-duoc"] = [
		await cuocGoi("a", ct.a, MOC.giuaKy),
		await cuocGoi("c", ct.c, MOC.giuaKy),
		await cuocGoi("d", ct.d, MOC.giuaKy),
		await cuocGoi("b", ct.b, MOC.trong),
		await cuocGoi("a", ctLuu, MOC.giuaKy),
	];
	await cuocGoi("a", ct.a, MOC.ngoai);
	await cuocGoi("a", ct.a, MOC.giuaKy, "ANSWERED");

	const keHoach = async (chu: Nguoi, companyId = cty) => {
		const r = await db.onboardingPlan.create({
			data: {
				companyId,
				startedAt: MOC.truocKy,
				targetDays: 30,
				ownerId: nguoi[chu],
			},
		});
		tao.plan.push(r.id);
		return r.id;
	};
	const kh = {
		a: await keHoach("a"),
		b: await keHoach("b"),
		c: await keHoach("c"),
		d: await keHoach("d"),
	};
	const khLuu = await keHoach("a", ctyLuu);
	let viTri = 0;
	const buoc = async (v: {
		planId: string;
		departmentId: string;
		ai: Nguoi;
		completedAt: Date;
		dueAt: Date;
	}) => {
		viTri += 1;
		const r = await db.onboardingStep.create({
			data: {
				planId: v.planId,
				label: ma("buoc"),
				departmentId: v.departmentId,
				assigneeId: nguoi[v.ai],
				completedAt: v.completedAt,
				dueAt: v.dueAt,
				position: viTri,
			},
		});
		tao.step.push(r.id);
		return r.id;
	};
	dieuKien["buoc-xong-dung-han"] = [
		await buoc({
			planId: kh.a,
			departmentId: P1,
			ai: "a",
			completedAt: MOC.giuaKy,
			dueAt: MOC.sauGiuaKy,
		}),
		await buoc({
			planId: kh.c,
			departmentId: P2,
			ai: "c",
			completedAt: MOC.giuaKy,
			dueAt: MOC.giuaKy,
		}),
		await buoc({
			planId: kh.d,
			departmentId: P3,
			ai: "d",
			completedAt: MOC.giuaKy,
			dueAt: MOC.sauGiuaKy,
		}),
		await buoc({
			planId: kh.b,
			departmentId: P1,
			ai: "b",
			completedAt: MOC.trong,
			dueAt: MOC.sauGiuaKy,
		}),
		await buoc({
			planId: khLuu,
			departmentId: P1,
			ai: "a",
			completedAt: MOC.giuaKy,
			dueAt: MOC.sauGiuaKy,
		}),
	];
	await buoc({
		planId: kh.a,
		departmentId: P1,
		ai: "a",
		completedAt: MOC.ngoai,
		dueAt: MOC.sauGiuaKy,
	});
	await buoc({
		planId: kh.a,
		departmentId: P1,
		ai: "a",
		completedAt: MOC.giuaKy,
		dueAt: MOC.truocGiuaKy,
	});

	const ghiDanh = async (v: {
		planId: string;
		contactId: string;
		accountAt?: Date;
		courseAt?: Date;
		activeAt?: Date;
		dealAt?: Date;
	}) => {
		const r = await db.onboardingEnrollment.create({
			data: { ...v, source: "thu" },
		});
		tao.enrollment.push(r.id);
		return r.id;
	};
	const g1 = await ghiDanh({
		planId: kh.a,
		contactId: ct.a,
		accountAt: MOC.giuaKy,
		courseAt: MOC.giuaKy,
		dealAt: MOC.giuaKy,
	});
	const g2 = await ghiDanh({
		planId: kh.d,
		contactId: ct.a,
		accountAt: MOC.giuaKy,
		courseAt: MOC.giuaKy,
		activeAt: MOC.giuaKy,
	});
	const g3 = await ghiDanh({
		planId: kh.b,
		contactId: ct.a,
		accountAt: MOC.trong,
		courseAt: MOC.trong,
	});
	const g4 = await ghiDanh({
		planId: kh.c,
		contactId: ct.a,
		courseAt: MOC.giuaKy,
		activeAt: MOC.giuaKy,
	});
	await ghiDanh({
		planId: kh.a,
		contactId: ctPhu,
		accountAt: MOC.ngoai,
		courseAt: MOC.ngoai,
		activeAt: MOC.ngoai,
		dealAt: MOC.ngoai,
	});
	await ghiDanh({
		planId: kh.a,
		contactId: ctLuu,
		accountAt: MOC.giuaKy,
		courseAt: MOC.giuaKy,
		activeAt: MOC.giuaKy,
		dealAt: MOC.giuaKy,
	});
	await ghiDanh({ planId: kh.a, contactId: ctPhu2 });
	const ghiDanhTheoBac = {
		"tai-khoan": [g1, g2, g3],
		"khoa-hoc": [g1, g2, g3, g4],
		"hoat-dong": [g2, g4],
		"giao-dich-dau": [g1],
	};
	dieuKien["ghi-danh-dat-bac"] = ghiDanhTheoBac["tai-khoan"];

	const form = async (contactId: string | null, filedAt: Date | null) => {
		const r = await db.formSubmission.create({
			data: {
				contactId,
				filedAt,
				host: "thu.test",
				path: "/lien-he",
				fields: {},
				dedupeKey: ma("form"),
			},
		});
		tao.form.push(r.id);
		return r.id;
	};
	const formKhongChu = await form(ctKhongChu, MOC.giuaKy);
	dieuKien["form-thanh-ca-nhan"] = [
		await form(ct.a, MOC.giuaKy),
		await form(ct.c, MOC.giuaKy),
		await form(ct.d, MOC.giuaKy),
		await form(ct.b, MOC.trong),
		formKhongChu,
	];
	await form(ct.a, MOC.ngoai);
	await form(ctLuu, MOC.giuaKy);
	await form(ct.a, null);

	const thu = async (
		fromEmail: string,
		sentAt: Date,
		contactId: string | null,
	) => {
		const goc = ma("rfc");
		const t = await db.emailThread.create({
			data: {
				rootMessageId: goc,
				subject: ma("chu-de"),
				contactId,
				firstMessageAt: sentAt,
				lastMessageAt: sentAt,
				messageCount: 1,
			},
		});
		tao.thread.push(t.id);
		const m = await db.emailMessage.create({
			data: {
				threadId: t.id,
				rfcMessageId: goc,
				direction: "OUTBOUND",
				fromEmail,
				recipients: [],
				subject: t.subject,
				sentAt,
			},
		});
		tao.message.push(m.id);
		return m.id;
	};
	const thuVietHoa = await thu(email.a.toUpperCase(), MOC.giuaKy, ct.a);
	const thuCuaE = await thu(email.e, MOC.giuaKy, null);
	dieuKien["email-gui-ra"] = [
		thuVietHoa,
		await thu(email.c, MOC.giuaKy, null),
		await thu(email.d, MOC.giuaKy, ct.d),
		await thu(email.b, MOC.trong, null),
		await thu(email.a, MOC.giuaKy, ctLuu),
		thuCuaE,
	];
	await thu(email.a, MOC.ngoai, null);
	await thu("khach@ngoai.test", MOC.giuaKy, ct.a);

	const chuKy = await db.okrCycle.create({
		data: {
			kind: "quy",
			name: ma("ky"),
			startsOn: KY.startsOn,
			endsOn: KY.endsOn,
			phase: "dang-chay",
		},
	});
	tao.cycle.push(chuKy.id);
	const mucTieu = await db.okrObjective.create({
		data: {
			cycleId: chuKy.id,
			level: "phong-ban",
			departmentId: P1,
			ownerUserId: nguoi.a,
			kind: "cam-ket",
			status: "cong-bo",
			title: ma("muc-tieu"),
		},
	});
	tao.objective.push(mucTieu.id);
	const kr = await db.okrKeyResult.create({
		data: {
			objectiveId: mucTieu.id,
			title: ma("kr"),
			kind: "tang-toi",
			ownerUserId: nguoi.a,
			startValue: 0,
			targetValue: 10,
			currentValue: 0,
			source: "crm",
		},
	});
	tao.kr.push(kr.id);
	await db.okrNguonKr.create({
		data: {
			keyResultId: kr.id,
			loai: "crm",
			chiSo: "thoa-thuan-chot-duoc",
			phamVi: { kieu: "phong-ban", id: P1 },
			taoBoiUserId: nguoi.a,
		},
	});

	const don = async () => {
		const trong = (ids: string[]) => ({ id: { in: ids } });
		await db.okrSoChup.deleteMany({ where: { keyResultId: { in: tao.kr } } });
		await db.okrNguonKr.deleteMany({ where: { keyResultId: { in: tao.kr } } });
		await db.okrKeyResult.deleteMany({ where: trong(tao.kr) });
		await db.okrObjective.deleteMany({ where: trong(tao.objective) });
		await db.okrCycle.deleteMany({ where: trong(tao.cycle) });
		await db.emailMessage.deleteMany({ where: trong(tao.message) });
		await db.emailThread.deleteMany({ where: trong(tao.thread) });
		await db.formSubmission.deleteMany({ where: trong(tao.form) });
		await db.onboardingEnrollment.deleteMany({ where: trong(tao.enrollment) });
		await db.onboardingStep.deleteMany({ where: trong(tao.step) });
		await db.onboardingPlan.deleteMany({ where: trong(tao.plan) });
		await db.campaignTouch.deleteMany({ where: trong(tao.touch) });
		await db.activity.deleteMany({ where: trong(tao.activity) });
		await db.campaign.deleteMany({ where: trong(tao.campaign) });
		await db.savedView.deleteMany({ where: trong(tao.savedView) });
		await db.deal.deleteMany({ where: trong(tao.deal) });
		await db.contact.deleteMany({ where: trong(tao.contact) });
		await db.company.deleteMany({ where: trong(tao.company) });
		await db.orgPlacement.deleteMany({ where: { userId: { in: tao.user } } });
		await db.department.deleteMany({ where: trong(tao.department) });
		await db.division.deleteMany({ where: trong(tao.division) });
		await db.member.deleteMany({ where: { userId: { in: tao.user } } });
		await db.user.deleteMany({ where: trong(tao.user) });
	};

	return {
		id: {
			nguoi,
			email,
			boPhan: { B1, B2 },
			phongBan: { P1, P2, P3 },
			formKhongChu,
			thuVietHoa,
			cuaE: { "thoa-thuan-moi": moiCuaE, "email-gui-ra": thuCuaE },
			kr: kr.id,
		},
		dieuKien,
		ghiDanhTheoBac,
		don,
	};
}
