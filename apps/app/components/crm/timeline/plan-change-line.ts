import { formatDay } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import {
	type OnboardingActivityMeta,
	onboardingActivityMeta,
} from "@crm/validation/onboarding-activity";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { onboardingMessages } from "@/lib/messages/onboarding";

export function cauVet(meta: OnboardingActivityMeta, locale: Locale): string {
	const v = onboardingMessages(locale).vet;
	switch (meta.kind) {
		case "buoc.giao":
			return meta.den === null
				? dien(v.boGiao, { nhan: meta.nhan })
				: dien(v.giao, { nhan: meta.nhan, ten: meta.denTen ?? meta.den });
		case "buoc.xong":
			return dien(v.xong, { nhan: meta.nhan });
		case "buoc.boXong":
			return dien(v.boXong, { nhan: meta.nhan });
		case "buoc.doiHan":
			return dien(v.doiHan, {
				nhan: meta.nhan,
				tu: formatDay(meta.tu, locale),
				den: formatDay(meta.den, locale),
			});
		case "buoc.them":
			return dien(v.them, { nhan: meta.nhan });
		case "buoc.bo":
			return dien(v.bo, { nhan: meta.nhan });
		case "keHoach.doiCamTrich":
			return dien(v.doiCamTrich, { tu: meta.tuTen, den: meta.denTen });
		case "keHoach.dong":
			return v.dong;
		case "keHoach.moLai":
			return v.moLai;
	}
}

export function dongVet(meta: unknown, locale: Locale): string {
	const ket = onboardingActivityMeta.safeParse(meta);
	return ket.success
		? cauVet(ket.data, locale)
		: onboardingMessages(locale).vet.khongDoc;
}
