WITH tham_so AS (
  SELECT current_setting('okr.chu_ky') AS cycle_id
),
muc_tieu AS (
  SELECT o.id, o.status, o."hienThi"
  FROM "okrObjective" o
  CROSS JOIN tham_so t
  WHERE o."cycleId" = t.cycle_id
),
cong_bo AS (
  SELECT m.id, m."hienThi"
  FROM muc_tieu m
  WHERE m.status = 'cong-bo'
),
vet_duyet AS (
  SELECT v.id, v."objectiveId", v.action, v.at
  FROM "okrTrail" v
  JOIN muc_tieu m ON m.id = v."objectiveId"
  WHERE v.action IN ('gui-duyet', 'duyet', 'tra-lai', 'rut-duyet')
     OR (v.action = 'cong-bo' AND v.after ->> 'tuChoDuyet' = 'true')
),
cap AS (
  SELECT g."objectiveId", g.at AS gui_luc, x.action AS xu_ly, x.at AS xu_ly_luc
  FROM vet_duyet g
  LEFT JOIN LATERAL (
    SELECT d.action, d.at
    FROM vet_duyet d
    WHERE d."objectiveId" = g."objectiveId"
      AND d.action <> 'gui-duyet'
      AND (d.at, d.id) > (g.at, g.id)
    ORDER BY d.at, d.id
    LIMIT 1
  ) x ON true
  WHERE g.action = 'gui-duyet'
),
xu_ly AS (
  SELECT extract(epoch FROM (c.xu_ly_luc - c.gui_luc)) / 3600.0 AS gio
  FROM cap c
  WHERE c.xu_ly IN ('duyet', 'tra-lai')
),
doi_o AS (
  SELECT v.at, (v.after ->> 'duyetCongBo')::boolean AS bat
  FROM "okrTrail" v
  WHERE v.action = 'cau-hinh'
    AND v.before ->> 'duyetCongBo' IS NOT NULL
    AND v.after ->> 'duyetCongBo' IS NOT NULL
    AND v.before ->> 'duyetCongBo' <> v.after ->> 'duyetCongBo'
),
tat AS (
  SELECT t.at, (SELECT max(b.at) FROM doi_o b WHERE b.bat AND b.at < t.at) AS bat_luc
  FROM doi_o t
  WHERE NOT t.bat
)
SELECT
  (SELECT count(*)::int FROM cong_bo WHERE "hienThi" = 'gioi-han') AS "gioiHan",
  (SELECT count(*)::int FROM cong_bo) AS "congBo",
  (SELECT count(*)::int FROM cap) AS "guiDuyet",
  (SELECT count(*)::int FROM xu_ly) AS "capXuLy",
  (
    SELECT round((percentile_cont(0.5) WITHIN GROUP (ORDER BY gio))::numeric, 1)::float8
    FROM xu_ly
  ) AS "trungViGioCho",
  (SELECT count(*)::int FROM xu_ly WHERE gio <= 120) AS "xuLyTrong5Ngay",
  (
    SELECT count(*)::int
    FROM tat
    WHERE bat_luc IS NOT NULL
      AND at - bat_luc <= interval '14 days'
  ) AS "tatTrongHaiTuan";
