"use client";

import Add from "@carbon/icons-react/es/Add";
import CalendarIcon from "@carbon/icons-react/es/Calendar";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Calendar } from "@crm/ui/components/calendar";
import { Checkbox } from "@crm/ui/components/checkbox";
import { Combobox } from "@crm/ui/components/combobox";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { FieldError } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { formatDay, fromDay, toDay } from "@crm/ui/lib/format";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { InlineSelectField } from "@/components/crm/inline-field";
import {
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetSection,
} from "@/components/detail-sheet";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { quaHan } from "@/lib/qua-han";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { dien } from "./plan-copy";
import type { PlanDetail } from "./plan-sheet";

type Buoc = RouterOutputs["onboarding"]["listSteps"]["rows"][number];

const BO_GIAO = "__bo-giao__";

type NhomBuoc = { departmentId: string; ten: string; buoc: Buoc[] };

function gomTheoBoPhan(hang: Buoc[]): NhomBuoc[] {
	return [...Map.groupBy(hang, (buoc) => buoc.departmentId)].map(
		([departmentId, buoc]) => ({
			departmentId,
			ten: buoc[0]?.departmentName ?? departmentId,
			buoc,
		}),
	);
}

function hoanVi(ids: string[], i: number, j: number): string[] {
	const moi = [...ids];
	const a = moi[i];
	const b = moi[j];
	if (a === undefined || b === undefined) return ids;
	moi[i] = b;
	moi[j] = a;
	return moi;
}

function useGhiBuoc(planId: string) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const xong = {
		onSuccess: () => {
			void cache.plan(planId);
		},
		onError: (loi: { message: string }) => toast.error(loi.message),
	};
	return {
		xong: useMutation(trpc.onboarding.setStepDone.mutationOptions(xong)),
		giao: useMutation(trpc.onboarding.assignStep.mutationOptions(xong)),
		han: useMutation(trpc.onboarding.rescheduleStep.mutationOptions(xong)),
		sap: useMutation(trpc.onboarding.reorderSteps.mutationOptions(xong)),
		bo: useMutation(trpc.onboarding.removeStep.mutationOptions(xong)),
		them: useMutation(
			trpc.onboarding.addStep.mutationOptions({ onSuccess: xong.onSuccess }),
		),
	};
}

type Ghi = ReturnType<typeof useGhiBuoc>;

type LuaChonNguoi = { value: string; label: string };

function giuNguoiDangGiu(
	nguoi: LuaChonNguoi[],
	dangGiu: { id: string; name: string } | null,
): LuaChonNguoi[] {
	if (!dangGiu || nguoi.some((n) => n.value === dangGiu.id)) return nguoi;
	return [...nguoi, { value: dangGiu.id, label: dangGiu.name }];
}

