"use client";

import Upload from "@carbon/icons-react/es/Upload";
import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { lyDoTuChoiTep, NguonKeoTha } from "@crm/ui/components/nguon-keo-tha";
import { Progress } from "@crm/ui/components/progress";
import { RadioGroup, RadioGroupItem } from "@crm/ui/components/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { chuanNfc, TAI_LIEU } from "@crm/validation/tai-lieu";
import {
	type DichNguon,
	KIEU_NGUON,
	type KieuNguonTep,
	NGUON,
} from "@crm/validation/tai-lieu-nguon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { type TaiLieuMessages, taiLieuMessages } from "@/lib/messages/tai-lieu";
import { duongNguon, duongTabNguon, TAI_LIEU_MAN } from "@/lib/tai-lieu-man";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import {
	donViDaChon,
	type LoiTaiLuaChon,
	type LuaChon,
	type TrangMoiChon,
	TruongTrangMoi,
	trangMoiMacDinh,
} from "./truong-trang-moi";

export type LuaChonTai = {
	toiId: string;
	chuTrang: LuaChon[];
	donVi: LuaChon[];
	trangDangDung: LuaChon[];
	loiTai?: LoiTaiLuaChon;
};

type LoaiDich = DichNguon["loai"];
type Buoc = "xin-cho" | "gui" | "nhan";

const BUOC: readonly Buoc[] = ["xin-cho", "gui", "nhan"];
const PHAN_TRAM = 100;
const MA_LOI_MAY_CHU = 500;

class GuiKhongXong extends Error {}

function laDich(v: string): v is LoaiDich {
	return v === "moi" || v === "cap-nhat";
}

function kieuTep(ten: string): KieuNguonTep | null {
	const thuong = ten.toLowerCase();
	return KIEU_NGUON.find((k) => thuong.endsWith(NGUON.duoi[k])) ?? null;
}

function kiemTep(tep: File, m: TaiLieuMessages["nguon"]["hop"]): string | null {
	if (lyDoTuChoiTep(tep, TAI_LIEU_MAN.nguon.chapNhan, NGUON.toiDaByte))
		return m.saiLoai;
	if (tep.size === 0) return m.rong;
	if (kieuTep(tep.name) === null) return m.saiLoai;
	return null;
}

