with viec as (
	select t.id, t.kind, t."startedAt" as luc
	from "agentTask" t
	where t.kind in ('okr-de-xuat', 'okr-tom-tat-tuan')
		and t."sessionId" is not null
		and t."startedAt" is not null
),
cau_hinh as (
	select v.id, c."aiOn", c."aiDeXuatPhamVi", c."aiTomTatPhamVi", c."aiTranThangUsd"
	from viec v
	left join lateral (
		select *
		from "okrProgramConfig" k
		where k."createdAt" <= v.luc
		order by k."createdAt" desc, k.version desc
		limit 1
	) c on true
),
chi as (
	select v.id, coalesce(sum(a."costUsd"), 0) as usd
	from viec v
	left join "aiChiPhi" a
		on a."tinhNang" like 'okr.%'
		and a.at < v.luc
		and a.at >= (
			date_trunc('month', (v.luc at time zone 'UTC') at time zone 'Asia/Ho_Chi_Minh')
				at time zone 'Asia/Ho_Chi_Minh'
		) at time zone 'UTC'
	group by v.id
)
select v.id, v.kind, v.luc as "startedAt", chi.usd as "chiTruocUsd", c."aiTranThangUsd"
from viec v
join cau_hinh c on c.id = v.id
join chi on chi.id = v.id
where c."aiOn" is not true
	or (v.kind = 'okr-de-xuat' and c."aiDeXuatPhamVi" = 'tat')
	or (v.kind = 'okr-tom-tat-tuan' and c."aiTomTatPhamVi" = 'tat')
	or chi.usd >= c."aiTranThangUsd";
