"use client";

import { Field, FieldLabel } from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { KhungTao } from "@/components/onboarding/khung-tao";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useTRPC } from "@/lib/trpc/client";

export type BoPhanSua = { id: string; name: string };

export function ThemBoPhan({
	khoa = false,
	sua,
	dangMo: moTuNgoai,
	doiMo: doiMoTuNgoai,
}: {
	khoa?: boolean;
	sua?: BoPhanSua;
	dangMo?: boolean;
	doiMo?: (mo: boolean) => void;
}) {
	const m = onboardingMessages(useLocale());
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const maTen = useId();

	const [moTrong, setMoTrong] = useState(false);
	const dangMo = moTuNgoai ?? moTrong;
	const doiMo = doiMoTuNgoai ?? setMoTrong;
	const [ten, setTen] = useState(sua?.name ?? "");
	const [loi, setLoi] = useState<string | null>(null);

	const tao = useMutation(trpc.onboarding.createDepartment.mutationOptions());
	const doi = useMutation(trpc.onboarding.updateDepartment.mutationOptions());

	const xong = async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.onboarding.listDepartments.queryKey(),
		});
		await queryClient.invalidateQueries({
			queryKey: trpc.onboarding.listSteps.queryKey(),
		});
		setTen("");
		doiMo(false);
	};

	return (
		<KhungTao
			nhanNut={sua ? undefined : m.settings.newDepartment}
			khoaNut={khoa}
			tieuDe={sua ? m.quanLy.suaBoPhan : m.tao.boPhan.title}
			dangMo={dangMo}
			doiMo={doiMo}
			sanSang={ten.trim() !== "" && !khoa}
			dangLuu={tao.isPending || doi.isPending}
			loi={loi}
			nhanLuu={m.tao.save}
			nhanHuy={m.tao.cancel}
			onLuu={() => {
				setLoi(null);
				const onError = (error: { message: string }) => setLoi(error.message);
				if (sua) {
					doi.mutate(
						{ id: sua.id, name: ten.trim() },
						{ onSuccess: xong, onError },
					);
					return;
				}
				tao.mutate({ name: ten.trim() }, { onSuccess: xong, onError });
			}}
		>
			<Field>
				<FieldLabel htmlFor={maTen}>{m.tao.boPhan.name}</FieldLabel>
				<Input
					id={maTen}
					value={ten}
					onChange={(e) => setTen(e.target.value)}
					autoComplete="off"
					translate="no"
				/>
			</Field>
		</KhungTao>
	);
}
