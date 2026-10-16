"use client";

import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "./client";

type Settle = "all" | "record";

type Options = {
	settle?: Settle;
};

type RecordKind = "company" | "contact" | "deal";

const ENTITY_FOR = {
	company: "COMPANY",
	contact: "CONTACT",
	deal: "DEAL",
} as const satisfies Record<RecordKind, string>;

type RemovedKind = RecordKind | "viec";

type RemovedRecord = { kind: RemovedKind; id: string };

type RemovedRecords = { kind: RemovedKind; ids: string[] };

export type CrmCache = {
	company(id?: string, options?: Options): Promise<void>;
	contact(id?: string, options?: Options): Promise<void>;
	deal(id?: string, options?: Options): Promise<void>;
	plan(id?: string, options?: Options): Promise<void>;
	workTransferred(options?: Options): Promise<void>;
	okr(id?: string, options?: Options): Promise<void>;
	viec(options?: Options): Promise<void>;
	hoiY(options?: Options): Promise<void>;
	tomTat(options?: Options): Promise<void>;
	taiLieu(slug?: string, options?: Options): Promise<void>;
	campaign(id?: string, options?: Options): Promise<void>;
	campaignList(options?: Options): Promise<void>;
	fields(entity?: RecordKind, options?: Options): Promise<void>;
	fieldCoverage(id?: string, options?: Options): Promise<void>;
	savedViews(entity?: RecordKind, options?: Options): Promise<void>;
	removed(record: RemovedRecord): Promise<void>;
	removedMany(records: RemovedRecords): Promise<void>;
	conversationRemoved(id: string): Promise<void>;
	activity(options?: Options): Promise<void>;
	google(options?: Options): Promise<void>;
	microsoft(options?: Options): Promise<void>;
	settings(options?: Options): Promise<void>;
	currency(options?: Options): Promise<void>;
	giaiDoan(options?: Options): Promise<void>;
	workspace(options?: Options): Promise<void>;
	slack(options?: Options): Promise<void>;
	zalo(options?: Options): Promise<void>;
	sso(options?: Options): Promise<void>;
	apiKeys(options?: Options): Promise<void>;
	tracking(options?: Options): Promise<void>;
	tinHieu(options?: Options): Promise<void>;
	thongBao(options?: Options): Promise<void>;
	everything(): Promise<void>;
};

