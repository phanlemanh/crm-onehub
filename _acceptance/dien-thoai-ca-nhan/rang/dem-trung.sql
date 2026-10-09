with so as (
  select id,
    case
      when d ~ '^84[0-9]{9,10}$' then substr(d, 3)
      when d ~ '^0[0-9]{9,10}$' then substr(d, 2)
      else d
    end as quoc_noi
  from (
    select id, regexp_replace(phone, '[^0-9]', '', 'g') as d
    from contact
    where phone is not null and "archivedAt" is null
  ) t
  where d <> ''
)
select count(*) as nhom_trung, coalesce(sum(n), 0) as nguoi_trong_nhom
from (select quoc_noi, count(*) as n from so group by quoc_noi having count(*) > 1) g;