function DongBuoc({
	buoc,
	ids,
	ghi,
	khoa,
	nguoi,
}: {
	buoc: Buoc;
	ids: string[];
	ghi: Ghi;
	khoa: boolean;
	nguoi: { value: string; label: string }[];
}) {
	const locale = useLocale();
	const m = onboardingMessages(locale).sheet;
	const [moLich, setMoLich] = useState(false);
	const [hoiBo, setHoiBo] = useState(false);
	const xong = buoc.completedAt !== null;
	const han = new Date(buoc.dueAt);
	const tre = quaHan(
		han,
		buoc.completedAt ? new Date(buoc.completedAt) : null,
		new Date(),
	);
	const viTri = ids.indexOf(buoc.id);
	const dangGhi = ghi.xong.isPending || ghi.giao.isPending || ghi.han.isPending;

	return (
		<li className="flex items-center gap-2 py-1.5" data-buoc={buoc.id}>
			<Checkbox
				aria-label={dien(xong ? m.markNotDone : m.markDone, {
					nhan: buoc.label,
				})}
				checked={xong}
				disabled={khoa || dangGhi}
				onCheckedChange={(chon) =>
					ghi.xong.mutate({ stepId: buoc.id, done: chon === true })
				}
			/>
			<span className="flex min-w-0 flex-1 items-center gap-2">
				<span
					className={
						xong
							? "min-w-0 truncate text-muted-foreground text-sm line-through"
							: "min-w-0 truncate font-medium text-sm"
					}
					translate="no"
				>
					{buoc.label}
				</span>
				{tre ? <Badge variant="outline">{m.overdue}</Badge> : null}
			</span>
			<Combobox
				aria-label={dien(m.assignTo, { nhan: buoc.label })}
				disabled={khoa || dangGhi}
				empty={m.nobody}
				onValueChange={(chon) =>
					ghi.giao.mutate({
						stepId: buoc.id,
						assigneeId: chon === BO_GIAO ? null : chon,
					})
				}
				options={
					buoc.assigneeId === null
						? nguoi
						: [
								{ value: BO_GIAO, label: m.unassign },
								...giuNguoiDangGiu(nguoi, buoc.assignee),
							]
				}
				placeholder={m.unassigned}
				searchPlaceholder={m.searchPeople}
				size="sm"
				value={buoc.assigneeId ?? ""}
			/>
			<Popover onOpenChange={setMoLich} open={moLich}>
				<PopoverTrigger asChild>
					<Button
						aria-label={dien(m.dueFor, { nhan: buoc.label })}
						disabled={khoa || dangGhi}
						size="sm"
						variant="ghost"
					>
						<Icon data-icon="inline-start" icon={CalendarIcon} />
						<span
							className={
								tre
									? "font-medium tabular-nums"
									: "text-muted-foreground tabular-nums"
							}
						>
							{formatDay(toDay(han), locale)}
						</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent align="end" size="fit">
					<Calendar
						mode="single"
						onSelect={(chon) => {
							if (!chon) return;
							setMoLich(false);
							ghi.han.mutate({ stepId: buoc.id, dueAt: toDay(chon) });
						}}
						selected={fromDay(toDay(han))}
					/>
				</PopoverContent>
			</Popover>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						aria-label={dien(m.rowMenu, { nhan: buoc.label })}
						disabled={khoa}
						size="icon-sm"
						variant="ghost"
					>
						<Icon icon={OverflowMenuHorizontal} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						disabled={viTri <= 0}
						onSelect={() =>
							ghi.sap.mutate({
								planId: buoc.planId,
								stepIds: hoanVi(ids, viTri, viTri - 1),
							})
						}
					>
						{m.up}
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={viTri < 0 || viTri >= ids.length - 1}
						onSelect={() =>
							ghi.sap.mutate({
								planId: buoc.planId,
								stepIds: hoanVi(ids, viTri, viTri + 1),
							})
						}
					>
						{m.down}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onSelect={() => setHoiBo(true)}
						variant="destructive"
					>
						{m.removeStep}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<ConfirmDialog
				nut={m.confirmRemoveStep.action}
				onConfirm={() => {
					if (ghi.bo.isPending) return;
					ghi.bo.mutate(
						{ stepId: buoc.id },
						{ onSettled: () => setHoiBo(false) },
					);
				}}
				onOpenChange={(mo) => {
					if (!mo && !ghi.bo.isPending) setHoiBo(false);
				}}
				open={hoiBo}
				pending={ghi.bo.isPending}
				than={m.confirmRemoveStep.body}
				thoi={m.confirmRemoveStep.cancel}
				tieuDe={dien(m.confirmRemoveStep.title, { nhan: buoc.label })}
			/>
		</li>
	);
}

type BoPhanChon = { id: string; name: string };

