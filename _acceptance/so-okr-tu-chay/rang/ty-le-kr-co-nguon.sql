WITH tham_so AS (
  SELECT
    current_setting('okr.chu_ky') AS chu_ky,
    string_to_array(replace(current_setting('okr.bo_phan'), ' ', ''), ',') AS bo_phan
),
kr AS (
  SELECT k.id, k.source, n.loai AS loai_may
  FROM "okrKeyResult" k
  JOIN "okrObjective" o ON o.id = k."objectiveId"
  CROSS JOIN tham_so t
  LEFT JOIN department d ON d.id = o."departmentId"
  LEFT JOIN "orgPlacement" p ON p."userId" = o."personUserId"
  LEFT JOIN department dp ON dp.id = p."primaryDepartmentId"
  LEFT JOIN "okrNguonKr" n ON n."keyResultId" = k.id
  WHERE o."cycleId" = t.chu_ky
    AND o.status = 'cong-bo'
    AND coalesce(o."divisionId", d."divisionId", dp."divisionId") = ANY (t.bo_phan)
),
do_canh AS (
  SELECT id FROM kr WHERE source = 'tay' AND loai_may = 'crm'
),
chup_dau AS (
  SELECT c."keyResultId", min(c."chupLuc") AS luc
  FROM "okrSoChup" c
  JOIN do_canh dc ON dc.id = c."keyResultId"
  WHERE c.nguon = 'crm'
  GROUP BY c."keyResultId"
),
cap_nhat AS (
  SELECT
    ci.value,
    (
      SELECT c."giaTri"
      FROM "okrSoChup" c
      WHERE c."keyResultId" = ci."keyResultId"
        AND c.nguon = 'crm'
        AND c."chupLuc" <= ci."createdAt"
        AND c.ngay < ((ci."createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
      ORDER BY c.ngay DESC, c."chupLuc" DESC
      LIMIT 1
    ) AS so_may
  FROM "okrCheckIn" ci
  JOIN chup_dau cd ON cd."keyResultId" = ci."keyResultId"
  WHERE ci."createdAt" > cd.luc
)
SELECT
  (SELECT count(*) FILTER (WHERE source = 'crm') FROM kr) || '/' || (SELECT count(*) FROM kr) AS hieu_luc,
  (SELECT count(*) FROM do_canh) || '/' || (SELECT count(*) FROM kr) AS do_canh,
  (SELECT count(*) FILTER (WHERE value = so_may) FROM cap_nhat) || '/' || (SELECT count(*) FROM cap_nhat) AS nhan_so_may;
