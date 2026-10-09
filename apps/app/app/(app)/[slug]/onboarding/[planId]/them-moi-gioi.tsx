"use client";

import { Combobox, type ComboboxOption } from "@crm/ui/components/combobox";
import { Field, FieldLabel } from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useSearchInput } from "@crm/ui/hooks/use-search-input";
import { hienThiSoDienThoai } from "@crm/validation/so-dien-thoai";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { contactName } from "@/components/crm/contact-name";
import { KhungTao } from "@/components/onboarding/khung-tao";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useTRPC } from "@/lib/trpc/client";

const SO_GOI_Y = 20;

export function ChonCaNhan({
	id,
	value,
	onValueChange,
	daTrongPheu,
}: {
	id: string;
	value: string;
	onValueChange: (next: string) => void;
	daTrongPheu: string[];
}) {
	const m = onboardingMessages(useLocale());
	const trpc = useTRPC();
	const [tim, setTim] = useState("");
	const [chu, setChu] = useSearchInput(tim, setTim);
	const [daChon, setDaChon] = useState<ComboboxOption | null>(null);

	const caNhan = useQuery({
		...trpc.contacts.list.queryOptions({ q: tim, pageSize: SO_GOI_Y }),
		placeholderData: (truoc) => truoc,
	});
	const luaChon: ComboboxOption[] = (caNhan.data?.rows ?? []).map((c) => {
		const daCo = daTrongPheu.includes(c.id);
		return {
			value: c.id,
			label: contactName(c),
			hint: daCo
				? m.tao.moiGioi.daTrongPheu
				: c.phone
					? hienThiSoDienThoai(c.phone)
					: (c.email ?? undefined),
			disabled: daCo,
		};
	});

	return (
		<Combobox
			id={id}
			value={value}
			onValueChange={(next) => {
				setDaChon(luaChon.find((o) => o.value === next) ?? null);
				onValueChange(next);
			}}
			options={luaChon}
			selectedOption={daChon?.value === value ? daChon : undefined}
			placeholder={m.tao.moiGioi.choose}
			searchPlaceholder={m.tao.moiGioi.search}
			empty={m.tao.moiGioi.none}
			search={chu}
			onSearchChange={setChu}
			stale={caNhan.isFetching || chu.trim() !== tim.trim()}
		/>
	);
}

export function ThemMoiGioi({
	planId,
	daTrongPheu,
}: {
	planId: string;
	daTrongPheu: string[];
}) {
	const m = onboardingMessages(useLocale());
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const maCaNhan = useId();

	const [dangMo, setDangMo] = useState(false);
	const [caNhan, setCaNhan] = useState("");
	const [loi, setLoi] = useState<string | null>(null);

	const ghi = useMutation(trpc.onboarding.upsertEnrollment.mutationOptions());

	return (
		<KhungTao
			nhanNut={m.hoSo.emptyFunnelAction}
			tieuDe={m.tao.moiGioi.title}
			dangMo={dangMo}
			doiMo={setDangMo}
			sanSang={caNhan !== ""}
			dangLuu={ghi.isPending}
			loi={loi}
			nhanLuu={m.tao.save}
			nhanHuy={m.tao.cancel}
			onLuu={() => {
				setLoi(null);
				ghi.mutate(
					{ planId, contactId: caNhan, source: "tay" },
					{
						onSuccess: async () => {
							await queryClient.invalidateQueries({
								queryKey: trpc.onboarding.listEnrollments.queryKey(),
							});
							setCaNhan("");
							setDangMo(false);
						},
						onError: (error) => setLoi(error.message),
					},
				);
			}}
		>
			<Field>
				<FieldLabel htmlFor={maCaNhan}>{m.tao.moiGioi.contact}</FieldLabel>
				<ChonCaNhan
					id={maCaNhan}
					value={caNhan}
					onValueChange={setCaNhan}
					daTrongPheu={daTrongPheu}
				/>
			</Field>
		</KhungTao>
	);
}
