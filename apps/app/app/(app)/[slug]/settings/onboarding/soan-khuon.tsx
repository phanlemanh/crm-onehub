"use client";

import { Button } from "@crm/ui/components/button";
import {
	Field,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { KhungTao } from "@/components/onboarding/khung-tao";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useTRPC } from "@/lib/trpc/client";

export type BoPhanChon = { id: string; name: string };

type BuocNhap = {
	khoa: number;
	label: string;
	departmentId: string;
	ngay: string;
};

const SO_NGAY = /^\d{1,3}$/;

function buocTrong(khoa: number): BuocNhap {
	return { khoa, label: "", departmentId: "", ngay: "0" };
}

function buocHopLe(b: BuocNhap): boolean {
	return b.label.trim() !== "" && b.departmentId !== "" && SO_NGAY.test(b.ngay);
}

export function SoanKhuon({ boPhan }: { boPhan: BoPhanChon[] }) {
	const m = onboardingMessages(useLocale());
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const maTen = useId();
	const maLoai = useId();

	const [dangMo, setDangMo] = useState(false);
	const [ten, setTen] = useState("");
	const [loai, setLoai] = useState("");
	const [buoc, setBuoc] = useState<BuocNhap[]>([buocTrong(0)]);
	const [khoaKe, setKhoaKe] = useState(1);
	const [loi, setLoi] = useState<string | null>(null);

	const tao = useMutation(trpc.onboarding.createTemplate.mutationOptions());
	const coBoPhan = boPhan.length > 0;

	const doiBuoc = (khoa: number, thay: Partial<BuocNhap>) =>
		setBuoc((ds) => ds.map((b) => (b.khoa === khoa ? { ...b, ...thay } : b)));

	return (
		<KhungTao
			nhanNut={m.settings.newTemplate}
			tieuDe={m.tao.khuon.title}
			moTa={coBoPhan ? undefined : m.tao.khuon.noDepartment}
			dangMo={dangMo}
			doiMo={setDangMo}
			sanSang={coBoPhan && ten.trim() !== "" && buoc.every(buocHopLe)}
			dangLuu={tao.isPending}
			loi={loi}
			nhanLuu={m.tao.save}
			nhanHuy={m.tao.cancel}
			onLuu={() => {
				setLoi(null);
				tao.mutate(
					{
						name: ten.trim(),
						partnerType: loai.trim() === "" ? null : loai.trim(),
						steps: buoc.map((b, viTri) => ({
							label: b.label.trim(),
							departmentId: b.departmentId,
							position: viTri,
							offsetDays: Number(b.ngay),
						})),
					},
					{
						onSuccess: async () => {
							await queryClient.invalidateQueries({
								queryKey: trpc.onboarding.listTemplates.queryKey(),
							});
							setTen("");
							setLoai("");
							setBuoc([buocTrong(khoaKe)]);
							setKhoaKe((k) => k + 1);
							setDangMo(false);
						},
						onError: (error) => setLoi(error.message),
					},
				);
			}}
		>
			{coBoPhan ? (
				<>
					<Field>
						<FieldLabel htmlFor={maTen}>{m.tao.khuon.name}</FieldLabel>
						<Input
							id={maTen}
							value={ten}
							onChange={(e) => setTen(e.target.value)}
							autoComplete="off"
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor={maLoai}>{m.tao.khuon.partnerType}</FieldLabel>
						<Input
							id={maLoai}
							value={loai}
							onChange={(e) => setLoai(e.target.value)}
							autoComplete="off"
						/>
					</Field>
					<FieldSet>
						<FieldLegend>{m.tao.khuon.steps}</FieldLegend>
						{buoc.map((b, viTri) => (
							<div
								key={b.khoa}
								data-buoc={viTri}
								className="flex flex-col gap-2 rounded-md border p-2"
							>
								<Input
									aria-label={`${m.tao.khuon.stepLabel} ${viTri + 1}`}
									value={b.label}
									onChange={(e) => doiBuoc(b.khoa, { label: e.target.value })}
									autoComplete="off"
								/>
								<Select
									value={b.departmentId}
									onValueChange={(v) => doiBuoc(b.khoa, { departmentId: v })}
								>
									<SelectTrigger
										aria-label={`${m.tao.khuon.stepDepartment} ${viTri + 1}`}
									>
										<SelectValue placeholder={m.tao.khuon.stepDepartment} />
									</SelectTrigger>
									<SelectContent>
										{boPhan.map((bp) => (
											<SelectItem key={bp.id} value={bp.id}>
												{bp.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<div className="flex items-center gap-2">
									<Input
										aria-label={`${m.tao.khuon.stepDay} ${viTri + 1}`}
										inputMode="numeric"
										value={b.ngay}
										onChange={(e) => doiBuoc(b.khoa, { ngay: e.target.value })}
									/>
									{buoc.length > 1 ? (
										<Button
											type="button"
											variant="ghost"
											onClick={() =>
												setBuoc((ds) => ds.filter((x) => x.khoa !== b.khoa))
											}
										>
											{m.tao.khuon.removeStep}
										</Button>
									) : null}
								</div>
							</div>
						))}
						<div>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setBuoc((ds) => [...ds, buocTrong(khoaKe)]);
									setKhoaKe((k) => k + 1);
								}}
							>
								{m.tao.khuon.addStep}
							</Button>
						</div>
					</FieldSet>
				</>
			) : null}
		</KhungTao>
	);
}