export function NutTaiNguon({ luaChon }: { luaChon: LuaChonTai }) {
	const m = taiLieuMessages(useLocale()).nguon;
	const trpc = useTRPC();
	const router = useRouter();
	const url = useWorkspaceUrl();
	const trangThai = useQuery(trpc.taiLieuNguon.trangThai.queryOptions());
	const [mo, setMo] = useState(false);
	const coLyDo = trangThai.data?.bat === false || trangThai.isError;

	return (
		<>
			<Button
				aria-describedby={coLyDo ? TAI_LIEU_MAN.idNguonTat : undefined}
				data-tai-nguon=""
				disabled={trangThai.data?.bat !== true}
				onClick={() => setMo(true)}
				variant="outline"
			>
				<Icon icon={Upload} />
				{m.nutTai}
			</Button>
			<Dialog onOpenChange={setMo} open={mo}>
				<DialogContent data-hop-tai-nguon="" size="wide">
					<NoiDungHop
						dong={() => setMo(false)}
						luaChon={luaChon}
						xong={() => {
							setMo(false);
							router.push(url(duongTabNguon()));
						}}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}

function NoiDungHop({
	luaChon,
	xong,
	dong,
}: {
	luaChon: LuaChonTai;
	xong: () => void;
	dong: () => void;
}) {
	const t = taiLieuMessages(useLocale());
	const m = t.nguon.hop;
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const cache = useCrmCache();
	const url = useWorkspaceUrl();
	const ma = useId();
	const id = {
		ten: `${ma}-ten`,
		loiTen: `${ma}-loi-ten`,
		trang: `${ma}-trang`,
		loiTrang: `${ma}-loi-trang`,
		dichMoi: `${ma}-dich-moi`,
		dichCapNhat: `${ma}-dich-cap-nhat`,
	};
	const coTrangDangDung = luaChon.trangDangDung.length > 0;
	const [tep, setTep] = useState<File | null>(null);
	const [loiTep, setLoiTep] = useState<string | null>(null);
	const [baoChung, setBaoChung] = useState<string | null>(null);
	const [daCo, setDaCo] = useState<string | null>(null);
	const [dich, setDich] = useState<LoaiDich>("moi");
	const [ten, setTen] = useState("");
	const [loiTen, setLoiTen] = useState<string | null>(null);
	const [trangMoi, setTrangMoi] = useState<TrangMoiChon>(() =>
		trangMoiMacDinh(luaChon.toiId),
	);
	const [slug, setSlug] = useState("");
	const [loiTrang, setLoiTrang] = useState<string | null>(null);
	const [buoc, setBuoc] = useState<Buoc | null>(null);
	const huy = useRef<AbortController | null>(null);
	const oTen = useRef<HTMLInputElement>(null);
	const xinCho = useMutation(trpc.taiLieuNguon.xinCho.mutationOptions());
	const nhan = useMutation(trpc.taiLieuNguon.nhan.mutationOptions());
	const dangTai = buoc !== null;

	useEffect(() => () => huy.current?.abort(), []);

	const chon = (f: File) => {
		const loi = kiemTep(f, m);
		setDaCo(null);
		setBaoChung(null);
		setLoiTep(loi);
		setTep(loi ? null : f);
	};

	const kiemDich = (): DichNguon | null => {
		if (dich === "cap-nhat") {
			if (slug === "") {
				setLoiTrang(m.chuaChonTrang);
				return null;
			}
			return { loai: "cap-nhat", slug };
		}
		const tenSach = chuanNfc(ten).trim();
		const loi =
			tenSach.length < TAI_LIEU.ten.min
				? t.soan.tenTrong
				: tenSach.length > TAI_LIEU.ten.max
					? dien(t.soan.tenDai, { max: TAI_LIEU.ten.max })
					: null;
		setLoiTen(loi);
		if (loi) {
			oTen.current?.focus();
			return null;
		}
		return {
			loai: "moi",
			ten: tenSach,
			loaiTrang: trangMoi.loai,
			chuTrangId: trangMoi.chuTrang,
			departmentId: donViDaChon(trangMoi.donVi),
		};
	};

	const guiTep = async (f: File, kieu: KieuNguonTep, vao: DichNguon) => {
		const dieuKhien = new AbortController();
		huy.current = dieuKhien;
		setBaoChung(null);
		setDaCo(null);
		try {
			setBuoc("xin-cho");
			const cho = await xinCho.mutateAsync({
				tenTep: f.name,
				kichThuoc: f.size,
				kieu,
			});
			setBuoc("gui");
			const tra = await fetch(cho.url, {
				method: "PUT",
				body: f,
				headers: { "content-type": TAI_LIEU_MAN.nguon.kieuNoiDung[kieu] },
				signal: dieuKhien.signal,
			});
			if (!tra.ok) throw new GuiKhongXong();
			setBuoc("nhan");
			const kq = await nhan.mutateAsync({
				pathname: cho.pathname,
				phieu: cho.phieu,
				tenTep: f.name,
				dich: vao,
			});
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: trpc.taiLieuNguon.list.queryKey(),
				}),
				cache.taiLieu(),
			]);
			setBuoc(null);
			if (kq.trung) {
				setDaCo(kq.nguonId);
				return;
			}
			xong();
		} catch (loi) {
			setBuoc(null);
			if (dieuKhien.signal.aborted) {
				setBaoChung(m.daDung);
				return;
			}
			if (
				loi instanceof TRPCClientError &&
				loi.data?.httpStatus !== undefined &&
				loi.data.httpStatus < MA_LOI_MAY_CHU
			)
				setLoiTep(loi.message);
			else setBaoChung(m.khongXong);
		}
	};

	const taiLen = () => {
		if (dangTai || !tep) return;
		const loi = kiemTep(tep, m);
		const kieu = kieuTep(tep.name);
		if (loi || !kieu) {
			setLoiTep(loi ?? m.saiLoai);
			setTep(null);
			return;
		}
		const vao = kiemDich();
		if (!vao) return;
		void guiTep(tep, kieu, vao);
	};

	const phan = buoc ? ((BUOC.indexOf(buoc) + 1) / BUOC.length) * PHAN_TRAM : 0;

	return (
		<>
			<DialogHeader>
				<DialogTitle>{m.tieuDe}</DialogTitle>
				<DialogDescription>{m.moTa}</DialogDescription>
			</DialogHeader>
			<div className="flex min-w-0 flex-col gap-5">
				<NguonKeoTha
					chapNhan={TAI_LIEU_MAN.nguon.chapNhan}
					loi={loiTep ?? undefined}
					moTa={m.keoThaMoTa}
					nhan={m.keoTha}
					nutChon={m.keoThaNut}
					onChon={chon}
					onTuChoi={(f) => chon(f)}
					toiDaByte={NGUON.toiDaByte}
				/>
				{tep ? (
					<Item data-tep-da-chon="" size="sm" variant="outline">
						<ItemContent>
							<ItemTitle translate="no">{tep.name}</ItemTitle>
							<ItemDescription>{m.daChon}</ItemDescription>
						</ItemContent>
					</Item>
				) : null}
				<FieldSet>
					<FieldLegend variant="label">{m.dich}</FieldLegend>
					<RadioGroup
						disabled={dangTai}
						onValueChange={(v) => {
							if (laDich(v)) setDich(v);
						}}
						value={dich}
					>
						<Field orientation="horizontal">
							<RadioGroupItem id={id.dichMoi} value="moi" />
							<FieldLabel htmlFor={id.dichMoi}>{m.dichMoi}</FieldLabel>
						</Field>
						<Field
							data-disabled={coTrangDangDung ? undefined : true}
							orientation="horizontal"
						>
							<RadioGroupItem
								disabled={!coTrangDangDung}
								id={id.dichCapNhat}
								value="cap-nhat"
							/>
							<FieldLabel htmlFor={id.dichCapNhat}>{m.dichCapNhat}</FieldLabel>
						</Field>
					</RadioGroup>
					{coTrangDangDung ? null : (
						<FieldDescription>{m.khongCoTrang}</FieldDescription>
					)}
				</FieldSet>
				{dich === "moi" ? (
					<>
						<Field data-invalid={loiTen ? true : undefined}>
							<FieldLabel htmlFor={id.ten}>{t.soan.ten}</FieldLabel>
							<Input
								aria-describedby={loiTen ? id.loiTen : undefined}
								aria-invalid={loiTen ? true : undefined}
								autoComplete="off"
								disabled={dangTai}
								id={id.ten}
								name="ten"
								onChange={(e) => {
									setTen(e.target.value);
									if (loiTen) setLoiTen(null);
								}}
								ref={oTen}
								translate="no"
								value={ten}
							/>
							{loiTen ? <FieldError id={id.loiTen}>{loiTen}</FieldError> : null}
						</Field>
						<TruongTrangMoi
							chuTrang={luaChon.chuTrang}
							donVi={luaChon.donVi}
							giaTri={trangMoi}
							loiTai={luaChon.loiTai}
							onDoi={setTrangMoi}
							toiId={luaChon.toiId}
						/>
					</>
				) : (
					<Field data-invalid={loiTrang ? true : undefined}>
						<FieldLabel htmlFor={id.trang}>{m.trangCapNhat}</FieldLabel>
						<Select
							disabled={dangTai}
							onValueChange={(v) => {
								setSlug(v);
								setLoiTrang(null);
							}}
							value={slug}
						>
							<SelectTrigger
								aria-describedby={loiTrang ? id.loiTrang : undefined}
								aria-invalid={loiTrang ? true : undefined}
								id={id.trang}
							>
								<SelectValue placeholder={m.chonTrang} />
							</SelectTrigger>
							<SelectContent>
								{luaChon.trangDangDung.map((p) => (
									<SelectItem key={p.id} translate="no" value={p.id}>
										{p.ten}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{loiTrang ? (
							<FieldError id={id.loiTrang}>{loiTrang}</FieldError>
						) : null}
					</Field>
				)}
				<div aria-live="polite" className="flex min-w-0 flex-col gap-2">
					{buoc ? (
						<>
							<Progress aria-label={m.tienDo} value={phan} />
							<FieldDescription data-buoc-tai={buoc}>
								{m.buoc[buoc === "xin-cho" ? "xinCho" : buoc]}
							</FieldDescription>
						</>
					) : null}
					{baoChung ? (
						<Alert data-bao-tai="">
							<AlertDescription>{baoChung}</AlertDescription>
						</Alert>
					) : null}
					{daCo ? (
						<Alert data-nguon-da-co="">
							<AlertDescription>
								<span>
									{m.daCo}{" "}
									<Link href={url(duongNguon(daCo))} onClick={dong}>
										{m.moNguon}
									</Link>
								</span>
							</AlertDescription>
						</Alert>
					) : null}
				</div>
			</div>
			<DialogFooter>
				{dangTai ? (
					<Button
						disabled={buoc === "nhan"}
						onClick={() => huy.current?.abort()}
						variant="outline"
					>
						{m.huy}
					</Button>
				) : (
					<DialogClose asChild>
						<Button variant="outline">{m.huy}</Button>
					</DialogClose>
				)}
				<Button data-tai-len="" disabled={!tep || dangTai} onClick={taiLen}>
					{m.taiLen}
				</Button>
			</DialogFooter>
		</>
	);
}
