select
	to_char((a.at at time zone 'UTC') at time zone 'Asia/Ho_Chi_Minh', 'YYYY-MM') as thang,
	coalesce(sum(a."costUsd") filter (where a."tinhNang" = 'khac'), 0) as "khacUsd",
	coalesce(sum(a."costUsd"), 0) as "tongUsd",
	case
		when coalesce(sum(a."costUsd"), 0) = 0 then 0
		else round(
			coalesce(sum(a."costUsd") filter (where a."tinhNang" = 'khac'), 0)
				/ sum(a."costUsd"),
			4
		)
	end as "tyLe"
from "aiChiPhi" a
group by 1
order by 1;