function ThemBuoc({
	planId,
	departmentId,
	boPhan = [],
	nhan,
	ghi,
}: {
	planId: string;
	departmentId?: string;
	boPhan?: BoPhanChon[];
	nhan?: string;
	ghi: Ghi;
}) {
	const m = onboardingMessages(useLocale()).sheet;
	const [mo, setMo] = useState(false);
	const [ten, setTen] = useState("");
	const [han, setHan] = useState(toDay(new Date()));
	const [chon, setChon] = useState(departmentId ?? "");
	const [loi, setLoi] = useState<string | null>(null);
	const chonBoPhan = departmentId === undefined;
	const khoaLuu = ghi.them.isPending || ten.trim() === "" || chon === "";

	if (!mo) {
		return (
			<Button
				className="self-start"
				onClick={() => setMo(true)}
				size="sm"
				variant="ghost"
			>
				<Icon data-icon="inline-start" icon={Add} />
				{nhan ?? m.addStep}
			</Button>
		);
	}

	return (
		<form
			className="flex flex-col gap-2"
			data-them-buoc=""
			onSubmit={(e) => {
				e.preventDefault();
				if (khoaLuu) return;
				setLoi(null);
				ghi.them.mutate(
					{ planId, departmentId: chon, label: ten.trim(), dueAt: han },
					{
						onSuccess: () => {
							setTen("");
							setChon(departmentId ?? "");
							setMo(false);
						},
						onError: (e) => setLoi(e.message),
					},
				);
			}}
		>
			<div className="flex flex-wrap items-center gap-2">
				{chonBoPhan ? (
					<Select onValueChange={setChon} value={chon}>
						<SelectTrigger aria-label={m.pickDepartment} autoFocus>
							<SelectValue placeholder={m.pickDepartment} />
						</SelectTrigger>
						<SelectContent>
							{boPhan.map((b) => (
								<SelectItem key={b.id} value={b.id}>
									<span translate="no">{b.name}</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				) : null}
				<Input
					aria-label={m.newStepLabel}
					autoFocus={!chonBoPhan}
					onChange={(e) => setTen(e.target.value)}
					placeholder={m.newStepLabel}
					value={ten}
				/>
				<Input
					aria-label={m.newStepDue}
					className="w-40"
					onChange={(e) => setHan(e.target.value)}
					type="date"
					value={han}
				/>
				<Button disabled={khoaLuu} size="sm" type="submit">
					{m.save}
				</Button>
				<Button
					onClick={() => {
						setLoi(null);
						setMo(false);
					}}
					size="sm"
					type="button"
					variant="ghost"
				>
					{m.cancel}
				</Button>
			</div>
			{loi ? <FieldError>{loi}</FieldError> : null}
		</form>
	);
}

export function PlanSteps({ plan }: { plan: PlanDetail }) {
	const locale = useLocale();
	const m = onboardingMessages(locale).sheet;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const ghi = useGhiBuoc(plan.id);
	const buoc = useQuery(
		trpc.onboarding.listSteps.queryOptions({ planId: plan.id }),
	);
	const users = useQuery(trpc.onboarding.nguoiNhanViec.queryOptions());
	const boPhan = useQuery(
		trpc.onboarding.listDepartments.queryOptions({ archived: false }),
	);
	const doiCam = useMutation(
		trpc.onboarding.setPlanOwner.mutationOptions({
			onSuccess: () => {
				void cache.plan(plan.id);
			},
			onError: (loi) => toast.error(loi.message),
		}),
	);

	const khoa = plan.closedAt !== null;
	const hang = buoc.data?.rows ?? [];
	const ids = hang.map((b) => b.id);
	const nguoi = (users.data ?? []).map((u) => ({ value: u.id, label: u.name }));
	const tatCaBoPhan = (boPhan.data ?? []).map((b) => ({
		id: b.id,
		name: b.name,
	}));
	const coBuoc = new Set(hang.map((b) => b.departmentId));
	const boPhanKhac = tatCaBoPhan.filter((b) => !coBuoc.has(b.id));

	return (
		<DetailSheetBody>
			<DetailSheetSection title={m.details}>
				<DetailSheetProperties>
					<DetailSheetProperty label={m.fields.template}>
						{plan.templateName ?? m.noTemplate}
					</DetailSheetProperty>
					<DetailSheetProperty label={m.fields.started}>
						{formatDay(toDay(new Date(plan.startedAt)), locale)}
					</DetailSheetProperty>
					<DetailSheetProperty label={m.fields.target}>
						{dien(m.days, { n: plan.targetDays })}
					</DetailSheetProperty>
					{khoa ? (
						<DetailSheetProperty label={m.fields.owner}>
							<span translate="no">{plan.owner.name}</span>
						</DetailSheetProperty>
					) : (
						<InlineSelectField
							label={m.fields.owner}
							onSave={(ownerId) => doiCam.mutate({ planId: plan.id, ownerId })}
							options={giuNguoiDangGiu(nguoi, plan.owner)}
							saving={doiCam.isPending}
							value={plan.ownerId}
						/>
					)}
				</DetailSheetProperties>
			</DetailSheetSection>

			{khoa ? (
				<p className="px-5 pt-3 text-muted-foreground text-xs">
					{m.closedHint}
				</p>
			) : null}

			{buoc.isSuccess && hang.length === 0 ? (
				<DetailSheetEmpty
					action={
						khoa ? undefined : (
							<ThemBuoc boPhan={tatCaBoPhan} ghi={ghi} planId={plan.id} />
						)
					}
					description={m.noSteps.body}
					icon={CalendarIcon}
					title={m.noSteps.title}
				/>
			) : (
				gomTheoBoPhan(hang).map((nhom) => (
					<DetailSheetSection
						key={nhom.departmentId}
						title={dien(m.groupTitle, {
							boPhan: nhom.ten,
							xong: nhom.buoc.filter((b) => b.completedAt !== null).length,
							tong: nhom.buoc.length,
						})}
					>
						<ul className="flex flex-col">
							{nhom.buoc.map((b) => (
								<DongBuoc
									buoc={b}
									ghi={ghi}
									ids={ids}
									key={b.id}
									khoa={khoa}
									nguoi={nguoi}
								/>
							))}
						</ul>
						{khoa ? null : (
							<ThemBuoc
								departmentId={nhom.departmentId}
								ghi={ghi}
								planId={plan.id}
							/>
						)}
					</DetailSheetSection>
				))
			)}
			{!khoa && hang.length > 0 && boPhanKhac.length > 0 ? (
				<DetailSheetSection>
					<ThemBuoc
						boPhan={boPhanKhac}
						ghi={ghi}
						nhan={m.addStepOtherDepartment}
						planId={plan.id}
					/>
				</DetailSheetSection>
			) : null}
		</DetailSheetBody>
	);
}
