-- N0 — truy vấn chỉ-đọc trên production (máy soạn 27/09, chủ kho chạy).
--
-- Chạy ba dòng (từ máy có quyền đọc DB production; máy soạn không đọc khoá này):
--   export PROD_DB='<chuỗi kết nối Neon production, vai chỉ-đọc nếu có>'
--   psql "$PROD_DB" -v ON_ERROR_STOP=1 -f docs/reports/2026-09-26-tro-ly-okr/N0-truy-van-production.sql > docs/reports/2026-09-26-tro-ly-okr/N0-ket-qua-production.txt
--   unset PROD_DB
--
-- Cả tệp chạy trong một giao dịch READ ONLY: câu nào lỡ ghi thì Postgres từ chối.
-- Không câu nào đọc nội dung câu hỏi, câu trả lời, tên Mục tiêu hay ghi chú — chỉ đếm và cộng số.
-- Nếu báo «relation "zaloHoi" does not exist» thì production chưa có bảng của PR #158:
-- xoá dòng left join "zaloHoi" trong mục 1 (và nhánh zalo của hai câu case) rồi chạy lại.

begin transaction read only;
set local statement_timeout = '120s';

\echo '== 0. Model đang đặt cho tác tử gốc (trống = zai/glm-5.2-fast)'
select coalesce("agentModelId", '(trống → zai/glm-5.2-fast)') as model_goc,
       "agentModelContextWindow" as cua_so
from "appSetting";

\echo '== 1. Tiền 30 ngày theo kênh · purpose · loại việc (step.completed của phiên gốc)'
with buoc as (
  select e."sessionId",
         e."conversationId",
         nullif(e.data->'usage'->>'costUsd', '')::numeric as usd,
         nullif(e.data->'usage'->>'inputTokens', '')::bigint as vao,
         nullif(e.data->'usage'->>'cacheReadTokens', '')::bigint as cache,
         nullif(e.data->'usage'->>'outputTokens', '')::bigint as ra
  from "agentEvent" e
  where e.type = 'step.completed'
    and e."emittedAt" >= now() - interval '30 days'
),
phan_loai as (
  select b.*,
         case
           when t.kind is not null then 'crm'
           when r.id is not null then 'crm'
           when z.id is not null then 'zalo'
           when c.id is not null or b."conversationId" is not null then 'eve'
           else 'khong-ro'
         end as kenh,
         case
           when t.kind is not null then 'research'
           when r.id is not null then 'team-agent'
           when z.id is not null then 'zalo'
           when c.kind = 'BUILDER' or b."conversationId" is not null then 'builder'
           when c.id is not null then 'hoi-dap-tab-agent'
           else 'khong-ro'
         end as purpose,
         coalesce(t.kind, '-') as loai_viec
  from buoc b
  left join lateral (
    select kind from "agentTask" where "sessionId" = b."sessionId" limit 1
  ) t on true
  left join "agentRun" r on r."sessionId" = b."sessionId"
  left join lateral (
    select id from "zaloHoi" where "sessionId" = b."sessionId" limit 1
  ) z on true
  left join "agentConversation" c on c."sessionId" = b."sessionId"
)
select kenh, purpose, loai_viec,
       count(distinct "sessionId") as so_phien,
       count(*) as so_buoc,
       round(sum(usd), 4) as usd_30_ngay,
       round(sum(usd) / nullif(count(distinct "sessionId"), 0), 4) as usd_moi_phien,
       sum(vao) as token_vao,
       sum(cache) as token_cache,
       sum(ra) as token_ra,
       round(100.0 * sum(cache) / nullif(sum(vao), 0), 1) as phan_tram_cache
from phan_loai
group by rollup ((kenh, purpose, loai_viec))
order by usd_30_ngay desc nulls last;

\echo '== 1b. Tiền theo ngày (30 ngày), để thấy đỉnh'
select date_trunc('day', "emittedAt")::date as ngay,
       round(sum(nullif(data->'usage'->>'costUsd', '')::numeric), 4) as usd,
       count(*) as so_buoc
from "agentEvent"
where type = 'step.completed' and "emittedAt" >= now() - interval '30 days'
group by 1 order by 1;

