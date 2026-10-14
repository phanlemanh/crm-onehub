import { Badge } from "@crm/ui/components/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crm/ui/components/table";
import { cn } from "@crm/ui/lib/utils";
import type {
	DoanDoi,
	KhoiDoi,
	KieuKhoi,
	SoDoi,
} from "@crm/validation/tai-lieu-diff";
import { cva } from "class-variance-authority";
import { Fragment } from "react";

export type DiffTrangProps = {
	khoi: KhoiDoi[];
	nhanThem: string;
	nhanBo: string;
	nhanDaiSo: string;
	dai: SoDoi[];
};

type NhanDoan = { them: string; bo: string };

type NhomKhoi = { kieu: KieuKhoi; khoi: KhoiDoi[] };

const NGAN_O = " | ";

const KIEU_GOP = new Set<KieuKhoi>(["muc-so", "muc-cham", "hang-bang"]);

const doanDoiVariants = cva("", {
	variants: {
		loai: {
			them: "bg-diff-them/15 text-foreground underline decoration-diff-them underline-offset-4",
			bo: "text-muted-foreground line-through decoration-diff-bo",
		},
	},
});

const KHOI_CHU = {
	"tieu-de-2": "mt-4 font-semibold text-lg tracking-tight first:mt-0",
	"tieu-de-3": "mt-2 font-semibold text-base first:mt-0",
	doan: "text-pretty text-sm/7",
} as const;

const DANH_SACH =
	"space-y-1.5 pl-5 text-sm/7 marker:text-muted-foreground";

function NhanAn({ chu }: { chu: string }) {
	return (
		<span className="sr-only" translate="yes">
			{`${chu}: `}
		</span>
	);
}

function Doan({ d, nhan }: { d: DoanDoi; nhan: NhanDoan }) {
	if (d.loai === "them")
		return (
			<ins className={doanDoiVariants({ loai: "them" })}>
				<NhanAn chu={nhan.them} />
				{d.chu}
			</ins>
		);
	if (d.loai === "bo")
		return (
			<del className={doanDoiVariants({ loai: "bo" })}>
				<NhanAn chu={nhan.bo} />
				{d.chu}
			</del>
		);
	return <>{d.chu}</>;
}

function canCach(truoc: DoanDoi | undefined, sau: DoanDoi): boolean {
	if (!truoc) return false;
	const doiNhau =
		(truoc.loai === "bo" && sau.loai === "them") ||
		(truoc.loai === "them" && sau.loai === "bo");
	return doiNhau && !/\s$/.test(truoc.chu) && !/^\s/.test(sau.chu);
}

function CacDoan({ doan, nhan }: { doan: DoanDoi[]; nhan: NhanDoan }) {
	return doan.map((d, i) => (
		<Fragment key={`${i}-${d.loai}`}>
			{canCach(doan[i - 1], d) ? " " : null}
			<Doan d={d} nhan={nhan} />
		</Fragment>
	));
}

function tachO(doan: DoanDoi[]): DoanDoi[][] {
	const o: DoanDoi[][] = [[]];
	for (const d of doan) {
		d.chu.split(NGAN_O).forEach((phan, i) => {
			if (i > 0) o.push([]);
			if (phan !== "") o[o.length - 1]?.push({ loai: d.loai, chu: phan });
		});
	}
	return o;
}

function soO(k: KhoiDoi): number {
	return tachO(k.doan).length;
}

function cungBang(nhom: NhomKhoi, k: KhoiDoi): boolean {
	if (k.kieu !== "hang-bang") return true;
	const cuoi = nhom.khoi[nhom.khoi.length - 1];
	return cuoi === undefined || soO(cuoi) === soO(k);
}

function gomNhom(khoi: KhoiDoi[]): NhomKhoi[] {
	const ra: NhomKhoi[] = [];
	for (const k of khoi) {
		const cuoi = ra[ra.length - 1];
		if (
			cuoi &&
			cuoi.kieu === k.kieu &&
			KIEU_GOP.has(k.kieu) &&
			cungBang(cuoi, k)
		) {
			cuoi.khoi.push(k);
			continue;
		}
		ra.push({ kieu: k.kieu, khoi: [k] });
	}
	return ra;
}

function BangDoi({ hang, nhan }: { hang: KhoiDoi[]; nhan: NhanDoan }) {
	const [dau, ...con] = hang.map((h) => tachO(h.doan));
	return (
		<div className="overflow-hidden rounded-lg border">
			<Table>
				{dau ? (
					<TableHeader className="bg-muted">
						<TableRow>
							{dau.map((o, i) => (
								<TableHead className="text-muted-foreground" key={`${i}`}>
									<CacDoan doan={o} nhan={nhan} />
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
				) : null}
				<TableBody>
					{con.map((cot, i) => (
						<TableRow key={`${i}`}>
							{cot.map((o, j) => (
								<TableCell key={`${j}`}>
									<CacDoan doan={o} nhan={nhan} />
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

function Nhom({ nhom, nhan }: { nhom: NhomKhoi; nhan: NhanDoan }) {
	if (nhom.kieu === "hang-bang") return <BangDoi hang={nhom.khoi} nhan={nhan} />;
	if (nhom.kieu === "muc-so" || nhom.kieu === "muc-cham") {
		const DanhSach = nhom.kieu === "muc-so" ? "ol" : "ul";
		return (
			<DanhSach
				className={cn(
					DANH_SACH,
					nhom.kieu === "muc-so" ? "list-decimal" : "list-disc",
				)}
			>
				{nhom.khoi.map((k, i) => (
					<li className="pl-1" key={`${i}`}>
						<CacDoan doan={k.doan} nhan={nhan} />
					</li>
				))}
			</DanhSach>
		);
	}
	const [k] = nhom.khoi;
	if (!k) return null;
	const The =
		nhom.kieu === "tieu-de-2" ? "h2" : nhom.kieu === "tieu-de-3" ? "h3" : "p";
	return (
		<The className={KHOI_CHU[nhom.kieu]}>
			<CacDoan doan={k.doan} nhan={nhan} />
		</The>
	);
}

export function DiffTrang({
	khoi,
	nhanThem,
	nhanBo,
	nhanDaiSo,
	dai,
}: DiffTrangProps) {
	const nhan = { them: nhanThem, bo: nhanBo };
	return (
		<div className="flex min-w-0 flex-col gap-6">
			{dai.length > 0 ? (
				<div className="flex flex-col gap-2" data-dai-so="">
					<p className="font-medium text-sm">{nhanDaiSo}</p>
					<ul aria-label={nhanDaiSo} className="flex flex-wrap gap-2">
						{dai.map((s, i) => (
							<li key={`${i}-${s.truoc}-${s.sau}`}>
								<Badge translate="no" variant="outline">
									{`${s.truoc} → ${s.sau}`}
								</Badge>
							</li>
						))}
					</ul>
				</div>
			) : null}
			<div
				className="flex min-w-0 max-w-prose flex-col gap-4 break-words"
				data-diff-trang=""
				translate="no"
			>
				{gomNhom(khoi).map((nhom, i) => (
					<Nhom key={`${i}-${nhom.kieu}`} nhan={nhan} nhom={nhom} />
				))}
			</div>
		</div>
	);
}
