"use client";

import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { useLocale } from "@crm/ui/components/locale-provider";
import { formatDay } from "@crm/ui/lib/format";
import { okrKhepMessages } from "@/lib/messages/okr-khep";
import { useChuKy } from "./chon-chu-ky";

export function DaiKy() {
	const locale = useLocale();
	const mk = okrKhepMessages(locale);
	const { cycles, currentId } = useChuKy();
	const ky = cycles.data?.cycles.find((c) => c.id === currentId) ?? null;
	if (ky === null) return null;
	if (ky.cuaSoRa !== null) {
		const den = formatDay(ky.cuaSoRa.denNgay, locale);
		return (
			<Alert variant="warning" data-dai-ky="ra">
				<AlertTitle>{mk.dai.ra(den)}</AlertTitle>
				<AlertDescription>{mk.dai.raMoTa}</AlertDescription>
			</Alert>
		);
	}
	if (ky.phase === "cham-diem")
		return (
			<Alert variant="warning" data-dai-ky="cham">
				<AlertTitle>
					<span translate="no">{ky.name}</span> {mk.dai.cham}
				</AlertTitle>
				<AlertDescription>{mk.dai.chamMoTa}</AlertDescription>
			</Alert>
		);
	if (ky.phase === "da-dong")
		return (
			<Alert data-dai-ky="dong">
				<AlertTitle>
					<span translate="no">{ky.name}</span> {mk.dai.dong}
				</AlertTitle>
				<AlertDescription>{mk.dai.dongMoTa}</AlertDescription>
			</Alert>
		);
	return null;
}