\echo '== 2. Phiên con (subagent) 30 ngày — tiền của chúng KHÔNG có trong step.completed ở trên'
\echo '   subagent.called không bao giờ vào agentEvent (N0 đo: 0 dòng sau 7 lần gọi); đếm qua action.result.'
select data->'result'->>'subagentName' as subagent,
       count(*) as so_phien_con,
       count(distinct "sessionId") as so_phien_cha,
       count(*) filter (where (data->'result'->>'isError')::boolean) as so_loi,
       sum(nullif(data->'result'->'usage'->>'inputTokens', '')::bigint) as token_vao_con,
       sum(nullif(data->'result'->'usage'->>'cacheReadTokens', '')::bigint) as token_cache_con,
       sum(nullif(data->'result'->'usage'->>'outputTokens', '')::bigint) as token_ra_con
from "agentEvent"
where type = 'action.result'
  and data->'result'->>'kind' = 'subagent-result'
  and "emittedAt" >= now() - interval '30 days'
group by 1 order by 2 desc;

\echo '== 2c. So với AgentRun.costUsd (chỗ nghi đếm thiếu)'
select count(*) as so_luot_tac_nhan,
       round(sum("costUsd"), 4) as usd_ghi_trong_agent_run,
       count(*) filter (where "costUsd" is null) as luot_khong_co_tien
from "agentRun"
where "createdAt" >= now() - interval '30 days';

\echo '== 2d. Hỏi CRM qua Zalo 30 ngày'
select "ketQua" as ket_qua, count(*) as so_cau,
       count(distinct "crmUserId") as so_nguoi,
       sum("tokenVao") as token_vao, sum("tokenRa") as token_ra
from "zaloHoi"
where "hoiLuc" >= now() - interval '30 days'
group by rollup (1) order by 2 desc;

\echo '== 3. Thành viên workspace theo vai'
select role as vai, count(*) as so_nguoi
from member group by rollup (1) order by 2 desc;

\echo '== 3b. Người dùng OKR (đã từng: phụ trách Mục tiêu, phụ trách KR, tham gia, hoặc ghi Cập nhật tuần)'
with nguoi as (
  select "ownerUserId" as u, 'phu-trach-muc-tieu' as cach from "okrObjective" where "droppedAt" is null
  union all select "personUserId", 'muc-tieu-ca-nhan' from "okrObjective" where "personUserId" is not null
  union all select "ownerUserId", 'phu-trach-kr' from "okrKeyResult"
  union all select "userId", 'tham-gia' from "okrParticipant"
  union all select "authorUserId", 'ghi-cap-nhat-tuan' from "okrCheckIn"
)
select cach, count(distinct u) as so_nguoi from nguoi group by rollup (cach) order by 2 desc;

\echo '== 3c. Đơn vị: tổng trong cây tổ chức và số đơn vị đã có Mục tiêu'
select 'phong-ban' as loai,
       (select count(*) from department where "archivedAt" is null) as tong,
       (select count(distinct "departmentId") from "okrObjective" where "departmentId" is not null and "droppedAt" is null) as co_muc_tieu
union all
select 'bo-phan',
       (select count(*) from division where "archivedAt" is null),
       (select count(distinct "divisionId") from "okrObjective" where "divisionId" is not null and "droppedAt" is null);

\echo '== 3d. Mục tiêu theo cấp và trạng thái (không đọc tên)'
select level as cap, status as trang_thai, count(*) as so_muc_tieu
from "okrObjective" where "droppedAt" is null
group by rollup ((level, status)) order by 1 nulls last, 2;

\echo '== 3e. Người trong cây tổ chức (có vị trí chính)'
select count(*) as co_phong_ban_chinh from "orgPlacement" where "primaryDepartmentId" is not null;

\echo '== 4. Ban lãnh đạo mang vai quản trị'
\echo '   «Ban lãnh đạo» không phải một Đơn vị trong dữ liệu; câu này lấy trưởng bộ phận làm đại diện.'
select m.role as vai,
       count(distinct d."headUserId") as so_truong_bo_phan
from division d
join member m on m."userId" = d."headUserId"
where d."archivedAt" is null
group by rollup (m.role) order by 2 desc;

select count(*) filter (where role in ('owner', 'admin')) as so_nguoi_vai_quan_tri,
       count(*) filter (where role = 'owner') as so_chu
from member;

rollback;