export function useCrmCache(): CrmCache {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const run = (
		record: QueryKey[],
		rest: QueryKey[],
		{ settle = "all" }: Options = {},
	): Promise<void> => {
		const awaited = settle === "all" ? [...record, ...rest] : record;
		const behind = settle === "all" ? [] : rest;

		for (const queryKey of behind) {
			void queryClient.invalidateQueries({ queryKey });
		}

		return Promise.all(
			awaited.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
		).then(() => undefined);
	};

	const activityKeys = () => [
		trpc.activities.timeline.pathKey(),
		trpc.activities.timelineCounts.queryKey(),
	];

	const listKeys = () => [
		trpc.companies.list.queryKey(),
		trpc.contacts.list.queryKey(),
		trpc.deals.list.queryKey(),
		trpc.deals.board.queryKey(),
		trpc.search.quick.queryKey(),
	];

	const removeRecords = (kind: RemovedKind, ids: string[]): Promise<void> => {
		const byId = {
			company: [trpc.companies.byId],
			contact: [trpc.contacts.byId],
			deal: [trpc.deals.byId],
			viec: [trpc.viec.get, trpc.viec.lichSu],
		}[kind];
		const goneKeys = ids.flatMap((id) =>
			byId.map((record) => record.queryKey({ id })),
		);
		const gone = new Set(goneKeys.map((key) => JSON.stringify(key)));

		for (const record of [
			trpc.companies.byId,
			trpc.contacts.byId,
			trpc.deals.byId,
			trpc.viec.get,
			trpc.viec.lichSu,
		]) {
			void queryClient.invalidateQueries({
				queryKey: record.queryKey(),
				predicate: (query) => !gone.has(JSON.stringify(query.queryKey)),
			});
		}

		for (const queryKey of goneKeys) {
			void queryClient.invalidateQueries({
				queryKey,
				exact: true,
				refetchType: "none",
			});
		}

		return run(
			[
				...listKeys(),
				...activityKeys(),
				trpc.viec.cuaToi.queryKey(),
				trpc.viec.cuaBanGhi.queryKey(),
				trpc.viec.bang.queryKey(),
				trpc.viec.con.queryKey(),
				trpc.dashboard.summary.queryKey(),
			],
			[],
		);
	};

	const RECORD_BY_ID = {
		company: () => trpc.companies.byId.queryKey(),
		contact: () => trpc.contacts.byId.queryKey(),
		deal: () => trpc.deals.byId.queryKey(),
	} as const;

	const RECORD_LIST = {
		company: () => trpc.companies.list.queryKey(),
		contact: () => trpc.contacts.list.queryKey(),
		deal: () => trpc.deals.list.queryKey(),
	} as const;

	return {
		fields: (entity, options) =>
			run(
				[
					trpc.fields.list.queryKey(),
					entity
						? trpc.fields.filters.queryKey({ entity: ENTITY_FOR[entity] })
						: trpc.fields.filters.queryKey(),
				],
				entity
					? [RECORD_BY_ID[entity](), RECORD_LIST[entity]()]
					: [...Object.values(RECORD_BY_ID).map((key) => key()), ...listKeys()],
				options,
			),

		fieldCoverage: (id, options) =>
			run(
				[
					id
						? trpc.fields.coverage.queryKey({ id })
						: trpc.fields.coverage.queryKey(),
				],
				[],
				options,
			),

		savedViews: (entity, options) =>
			run(
				[
					entity
						? trpc.savedViews.list.queryKey({
								entity: ENTITY_FOR[entity],
							})
						: trpc.savedViews.list.queryKey(),
				],
				[],
				options,
			),

		company: (id, options) =>
			run(
				[
					id
						? trpc.companies.byId.queryKey({ id })
						: trpc.companies.byId.queryKey(),
				],
				[
					...listKeys(),
					...activityKeys(),
					trpc.contacts.byId.queryKey(),
					trpc.deals.byId.queryKey(),
					trpc.dashboard.summary.queryKey(),
				],
				options,
			),

		contact: (id, options) =>
			run(
				[
					id
						? trpc.contacts.byId.queryKey({ id })
						: trpc.contacts.byId.queryKey(),
				],
				[
					...listKeys(),
					...activityKeys(),
					trpc.companies.byId.queryKey(),
					trpc.deals.byId.queryKey(),
					trpc.deals.contactOptions.queryKey(),
				],
				options,
			),

		deal: (id, options) =>
			run(
				[
					id ? trpc.deals.byId.queryKey({ id }) : trpc.deals.byId.queryKey(),
					id
						? trpc.onboarding.goiYCuaDeal.queryKey({ dealId: id })
						: trpc.onboarding.goiYCuaDeal.queryKey(),
				],
				[
					...listKeys(),
					trpc.deals.contactOptions.queryKey(),
					trpc.companies.byId.queryKey(),
					trpc.contacts.byId.queryKey(),
					...activityKeys(),
					trpc.dashboard.summary.queryKey(),
					trpc.currency.settings.queryKey(),
					trpc.giaiDoan.list.queryKey(),
				],
				options,
			),

		plan: (id, options) =>
			run(
				[
					id
						? trpc.onboarding.planById.queryKey({ id })
						: trpc.onboarding.planById.queryKey(),
				],
				[
					trpc.onboarding.listSteps.queryKey(),
					trpc.onboarding.listEnrollments.queryKey(),
					trpc.onboarding.manDanhMuc.queryKey(),
					trpc.onboarding.bangCot.queryKey(),
					...activityKeys(),
					trpc.companies.byId.queryKey(),
				],
				options,
			),

		workTransferred: (options) =>
			run(
				[
					trpc.onboarding.manDanhMuc.queryKey(),
					trpc.onboarding.bangCot.queryKey(),
					trpc.onboarding.transferPreview.queryKey(),
				],
				[],
				options,
			),

		okr: (id, options) =>
			run(
				[
					id
						? trpc.okr.objective.queryKey({ id })
						: trpc.okr.objective.queryKey(),
					id
						? trpc.okr.comments.queryKey({ objectiveId: id })
						: trpc.okr.comments.queryKey(),
				],
				[
					trpc.okr.byUnit.queryKey(),
					trpc.okr.capNhatTuan.queryKey(),
					trpc.okr.viecCuaToi.queryKey(),
					trpc.okr.mine.queryKey(),
					trpc.okr.alignmentTree.queryKey(),
					trpc.okr.countByUnit.queryKey(),
					trpc.okr.alignmentTargets.queryKey(),
					trpc.okr.cycles.queryKey(),
					trpc.okr.program.queryKey(),
					trpc.okr.aiChiTieu.queryKey(),
					trpc.okr.danhSach.queryKey(),
					trpc.okr.cayCanChinh.queryKey(),
					trpc.okr.soDoDonVi.queryKey(),
					trpc.okr.quanhMucTieu.queryKey(),
					trpc.okr.toanCanh.queryKey(),
					trpc.okr.sucKhoe.queryKey(),
					trpc.okr.hopTuan.queryKey(),
					trpc.okr.dienBien.queryKey(),
					trpc.okr.khoiCuaToi.queryKey(),
					trpc.okr.transferPreview.queryKey(),
					trpc.okr.lichSuSo.queryKey(),
					trpc.okr.banGhiChiSo.queryKey(),
					trpc.okr.xemTruocChiSo.queryKey(),
					trpc.okr.bangCham.queryKey(),
					trpc.okr.xuatKy.queryKey(),
					trpc.okr.troLySanSang.queryKey(),
					trpc.okr.troLyDanhSach.queryKey(),
					trpc.okr.xuHuongKr.queryKey(),
					trpc.okr.troLySoDo.queryKey(),
					trpc.okr.troLyAn.queryKey(),
					trpc.okr.troLyTomTat.queryKey(),
					trpc.okr.troLyTomTatQuanTri.queryKey(),
					trpc.okr.canhKr.queryKey(),
					trpc.okr.mau.queryKey(),
					trpc.okr.hoiY.queryKey(),
					trpc.okr.hoiYNhan.queryKey(),
					trpc.okr.hoiYDoPhu.queryKey(),
					trpc.okr.moCoi.queryKey(),
					trpc.okr.soanSanSang.queryKey(),
					trpc.okr.soanDanhSach.queryKey(),
					trpc.okr.soanDanhSachCuoc.queryKey(),
					trpc.okr.soanSoDo.queryKey(),
					trpc.okr.soanAn.queryKey(),
				],
				options,
			),

		viec: (options) =>
			run(
				[
					trpc.viec.cuaToi.queryKey(),
					trpc.viec.cuaBanGhi.queryKey(),
					trpc.viec.get.queryKey(),
					trpc.viec.lichSu.queryKey(),
					trpc.viec.bang.queryKey(),
					trpc.viec.con.queryKey(),
				],
				[trpc.dashboard.summary.queryKey()],
				options,
			),

		tomTat: (options) =>
			run(
				[trpc.okr.troLyTomTat.queryKey()],
				[trpc.okr.troLyTomTatQuanTri.queryKey()],
				options,
			),

		hoiY: (options) =>
			run(
				[trpc.okr.hoiY.queryKey(), trpc.okr.hoiYNhan.queryKey()],
				[trpc.okr.hoiYDoPhu.queryKey(), trpc.okr.viecCuaToi.queryKey()],
				options,
			),

		taiLieu: (slug, options) =>
			run(
				[
					slug
						? trpc.taiLieu.get.queryKey({ slug })
						: trpc.taiLieu.get.queryKey(),
				],
				[
					trpc.taiLieu.list.queryKey(),
					trpc.taiLieu.proposals.queryKey(),
					trpc.taiLieu.proposal.queryKey(),
				],
				options,
			),

		campaign: (id, options) =>
			run(
				[
					id
						? trpc.campaigns.byId.queryKey({ id })
						: trpc.campaigns.byId.queryKey(),
				],
				[trpc.campaigns.list.queryKey(), trpc.campaigns.members.pathKey()],
				options,
			),

		campaignList: (options) =>
			run(
				[trpc.campaigns.list.queryKey()],
				[trpc.campaigns.byId.queryKey()],
				options,
			),

		removed: ({ kind, id }) => removeRecords(kind, [id]),

		removedMany: ({ kind, ids }) => removeRecords(kind, ids),

		conversationRemoved: (id) => {
			for (const queryKey of [
				trpc.conversations.builderById.queryKey({ id }),
				trpc.conversations.events.queryKey({ id }),
				trpc.conversations.shareStatus.queryKey({ id }),
			]) {
				void queryClient.invalidateQueries({
					queryKey,
					exact: true,
					refetchType: "none",
				});
			}

			return run([trpc.conversations.builderList.pathKey()], []);
		},

		activity: (options) =>
			run(
				activityKeys(),
				[
					...listKeys(),
					trpc.companies.byId.queryKey(),
					trpc.contacts.byId.queryKey(),
					trpc.deals.byId.queryKey(),
					trpc.dashboard.summary.queryKey(),
				],
				options,
			),

		google: (options) =>
			run(
				[trpc.google.status.queryKey()],
				[
					...activityKeys(),
					...listKeys(),
					trpc.companies.byId.queryKey(),
					trpc.contacts.byId.queryKey(),
					trpc.dashboard.summary.queryKey(),
				],
				options,
			),

		microsoft: (options) =>
			run(
				[trpc.microsoft.status.queryKey()],
				[
					...activityKeys(),
					...listKeys(),
					trpc.companies.byId.queryKey(),
					trpc.contacts.byId.queryKey(),
					trpc.dashboard.summary.queryKey(),
				],
				options,
			),

		settings: (options) =>
			run(
				[
					trpc.settings.agentModel.queryKey(),
					trpc.settings.researchKey.queryKey(),
					trpc.settings.archiveRetention.queryKey(),
				],
				[],
				options,
			),

		currency: (options) =>
			run(
				[trpc.currency.settings.queryKey()],
				[
					...listKeys(),
					trpc.deals.byId.queryKey(),
					trpc.companies.byId.queryKey(),
					trpc.dashboard.summary.queryKey(),
				],
				options,
			),

		giaiDoan: (options) =>
			run(
				[trpc.giaiDoan.list.queryKey(), trpc.giaiDoan.archived.queryKey()],
				[
					...listKeys(),
					trpc.deals.byId.queryKey(),
					trpc.companies.byId.queryKey(),
					trpc.contacts.byId.queryKey(),
					trpc.dashboard.summary.queryKey(),
					...activityKeys(),
				],
				options,
			),

		workspace: (options) =>
			run(
				[
					trpc.workspace.get.queryKey(),
					trpc.workspace.members.queryKey(),
					trpc.workspace.allowances.queryKey(),
					trpc.workspace.staffDomains.queryKey(),
				],
				[],
				options,
			),

		slack: (options) =>
			run(
				[trpc.slack.status.queryKey(), trpc.slack.matches.queryKey()],
				[],
				options,
			),

		zalo: (options) =>
			run(
				[trpc.zalo.cuaToi.queryKey(), trpc.zalo.xuong.queryKey()],
				[],
				options,
			),

		sso: (options) =>
			run(
				[trpc.sso.list.pathKey()],
				[trpc.sso.settings.queryKey(), trpc.sso.signInOptions.queryKey()],
				options,
			),

		apiKeys: (options) => run([trpc.apiKeys.list.pathKey()], [], options),

		tracking: (options) =>
			run(
				[trpc.tracking.settings.queryKey()],
				[trpc.tracking.sources.queryKey()],
				options,
			),

		tinHieu: (options) =>
			run(
				[trpc.tinHieu.cuaToi.queryKey(), trpc.tinHieu.tatCa.queryKey()],
				[],
				options,
			),
		thongBao: (options) =>
			run(
				[trpc.thongBao.chuong.queryKey()],
				[trpc.thongBao.danhSach.pathKey()],
				options,
			),

		everything: () => queryClient.invalidateQueries(),
	};
}
