"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@crm/ui/components/field";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { Switch } from "@crm/ui/components/switch";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useState } from "react";
import {
	PageShell,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { PHONG, VIEC_SANG } from "./du-lieu";

export type HinhNhac = "cong-tac" | "tin-mau";

function CongTacDong() {
	const [bat, setBat] = useState(true);
	return (
		<Field orientation="horizontal">
			<FieldContent>
				<FieldLabel htmlFor="dong-tom-tat">
					Dòng Tóm tắt tuần của Trợ lý OKR
				</FieldLabel>
				<FieldDescription>
					Mỗi tuần một dòng, khi phòng bạn có tóm tắt mới
				</FieldDescription>
			</FieldContent>
			<Switch
				checked={bat}
				data-cong-tac="dong-tom-tat"
				id="dong-tom-tat"
				onCheckedChange={setBat}
			/>
		</Field>
	);
}

function TinMau() {
	return (
		<Card data-tin-mau>
			<CardHeader>
				<CardTitle>Bản xem trước tin nhắc sáng thứ Ba 13/10</CardTitle>
				<CardDescription>
					Chỉ để thấy chỗ đứng của dòng tóm tắt — chưa phải giao diện của app.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<article
					aria-label="Nội dung tin nhắc buổi sáng"
					className="flex flex-col gap-3 text-sm"
				>
					<p>
						Chào anh <span translate="no">{PHONG.truong.ten}</span>, sáng nay có
						3 việc.
					</p>
					{VIEC_SANG.map((g) => (
						<section className="flex flex-col gap-1" key={g.nhom}>
							<h3 className="font-medium">{g.nhom}</h3>
							<ul className="flex flex-col gap-0.5">
								{g.dong.map((d) => (
									<li key={d} translate="no">
										• {d}
									</li>
								))}
							</ul>
						</section>
					))}
					<section className="flex flex-col gap-1 border-t pt-3">
						<h3 className="font-medium">Trợ lý OKR</h3>
						<p data-dong-tom-tat>
							• Tóm tắt tuần Phòng {PHONG.ten} · 3 KR đáng bàn —{" "}
							<span className="text-primary underline">mở</span>
						</p>
					</section>
				</article>
			</CardContent>
		</Card>
	);
}

export function NhacSang({ hinh }: { hinh: HinhNhac }) {
	return (
		<PageShell width="page">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Nhắc buổi sáng</PageShellTitle>
					<PageShellDescription>
						Chỉ áp cho bạn. Mỗi sáng 08:30 máy gom việc cần để ý và nhắn bạn ở
						một kênh.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<div className="flex flex-col gap-6">
				<section aria-labelledby="khoi-zalo" className="flex flex-col gap-3">
					<h2 className="font-medium text-sm" id="khoi-zalo">
						Zalo của bạn
					</h2>
					<StatusIndicator
						className="text-sm"
						label={
							<>
								Đã nối · <span translate="no">Hùng Trần</span>
							</>
						}
						tone="success"
					/>
				</section>
				<section
					aria-labelledby="khoi-kenh"
					className="flex flex-col gap-3 border-t pt-5"
				>
					<h2 className="font-medium text-sm" id="khoi-kenh">
						Nhận nhắc việc qua
					</h2>
					<ToggleGroup
						aria-label="Nhận nhắc việc qua"
						spacing={0}
						type="single"
						value="AUTO"
						variant="outline"
					>
						<ToggleGroupItem value="AUTO">Tự động</ToggleGroupItem>
						<ToggleGroupItem value="ZALO">Zalo</ToggleGroupItem>
						<ToggleGroupItem value="SLACK">Slack</ToggleGroupItem>
					</ToggleGroup>
					<p className="text-sm">Zalo khi bạn đã nối Zalo, không thì Slack.</p>
				</section>
				<section
					aria-labelledby="khoi-tro-ly"
					className="flex flex-col gap-3 border-t pt-5"
					data-khoi="dong-tro-ly-okr"
				>
					<h2 className="font-medium text-sm" id="khoi-tro-ly">
						Trợ lý OKR
					</h2>
					<CongTacDong />
				</section>
				{hinh === "tin-mau" ? <TinMau /> : null}
			</div>
		</PageShell>
	);
}
