"use client";

import LogoSlack from "@carbon/icons-react/es/LogoSlack";
import { Badge } from "@crm/ui/components/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardPanel,
	CardTitle,
} from "@crm/ui/components/card";
import { Icon } from "@crm/ui/components/icon";
import {
	LOI_CHAO,
	LOI_CHAO_TRAN,
	NHOM_SLACK,
	NHOM_SLACK_TRAN,
	type NhomSlackMau,
	TRAN_TOI_DA,
} from "./du-lieu";

type NhomDaCat = { nhom: NhomSlackMau[]; conLai: number };

function catToiDa(nhom: NhomSlackMau[], toiDa: number): NhomDaCat {
	const tong = nhom.reduce((n, g) => n + g.dong.length, 0);
	const daCat = nhom.reduce<{ ket: NhomSlackMau[]; con: number }>(
		(acc, g) => {
			const lay = g.dong.slice(0, acc.con);
			return {
				ket: lay.length > 0 ? [...acc.ket, { ...g, dong: lay }] : acc.ket,
				con: acc.con - lay.length,
			};
		},
		{ ket: [], con: toiDa },
	);
	return { nhom: daCat.ket, conLai: Math.max(tong - toiDa, 0) };
}

function LienKet({ children }: { children: string }) {
	return <span className="text-primary underline">{children}</span>;
}

export function TinSlack({ tran }: { tran: boolean }) {
	const { nhom, conLai } = catToiDa(
		tran ? NHOM_SLACK_TRAN : NHOM_SLACK,
		TRAN_TOI_DA,
	);

	return (
		<Card className="max-w-xl">
			<CardHeader>
				<CardTitle>Bản xem trước tin Slack</CardTitle>
				<CardDescription>
					Tin riêng gửi lúc 08:30 từ bot CRM — chưa phải giao diện của app
				</CardDescription>
				<CardAction>
					<Badge variant="secondary">
						<Icon icon={LogoSlack} />
						Slack
					</Badge>
				</CardAction>
			</CardHeader>
			<CardPanel>
				<article
					aria-label="Nội dung tin Slack"
					className="flex flex-col gap-3 p-4 text-sm"
					data-tin-slack={tran ? "tran" : "du"}
				>
					<p>{tran ? LOI_CHAO_TRAN : LOI_CHAO}</p>
					{nhom.map((g) => (
						<section className="flex flex-col gap-1" key={g.ten}>
							<h3 className="font-semibold">{g.ten}</h3>
							<ul className="flex flex-col gap-0.5">
								{g.dong.map((d) => (
									<li key={`${g.ten}-${d.congTy}-${d.goiY}`}>
										• <span translate="no">{d.congTy}</span> · {d.goiY} —{" "}
										<LienKet>mở kế hoạch</LienKet>
									</li>
								))}
							</ul>
						</section>
					))}
					{conLai > 0 ? (
						<p data-tran={conLai}>
							và {conLai} việc nữa — <LienKet>mở tổng quan</LienKet>
						</p>
					) : null}
				</article>
			</CardPanel>
		</Card>
	);
}
